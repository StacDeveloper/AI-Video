import { Request, Response } from "express"
import * as Sentry from "@sentry/node"
import { prisma } from "../config/prisma.js"

// get user credits
export const getUserCredits = async (req: Request, res: Response) => {
    try {
        const { userId } = req.auth()
        if (!userId) {
            return res.status(401).json({ success: false, message: "User not found" })
        }

        const userCredits = await prisma.user.findUnique({
            where: { id: userId },
            select: { credits: true }
        })

        return res.status(200).json({ success: true, credits: userCredits?.credits })


    } catch (error: any) {
        console.log(error)
        Sentry.captureException(error)
        res.status(500).json({ success: false, message: error.code || error.message })
    }
}
// get all user project
export const getAllProject = async (req: Request, res: Response) => {
    try {
        const { userId } = req.auth()

        const projects = await prisma.project.findMany({
            where: { userId: userId },
            orderBy: { createdAt: "desc" }
        })

        return res.status(200).json({ success: true, projects })


    } catch (error: any) {
        console.log(error)
        Sentry.captureException(error)
        res.status(500).json({ success: false, message: error.code || error.message })
    }
}
// get project by id
export const getProjectbyId = async (req: Request, res: Response) => {
    try {
        const { projectId } = req.params as { projectId: string }
        const { userId } = req.auth()

        const project = await prisma.project.findUnique({
            where: { id: projectId, userId }
        })

        if (!project) {
            return res.status(404).json({ success: false, message: "Project Not Found" })
        }

        return res.status(200).json({ success: true, project })

    } catch (error: any) {
        console.log(error)
        Sentry.captureException(error)
        res.status(500).json({ success: false, message: error.code || error.message })
    }
}
// toggle project public
export const toggleProjectPublic = async (req: Request, res: Response) => {
    try {
        const { userId } = req.auth()
        const { projectId } = req.params as { projectId: string }

        const project = await prisma.project.findUnique({
            where: { id: projectId, userId }
        })

        if (!project) {
            return res.status(404).json({ success: false, message: "Project Not Found" })
        }

        if (!project.generatedImage && !project.generatedVideo) {
            return res.status(404).json({ success: false, message: "image or video is not generated" })
        }

        const updateProject = await prisma.project.update({
            where: { id: projectId },
            data: {
                isPublished: !project.isPublished
            }
        })

        return res.status(200).json({ success: true, message: updateProject })


    } catch (error: any) {
        console.log(error)
        Sentry.captureException(error)
        res.status(500).json({ success: false, message: error.code || error.message })
    }
}
