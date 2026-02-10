import express, { Router } from "express"
import { protect } from "../middleware/auth.js"
import { getAllProject, getProjectbyId, getUserCredits, toggleProjectPublic } from "../controllers/usercontroller.js"

const userRouter: Router = express.Router()

userRouter.get("/credits", protect, getUserCredits)
userRouter.get("/projects", protect, getAllProject)
userRouter.get("/projects/:projectId", protect, getProjectbyId)
userRouter.get("/publish/:projectId", protect, toggleProjectPublic)

export default userRouter