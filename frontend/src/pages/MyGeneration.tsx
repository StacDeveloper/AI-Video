import React, { useEffect, useState } from 'react'
import type { Project } from '../types'
import { dummyGenerations } from '../assets/assets'
import { Loader2Icon } from 'lucide-react'
import ProjectCard from '../components/ProjectCard'
import { PrimaryButton } from '../components/Buttons'

const MyGeneration = () => {

  const [generations, SetGenerations] = useState<Project[]>([])
  const [loading, SetLoading] = useState<boolean>(true)

  const fetctMyGenerations = async () => {
    setTimeout(() => {
      SetGenerations(dummyGenerations)
      SetLoading(false)
    }, 3000);
  }
  useEffect(() => {
    fetctMyGenerations()
  }, [])

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <Loader2Icon className='size-7 animate-spin text-indigo-400' />
      </div>
    )
  }

  return (
    <div className='min-h-screen text-white p-6 md:p-12 my-28'>
      <div className='max-w-6xl mx-auto'>
        <header className='mb-12'>
          <h1 className='text-3xl md:text-4xl font-semibold mb-4'>My Generations</h1>
          <p className='text-gray-400'>View and Manage your AI-generated content</p>
        </header>

        {/* Project Lists */}
        <div className='columns-1 sm:columns-2 lg:columns-3 gap-4'>
          {generations.map((gen) => (
            <div key={gen.id}>
              <ProjectCard gen={gen} setGenerations={SetGenerations} forCommunity={true} />
            </div>
          ))}

        </div>
        {generations.length === 0 && (
          <div className='text-center py-20 bg-white/5 rounded-xl border border-white/10'>
            <h3 className='text-xl font-medium mb-2'>No Generations Yet</h3>
            <p className='text-gray-400 mb-6'>Start creating stunning product photos today</p>
            <PrimaryButton onClick={() => window.location.href = "/generate"}>
              Create New Generation
            </PrimaryButton>
          </div>
        )}
      </div>
    </div>
  )
}

export default MyGeneration