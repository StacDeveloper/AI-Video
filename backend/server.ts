import "./config/instrument.mjs"
import express, { Request, Response } from "express"
import dotenv from "dotenv"
import cors from "cors"
import { clerkMiddleware } from "@clerk/express"
import clerkWebHooks from "./controllers/clerk.js"
import * as Sentry from "@sentry/node"
import userRouter from "./routes/user.routes.js"
import projectRouter from "./routes/project.route.js"

dotenv.config()

const app = express()

const PORT = process.env.PORT || 5000

app.use(cors())

app.post('/api/clerk', express.raw({ type: 'application/json' }), clerkWebHooks)
app.use(express.json())
app.use(clerkMiddleware())

app.get("/debug-sentry", function mainHandler(req, res) {
    Sentry.logger.info('User triggered test error', {
        action: 'test_error_endpoint',
    });
    Sentry.metrics.count('test_counter', 1);
    throw new Error("My first Sentry error!");
});

app.use("/api/user", userRouter)
app.use("/api/project", projectRouter)


app.get("/", (req: Request, res: Response) => {
    res.send("Server is live")
})

Sentry.setupExpressErrorHandler(app)

app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`))