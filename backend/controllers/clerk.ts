import { verifyWebhook } from "@clerk/express/webhooks"
import { prisma } from "../config/prisma.js"
import { Request, Response } from "express"
import * as Sentry from "@sentry/node"


const clerkWebHooks = async (req: Request, res: Response) => {
    try {
        console.log("Api-Triggered")
        const WebhookSecret = process.env.CLERK_WEBHOOK_SIGNING_SECRET
        if (!WebhookSecret) {
            return res.json({ success: false, message: "No webhooksecert" })
        }

        const evt: any = await verifyWebhook(req)
        const { data, type } = evt

        switch (type) {
            case "user.created": {
                await prisma.user.create({
                    data: {
                        id: data.id,
                        email: data?.email_addresses[0]?.email_address,
                        name: data?.first_name + " " + data?.last_name,
                        image: data.image_url,

                    }
                })
                break
            }
            case "user.updated": {
                await prisma.user.update({
                    where: { id: data.id },
                    data: {
                        email: data?.email_addresses[0]?.email_address,
                        name: data?.first_name + " " + data?.last_name,
                        image: data.image_url,
                    }
                })
                break
            }
            case "user.deleted": {
                await prisma.user.delete({
                    where: { id: data.id },
                })
                break
            }
            case "paymentAttemp.updated": {
                if ((data.charge_type === "recurring" || data.charge_type === "checkout") && data.status === "paid") {
                    const credits = { pro: 80, premium: 240 }
                    const clerkUserId = data?.payer?.user_id
                    const planId: keyof typeof credits = data?.subscription_items?.[0]?.plan.slug

                    if (planId !== "pro" && planId !== "premium") {
                        return res.status(400).json({ success: false, message: "You are on free plan" })
                    }
                    console.log(planId)

                    await prisma.user.upsert({
                        where: { id: clerkUserId },
                        update: {
                            credits: { increment: credits[planId] }
                        },
                        create: {
                            id: clerkUserId,
                            credits: credits[planId],
                            email: data?.email_addresses[0]?.email_address,
                            name: data?.first_name + " " + data?.last_name,
                            image: data.image_url,

                        }
                    })
                }
                break
            }
            default:
                break

        }

        res.status(200).json({ message: "Webhook Received :" + type })

    } catch (error: any) {
        console.log(error)
        res.status(500).json({ success: false, message: error.message })
        Sentry.captureException(error)
    }
}

export default clerkWebHooks