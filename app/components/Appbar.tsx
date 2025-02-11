"use client"
import { signIn, signOut, useSession } from "next-auth/react";

export default function Appbar(){
    const session = useSession();
    return (
        <div className="w-full">
            <div className="w-full flex justify-between">
                <div>Crowdify</div>
                <div className="">
                    {session.data?.user ? <button className="" onClick={() => signOut()}>Logout</button> : <button className="" onClick={() => signIn()}>Signin</button>}
                </div>
            </div>
        </div>
    )
}