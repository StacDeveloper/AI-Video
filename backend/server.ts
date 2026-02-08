import express, { Request, Response } from "express"
import dotenv from "dotenv"
import cors from "cors"
import { clerkMiddleware } from "@clerk/express"
import clerkWebHooks from "./controllers/clerk.js"

dotenv.config()

const app = express()

const PORT = process.env.PORT || 5000

app.use(cors())

app.post('/api/clerk', express.raw({ type: 'application/json' }), clerkWebHooks)
app.use(express.json())
app.use(clerkMiddleware())



app.get("/", (req: Request, res: Response) => {
    res.send("Server is live")
})

app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`))