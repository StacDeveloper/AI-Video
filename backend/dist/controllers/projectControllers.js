import * as Sentry from "@sentry/node";
import { prisma } from "../config/prisma.js";
import cloudinary from "../config/cloudinary.js";
import { HarmBlockThreshold, HarmCategory } from "@google/genai";
import fs from "fs";
import path from "path";
import ai from "../config/ai.js";
import axios from "axios";
const loadImage = (path, mimeType) => {
    return {
        inlineData: {
            data: fs.readFileSync(path).toString('base64'),
            mimeType
        }
    };
};
// create project
export const createProject = async (req, res) => {
    let temprojectId;
    const { userId } = req.auth();
    let isCreditDeducted = false;
    try {
        const { name = "New Project", aspectRatio, userPrompt, productName, productDescription, targetLength = 5 } = req.body;
        const images = req.files;
        if (images.length < 2 || productName) {
            return res.status(400).json({ success: false, message: "Please upload atleast 2 images" });
        }
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user || user.credits < 5) {
            return res.status(400).json({ success: false, message: "You do not have enough credits" });
        }
        else {
            // deduct credits
            const updateCredits = await prisma.user.update({
                where: { id: userId },
                data: {
                    credits: { decrement: 5 }
                }
            }).then(() => { isCreditDeducted = true; });
            try {
                let uploadedImages = await Promise.all(images.map(async (i) => {
                    let result = await cloudinary.uploader.upload(i, {
                        resource_type: "image",
                    });
                    return result.secure_url;
                }));
                const project = await prisma.project.create({
                    data: {
                        name,
                        userId,
                        productName,
                        productDescription,
                        userPrompt,
                        aspectRatio,
                        targetLength: parseInt(targetLength),
                        isGenerating: true
                    }
                });
                temprojectId = project.id;
                const model = "gemini-3-pro-image-preview";
                const generationConfig = {
                    maxOutputTokens: 32768,
                    temperature: 1,
                    topP: 0.85,
                    responseModalities: ['IMAGE'],
                    imageConfig: {
                        aspectRatio: aspectRatio || '9:16',
                        imageSize: '1K'
                    },
                    safetySettings: [
                        {
                            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                            threshold: HarmBlockThreshold.OFF,
                        },
                        {
                            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                            threshold: HarmBlockThreshold.OFF,
                        },
                        {
                            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                            threshold: HarmBlockThreshold.OFF,
                        },
                        {
                            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                            threshold: HarmBlockThreshold.OFF,
                        }
                    ]
                };
                // images to base64 for ai
                const ima1base64 = loadImage(images[0].path, images[0].mimeType);
                const ima2base64 = loadImage(images[1].path, images[1].mimeType);
                const prompt = {
                    text: `Combine the person and product into a realistic photo. Make the person naturally hold or use the product. Match lighting, shadows, scale and perspective. Make the person stand in professional studio lighting. Output ecommerce-quality photo realistic imagery ${userPrompt}`
                };
                // Generate image from ai model
                const response = await ai.models.generateContent({
                    model: model,
                    contents: [ima1base64, ima2base64, prompt],
                    config: generationConfig
                });
                // check if the response is valid
                if (!response?.candidates?.[0]?.content?.parts) {
                    throw new Error('Unexpected Response');
                }
                const parts = response?.candidates[0].content?.parts;
                let finalBuffer = null;
                for (let part of parts) {
                    if (part.inlineData) {
                        finalBuffer = Buffer.from(part.inlineData.data, 'base64');
                    }
                }
                if (!finalBuffer) {
                    throw new Error('Failed to generate image');
                }
                const base64Image = `data:image/png;base64,${finalBuffer.toString('base64')}`;
                const uploadResult = await cloudinary.uploader.upload(base64Image, {
                    resource_type: 'image',
                });
                await prisma.project.update({
                    where: { id: project.id },
                    data: {
                        generatedImage: uploadResult.secure_url,
                        isGenerating: false
                    }
                });
                res.status(200).json({ success: true, message: project.id });
            }
            catch (error) {
                if (temprojectId) {
                    // update project status and error message
                    await prisma.project.update({
                        where: { id: temprojectId },
                        data: {
                            isGenerating: false,
                            error: error.message
                        }
                    });
                }
                if (isCreditDeducted) {
                    // add credit back
                    await prisma.user.update({
                        where: { id: userId },
                        data: {
                            credits: { increment: 5 }
                        }
                    });
                }
                Sentry.captureException(error);
                res.status(500).json({ success: false, message: error.message });
            }
        }
    }
    catch (error) {
        console.log(error.message || error.code);
        Sentry.captureException(error);
        res.status(500).json({ success: false, message: error.message });
    }
};
// createVideo  
export const createVideo = async (req, res) => {
    const { userId } = req.auth();
    const { projectId } = req.body;
    let isCreditDeducted = false;
    const user = await prisma.user.findUnique({
        where: { id: userId }
    });
    if (!user || user.credits < 10) {
        return res.status(400).json({ success: false, message: "User not found or You do not have enough credits" });
    }
    const deductCredits = await prisma.user.update({
        where: { id: userId },
        data: {
            credits: { decrement: 10 }
        }
    }).then(() => { isCreditDeducted = true; });
    try {
        const project = await prisma.project.findUnique({
            where: { id: projectId, userId },
            include: { user: true }
        });
        if (!project || project.isGenerating) {
            return res.status(404).json({ success: false, message: "Generation is in progress" });
        }
        if (project.generatedVideo) {
            return res.status(404).json({ success: false, message: "Video already generated" });
        }
        await prisma.project.update({
            where: { id: projectId },
            data: {
                isGenerating: true
            }
        });
        const prompt = `make the person showcase the product which is ${project.productName} ${project.productDescription && `and Product Description:${project.productDescription}`} `;
        const model = 'veo-3.1-generate-preview';
        if (!project.generatedImage) {
            throw new Error('Generated Image Not Found');
        }
        const image = await axios.get(project.generatedImage, {
            responseType: 'arraybuffer'
        });
        const imageBytes = Buffer.from(image.data);
        let operation = await ai.models.generateVideos({
            model,
            prompt,
            image: {
                imageBytes: imageBytes.toString('base64'),
                mimeType: 'image/png'
            },
            config: {
                aspectRatio: project?.aspectRatio || '9:16',
                numberOfVideos: 1,
                resolution: '720p'
            }
        });
        while (!operation.done) {
            console.log('Waiting for video generation to complete...');
            await new Promise((resolve) => setTimeout(resolve, 10000));
            operation = await ai.operations.getVideosOperation({
                operation: operation
            });
        }
        const fileName = `${userId}-${Date.now()}.mp4`;
        const filePath = path.join('videos', fileName);
        // create the iamge directory if it doesnot exist
        fs.mkdirSync('videos', { recursive: true });
        if (!operation.response.generatedVideo) {
            throw new Error(operation.response.raiMediaFilteredReasons[0]);
        }
        // download the video
        await ai.files.download({
            file: operation.response.generatedVideos[0].video,
            downloadPath: filePath
        });
        const uploadResult = await cloudinary.uploader.upload(filePath, {
            resource_type: 'video'
        });
        await prisma.project.update({
            where: { id: projectId, userId },
            data: {
                generatedVideo: uploadResult.secure_url,
                isGenerating: false
            }
        });
        // remove video file from disk after upload
        fs.unlinkSync(filePath);
        return res.status(200).json({ success: true, message: "Video Generated Successfully", videoUrl: uploadResult.secure_url });
    }
    catch (error) {
        // update project status and error message
        await prisma.project.update({
            where: { id: projectId, userId },
            data: {
                isGenerating: false,
                error: error.message
            }
        });
        if (isCreditDeducted) {
            // add credit back
            await prisma.user.update({
                where: { id: userId },
                data: {
                    credits: { increment: 10 }
                }
            });
        }
        console.log(error.message || error.code);
        Sentry.captureException(error);
        res.status(500).json({ success: false, message: error.message });
    }
};
// getAllPublishedProject
export const getAllPublishedProject = async (req, res) => {
    try {
        const projects = await prisma.project.findMany({
            where: { isPublished: true }
        });
        res.json({ success: true, projects });
    }
    catch (error) {
        console.log(error.message || error.code);
        Sentry.captureException(error);
        res.status(500).json({ success: false, message: error.message });
    }
};
// deleteProject
export const deleteProject = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { projectId } = req.params;
        const project = await prisma.project.findUnique({
            where: { id: projectId, userId }
        });
        if (!project) {
            return res.status(404).json({ success: false, message: "Project not found" });
        }
        await prisma.project.delete({
            where: { id: projectId }
        });
        return res.status(200).json({ success: true, message: "Project Deleted" });
    }
    catch (error) {
        console.log(error.message || error.code);
        Sentry.captureException(error);
        res.status(500).json({ success: false, message: error.message });
    }
};
