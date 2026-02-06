import type { SetStateAction } from "react"
import type { Project } from "../types"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { Loader2Icon } from "lucide-react"


const ProjectCard = ({ gen, setGeneration, forCommunity = false }: { gen: Project, setGenerations: React.Dispatch<SetStateAction<Project[]>>, forCommunity?: boolean }) => {

    const navigate = useNavigate()
    const [menuOpen, SetMenuOpen] = useState<boolean>(false)

    return (
        <div key={gen.id} className="mb-4 break-inside-avoid">
            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition group">
                {/* Preview */}
                <div className={`${gen?.aspectRatio === "9:16" ? "aspect-9/16" : "aspect-video"} relative overflow-hidden`}>
                    {gen.generatedImage && (
                        <img src={gen.generatedImage} alt={gen.productName} className={`absolute inset-0 w-full h-full object-cover transition duration-500 ${gen.generatedVideo ? "group-hover:opacity-0" : "group-hover:scale-105"}`} />
                    )}
                    {gen.generatedVideo && (
                        <video src={gen.generatedVideo} muted loop playsInline className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition duration-500"
                            onMouseEnter={(e) => e.currentTarget.play()}
                            onMouseLeave={(e) => e.currentTarget.pause()}
                        />
                    )}
                    {(!gen?.generatedImage && !gen.generatedVideo) && (
                        <div className="absolute inset-0 w-full flex flex-col items-center justify-center bg-black/20">
                            <Loader2Icon className="size-7 animate-spin" />
                        </div>
                    )}
                    {/* Status Badge */}
                    <div className="absolute left-3 top-3 flex gap-2 items-center">
                        {gen.isGenerating && (
                            <span className="text-xs px-2 py-1 bg-yellow-600/30 rounded-full">Generating</span>
                        )}
                        {gen.isPublished && (
                            <span className="text-xs px-2 py-1 bg-green-600/30 rounded-full">Published</span>
                        )}

                    </div>
                    {/* Source Image */}
                    <div className="absolute right-3 bottom-3">
                        <img src={gen.uploadedImages[0]} alt="Product" className="w-16 h-16 object-cover rounded-full animate-float" />
                        <img src={gen.uploadedImages[1]} alt="Model" className="w-16 h-16 object-cover rounded-full animate-float -ml-8" style={{ animationDelay: "3s" }} />
                    </div>

                </div>
                {/* details */}
                <div></div>
            </div>
        </div>
    )
}

export default ProjectCard