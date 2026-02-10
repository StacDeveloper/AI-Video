import { verifyWebhook } from "@clerk/express/webhooks";
import { prisma } from "../config/prisma.js";
import * as Sentry from "@sentry/node";
const clerkWebHooks = async (req, res) => {
    try {
        console.log("Api-Triggered");
        const WebhookSecret = process.env.CLERK_WEBHOOK_SIGNING_SECRET;
        if (!WebhookSecret) {
            return res.json({ success: false, message: "No webhooksecert" });
        }
        const evt = await verifyWebhook(req);
        const { data, type } = evt;
        switch (type) {
            case "user.created": {
                await prisma.user.create({
                    data: {
                        id: data.id,
                        email: data?.email_addresses[0]?.email_address,
                        name: data?.first_name + " " + data?.last_name,
                        image: data.image_url,
                    }
                });
                break;
            }
            case "user.updated": {
                await prisma.user.update({
                    where: { id: data.id },
                    data: {
                        email: data?.email_addresses[0]?.email_address,
                        name: data?.first_name + " " + data?.last_name,
                        image: data.image_url,
                    }
                });
                break;
            }
            case "user.deleted": {
                await prisma.user.delete({
                    where: { id: data.id },
                });
                break;
            }
            case "paymentAttemp.updated": {
                if ((data.charge_type === "recurring" || data.charge_type === "checkout") && data.status === "paid") {
                    const credits = { pro: 80, premium: 240 };
                    const clerkUserId = data?.payer?.user_id;
                    const planId = data?.subscription_items?.[0]?.plan.slug;
                    if (planId !== "pro" && planId !== "premium") {
                        return res.status(400).json({ success: false, message: "You are on free plan" });
                    }
                    console.log(planId);
                    await prisma.user.update({
                        where: { id: clerkUserId },
                        data: {
                            credits: { increment: credits[planId] }
                        }
                    });
                }
                break;
            }
            default:
                break;
        }
        res.status(200).json({ message: "Webhook Received :" + type });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
        Sentry.captureException(error);
    }
};
export default clerkWebHooks;
