import express, { Router } from "express"
import { protect } from "../middleware/auth.js"
import { getAllProject, getProjectbyId, getUserCredits, toggleProjectPublic } from "../controllers/usercontroller.js"

const userRouter: Router = express.Router()

userRouter.get("/user/credits", protect, getUserCredits)
userRouter.get("/user/projects", protect, getAllProject)
userRouter.get("/user/projects/:projectId", protect, getProjectbyId)
userRouter.get("/user/publish/:projectId", protect, toggleProjectPublic)

export default userRouter