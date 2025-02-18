/* eslint-disable @next/next/no-img-element */
"use client"

import axios from "axios"
import StreamView from "../components/StreamView"
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";

const Dashboard = () => {
        const { data: session, status } = useSession();
        const [userData, setUserData] = useState(null);

        const socket = useMemo(()=>io("http://localhost:8080"), []);

        function onVote(){
            console.log("Voted");
            socket.emit("vote", {message: "Voted"});
        }

        socket.on("connect", () => {
            console.log("User connected");
        })

        socket.on("message", (data) => {
            console.log("Message from server nextjs:", data.id);
        })

        useEffect(() => {
            if (status === "authenticated" && session?.user?.email) {
                getUser();
            }
        }, [status, session]);

        async function getUser() {
            // console.log("calling function")
            try {
                const res = await axios.get("/api/user/fetchUser");
                console.log("Here is the userId:", res.data.user.id);
                setUserData(res.data.user.id);
            } catch (error) {
                console.error("Error fetching user:", error);
            }
        }

    return (
       <div className="w-full h-full">
        {userData ? <StreamView creatorId={userData} playVideo={true} onVote={onVote}/> : <div>Loading...</div>}
       </div>
    )
}

export default Dashboard