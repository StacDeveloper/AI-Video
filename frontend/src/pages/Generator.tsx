import React, { useState } from 'react'
import Title from '../components/Title'
import UploadZone from '../components/UploadZone'
import { Loader2Icon, RectangleHorizontalIcon, RectangleVerticalIcon, Wand2Icon } from 'lucide-react'
import { PrimaryButton } from '../components/Buttons'

const Generator = () => {

    const [name, setName] = useState<string>("")
    const [productName, SetProductName] = useState<string>("")
    const [productDescription, SetProductDescription] = useState<string>("")
    const [aspectRatio, SetAspectRatio] = useState<string>("9:16")
    const [productIamge, SetProductImage] = useState<File | null>(null)
    const [modelImage, SetModelImage] = useState<File | null>(null)
    const [userPrompt, SetUserPrompt] = useState<string>("")
    const [generating, SetIsGenerating] = useState<boolean>(false)


    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "Product" | "Model") => {
        if (e.target.files && e.target.files[0]) {
            if (type === "Product") {
                SetProductImage(e.target.files[0])
            } else {
                SetModelImage(e.target.files[0])
            }
        }
    }

    const handleGenerate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
    }


    return (
        <div className='min-h-screen text-white p-6 md:p-12 mt-28'>
            <form
                onSubmit={handleGenerate}
                className='max-w-4xl mx-auto mb-40'>
                <Title
                    heading='Create In-Context Image'
                    description='Upload your model and product images to generate stunning UGC, short-term videos and social media posts' />

                <div className='flex gap-20 max-sm:flex-col items-start justify-between'>
                    {/* Left Col */}
                    <div className='flex flex-col w-full sm:max-w-60 gap-8 mt-8 mb-12'>
                        <UploadZone label='Product Image' file={productIamge} onClear={() => SetProductImage(null)} onChange={(e) => handleFileChange(e, "Product")} />
                        <UploadZone label='Product Image' file={modelImage} onClear={() => SetModelImage(null)} onChange={(e) => handleFileChange(e, "Model")} />
                    </div>

                    {/* Right Col */}
                    <div className='w-full text-gray-300'>
                        <div className='mb-4'>
                            <label htmlFor="name" className='text-sm mb-4 block'>Project Name</label>
                            <input type="text" id='name' value={name} onChange={(e) => setName(e.target.value)} placeholder='Name your project' required className='w-full bg-white/3 rounded-bg border-2 p-4 text-sm border-violet-200/10 focus:border-violet-500/50 outline-none transition-all' />
                        </div>
                        <div className='mb-4 text-gray-300'>
                            <label htmlFor="product-name" className='text-sm mb-4 block'>Product Name</label>
                            <input type="text" id='product-name' value={productName} onChange={(e) => SetProductName(e.target.value)} placeholder='Enter the name of your product' required className='w-full bg-white/3 rounded-bg border-2 p-4 text-sm border-violet-200/10 focus:border-violet-500/50 outline-none transition-all' />
                        </div>
                        <div className='mb-4 text-gray-300'>
                            <label htmlFor="productdescription" className='text-sm mb-4 block'>Product Description <span className='text-xs text-violet-400'>(optional)</span></label>
                            <textarea name="" id="productdescription" rows={4} value={productDescription} onChange={(e) => SetProductDescription(e.target.value)} placeholder='Enter the description of your product' className='w-full bg-white/3 rounded-lg border-2 p-4 text-sm border-violet-200/10 focus:border-violet-500/50 outline-none resize-none transition-all' />
                        </div>


                        <div className='mb-4 text-gray-300'>
                            <label className='block text-sm mb-4'>
                                Aspect Ratio
                                <div className='flex gap-3'>
                                    <RectangleVerticalIcon
                                        onClick={() => SetAspectRatio("9:16")}
                                        className={`p-2.5 size-13 bg-white/6 rounded transition-all ring-2 ring-transparent cursor-pointer ${aspectRatio === "9:16" ? "ring-violet-500/50 bg-white/10" : ""}`} />

                                    <RectangleHorizontalIcon
                                        onClick={() => SetAspectRatio("16:9")}
                                        className={`p-2.5 size-13 bg-white/6 rounded transition-all ring-2 ring-transparent cursor-pointer ${aspectRatio === "16:9" ? "ring-violet-500/50 bg-white/10" : ""}`} />
                                </div>
                            </label>
                        </div>
                        <div className='mb-4 text-gray-300'>
                            <label htmlFor="userprompt" className='text-sm mb-4 block'>User Prompt <span className='text-xs text-violet-400'>(optional)</span></label>
                            <textarea name="" id="userprompt" rows={4} value={userPrompt} onChange={(e) => SetUserPrompt(e.target.value)} placeholder='Describe how you want the narration to be.' className='w-full bg-white/3 rounded-lg border-2 p-4 text-sm border-violet-200/10 focus:border-violet-500/50 outline-none resize-none transition-all' />
                        </div>
                    </div>
                </div>
                <div className='flex justify-center mt-10'>
                    <PrimaryButton disabled={generating} className='px-10 py-3 rounded-md disabled:opacity-70 disabled:cursor-not-allowed'>
                        {generating ? (<>
                            <Loader2Icon className='size-5 animate-spin' /> Generating
                        </>) : (
                            <>
                                <Wand2Icon className='size-5' />Generate Image
                            </>
                        )}
                    </PrimaryButton>
                </div>
            </form>
        </div>
    )
}

export default Generator