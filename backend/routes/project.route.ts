import express, { Router } from "express"
import { protect } from "../middleware/auth.js"
import { createProject, createVideo, deleteProject, getAllPublishedProject } from "../controllers/projectControllers.js"
import upload from "../config/multer.js"

const projectRouter: Router = express.Router()

projectRouter.post("/create/image", protect, upload.array('images', 2), createProject)
projectRouter.post("/create/video", protect, createVideo)
projectRouter.get("/published", getAllPublishedProject)
projectRouter.delete("/delete/:projectId", protect, deleteProject)

export default projectRouter