"use client"
import { SessionProvider } from "next-auth/react"
import Appbar from "./components/Appbar"

export function Provider({children}: {children: React.ReactNode}){
    return <SessionProvider>
        <Appbar />
        {children}
    </SessionProvider>
}