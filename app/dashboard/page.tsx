"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import axios from "axios";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react"

const REFRESH_INTERVAL_MS = 10 * 1000;

interface Video {
    "id": string,
    "type": string,
    "url": string,
    "extractedId": string,
    "title": string,
    "smallImg": string,
    "bigImg": string,
    "active": boolean,
    "userId": string,
    "upvotes": number,
    "haveUpvoted": boolean
}
const Dashboard = () => {
    const [arr, setArr] = useState([])
    const [liked, setLiked] = useState(false);

    async function refreshStreams(){
        const res = await axios.get(`/api/streams/my`);
        console.log("here response", res.data.streams);
        setArr(res.data.streams)
    }

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
        refreshStreams();
        const interval = setInterval(() => {

        }, REFRESH_INTERVAL_MS)
    },[])   

    function handleVote(streamId: string, isUpvote: boolean){
        try{
            fetch(`/api/streams/${isUpvote ? "upvote" : "downvote"}`, {
                method: "POST",
                body: JSON.stringify({
                    streamId
                })
            })
            setLiked(true)
        } catch (e){
            console.log("from fe", e)
        }
    }
    return (
        <div className="w-screen h-screen bg-gray-900 flex flex-col items-center justify-center">
            <div className="flex gap-4">
                <Input placeholder="Add Song.." />
                <Button>Add Song</Button>
            </div>

{/* Queue Box */}
            <div className="bg-white p-4 w-fit flex flex-col gap-4">
                {arr.map((item: Video, index) => (
                    <div key={index} className="flex gap-4">
                        <img src={item.bigImg} alt="" className="w-72 rounded-xl h-40 object-cover" />
                        <div className="flex flex-col h-full justify-between">
                        <h1>{item.title}</h1>
                        <div className="flex w-full justify-between">
                            <Button onClick={() => handleVote(item.id, item.haveUpvoted ? false : true)} className="flex gap-2 items-center">
                            {item.haveUpvoted ? <><ThumbsDown />{item.upvotes.length}</> : <><ThumbsUp className={`${liked && "text-blue-800"}`} />{item.upvotes.length}</>} 
                            </Button>
                            <Link href={item.url}>here is the link</Link>
                        </div>
                        </div>
                    </div>
                ))}
            </div>

{/* Queue */}
            <div>

            </div>
        </div>
    )
}

export default Dashboard