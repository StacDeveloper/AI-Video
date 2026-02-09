import { Request, Response } from "express"
import * as Sentry from "@sentry/node"
import { prisma } from "../config/prisma.js";
import cloudinary from "../config/cloudinary.js";



// create project
export const createProject = async (req: Request, res: Response) => {
    let temprojectId: string;
    const { userId } = req.auth()
    let isCreditDeducted: boolean = false
    try {
        const { name = "New Project", aspectRatio, userPrompt, productName, productDescription, targetLength = 5 } = req.body

        const images: any = req.files

        if (images.length < 2 || productName) {
            return res.status(400).json({ success: false, message: "Please upload atleast 2 images" })
        }

        const user = await prisma.user.findUnique({
            where: { id: userId }
        })

        if (!user || user.credits < 5) {
            return res.status(400).json({ success: false, message: "You do not have enough credits" })
        } else {
            // deduct credits
            const updateCredits = await prisma.user.update({
                where: { id: userId },
                data: {
                    credits: { decrement: 5 }
                }
            }).then(() => { isCreditDeducted = true })

            try {
                let uploadedImages = await Promise.all(
                    images.map(async (i: any) => {
                        let result = await cloudinary.uploader.upload(i, {
                            resource_type: "image",
                        })
                        return result.secure_url
                    })
                )

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
                })

                temprojectId = project.id   

            } catch (error) {

            }



        }




    } catch (error: any) {
        console.log(error.message || error.code)
        Sentry.captureException(error)
        res.status(500).json({ success: false, message: error.message })
    }
}
// createVideo  
export const createVideo = async (req: Request, res: Response) => {
    try {

    } catch (error: any) {
        console.log(error.message || error.code)
        Sentry.captureException(error)
        res.status(500).json({ success: false, message: error.message })
    }
}
// getAllPublishedProject
export const getAllPublishedProject = async (req: Request, res: Response) => {
    try {

    } catch (error: any) {
        console.log(error.message || error.code)
        Sentry.captureException(error)
        res.status(500).json({ success: false, message: error.message })
    }
}
// deleteProject
export const deleteProject = async (req: Request, res: Response) => {
    try {

    } catch (error: any) {
        console.log(error.message || error.code)
        Sentry.captureException(error)
        res.status(500).json({ success: false, message: error.message })
    }
}

