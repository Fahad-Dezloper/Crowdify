/* eslint-disable @next/next/no-img-element */
"use client"

import StreamView from "@/app/components/StreamView";
import axios from "axios"
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";

const Page = () => {
    const { data: session, status } = useSession();
    const [userData, setUserData] = useState(null);
    const params = useParams();
    const roomId = params?.roomId;
    const [role, setRole] = useState<string | null>(null);
    const router = useRouter();
    // const roomId = params.id;

    console.log("Room ID:", roomId);

        // const socket = useMemo(()=>io("http://localhost:8080"), []);

        // function onVote(){
        //     console.log("Voted");
        //     socket.emit("vote", {message: "Voted"});
        // }

        // socket.on("connect", () => {
        //     console.log("User connected");
        // })

        // socket.on("message", (data) => {
        //     console.log("Message from server nextjs:", data.id);
        // })

        useEffect(() => {
            async function fetchUserRole() {
              try {
                const res = await axios.get(`/api/room/${roomId}/role`);
                console.log("user role", res.data.role);
                setUserData(res.data.role.id);
                setRole(res.data.role.role);
              } catch (error) {
                console.error("Error fetching role:", error);
                // router.push("/error"); // Redirect if unauthorized
              }
            }
            fetchUserRole();
          }, [roomId, router]);


          if (!role) return <p>Loading......... {role}</p>;
    return (
        <div className="w-full h-full">
          {params.id}
            {userData ? <StreamView creatorId={userData} role={role} playVideo={true}/> : <div>coming......</div>}
       </div>
    )
}

export default Page;