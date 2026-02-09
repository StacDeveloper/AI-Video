import { Request, Response, NextFunction } from "express"
import * as Sentry from "@sentry/node"


export const protect = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.auth()
        if (!userId) {
            return res.status(401).json({ success: false, message: "Not Authorized" })
        }
        next()
    } catch (error: any) {
        console.log(error)
        Sentry.captureException(error)
        res.json({ success: false, message: error.message || error.code })
    }
}