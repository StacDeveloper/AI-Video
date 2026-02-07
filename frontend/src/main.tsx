import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { ClerkProvider } from '@clerk/clerk-react'
import {dark} from "@clerk/themes"
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
    throw new Error('Add your Clerk Publishable Key to the .env file')
}



createRoot(document.getElementById('root')! as HTMLElement).render(
    <React.StrictMode>
        <BrowserRouter>
            <ClerkProvider
                publishableKey={PUBLISHABLE_KEY}
                appearance={{
                    theme: dark,
                    variables: {
                        colorPrimary: "#4f49f6",
                        colorTextOnPrimaryBackground: "#ffffff"
                    }
                }}
            >
                <App />
            </ClerkProvider>
        </BrowserRouter>
    </React.StrictMode >
)