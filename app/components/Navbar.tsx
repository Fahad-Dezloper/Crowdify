"use client"
import { signIn, signOut, useSession } from "next-auth/react";

export default function Navbar(){
    const session = useSession();
    
    return (
        <div className="w-full hidden flex font-roboto justify-center fixed top-9 z-50">
            <div className="w-fit flex justify-center bg-white gap-56 border px-6 py-3 rounded-full">
                <div className="font-funnel">Crowdify</div>
                <div className="hover:bg-slate-600">
                    {session.data?.user ? <button className="" onClick={() => signOut()}>Logout</button> : <button className="" onClick={() => signIn()}>Signin</button>}
                </div>
            </div>
        </div>
    )
}