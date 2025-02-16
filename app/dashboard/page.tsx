/* eslint-disable @next/next/no-img-element */
"use client"

import axios from "axios"
import StreamView from "../components/StreamView"
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

const Dashboard = () => {
        const { data: session, status } = useSession();
        const [userData, setUserData] = useState(null);

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
        // 91920376-152c-4cb3-ab40-875ddc4abd93
       <div className="w-full h-full">
        {userData ? <StreamView creatorId={userData} playVideo={true}/> : <div>Loading...</div>}
       </div>
    )
}

export default Dashboard