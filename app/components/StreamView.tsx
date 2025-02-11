/* eslint-disable @next/next/no-img-element */
"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import axios from "axios";
import { ChevronDown, ChevronUp, Play} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react"
import {z} from 'zod'
import 'react-lite-youtube-embed/dist/LiteYouTubeEmbed.css'
import LiteYouTubeEmbed from 'react-lite-youtube-embed'
import { YT_REGEX } from "@/lib/utils";

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
const StreamView = ({creatorId, playVideo = false}: {creatorId: string; playVideo:boolean}) => {
    const [arr, setArr] = useState([])
    const [liked, setLiked] = useState(false);
    // const musicRef = useRef(null);
    const [inputLink, setInputLink] = useState("");
    const [currentVideo, setCurrentVideo] = useState();
    const [playNextLoader, setPlayNextLoader] = useState(false);

    async function refreshStreams(){
        const res = await fetch(`/api/streams/?creatorId=${creatorId}`, {credentials: "include"});
        const json = await res.json();
        setArr(json.streams.sort((a, b) => a.upvotes < b.upvotes ? 1 : -1));
        setCurrentVideo(video => {
            if(video?.id === json.activeStream?.stream?.id){
                return video;
            }
            return json.activeStream.stream
        });

        // console.log("here response", res.data.streams);
    }

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
        refreshStreams();
        const interval = setInterval(() => {
            refreshStreams();
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch("/api/streams/", {
            method: "POST",
            body: JSON.stringify({
                // currently hardcoded
                creatorId: creatorId,
                url: inputLink
            })
        });
        // setArr([...prev, await res.json()])
        setInputLink('');
    }

    const PlayNext = async () => {
        if(arr.length > 0){
            try {
                setPlayNextLoader(true);
                const data = await fetch('/api/streams/next', {
                    method: "GET",
                })
                const json = await data.json();
                setCurrentVideo(json.stream);
            } catch (error) {
                console.log(error);
            } finally{
                setPlayNextLoader(false)
            }
        }
    }

    return (
        <div className="w-screen h-screen bg-gray-900 flex flex-col items-center justify-center">
            <div className="flex gap-4">
                <Input placeholder="Add Song.." className="text-white" value={inputLink} onChange={(e) => setInputLink(e.target.value)} />
                <Button onClick={(e) => handleSubmit(e)}>Add to Queue</Button>
            </div>
    {inputLink && inputLink.match(YT_REGEX) && (
        <div className="bg-gray-900 border-gray-800 w-[70vh] h-[70vw] overflow-hidden rounded-2xl">
            <div className="p-4">
                <LiteYouTubeEmbed title="" id={inputLink.split("?v=")[1]}/>
            </div>
        </div>
    )}

    {/* currnet video */}
    <div className="">
        <h1 className="text-white font-semibold text-2xl text-center">Now Playing</h1>
        {currentVideo ? (
        <div>
            {playVideo ? <>
            {/* @ts-ignore */}
                {/* <div className='w-full' /> */}
                <iframe width={"100%"} height={300} src={`https://www.youtube.com/embed/${currentVideo.extractedId}?autoplay=1`} allow="autoplay"></iframe>
            </> : <>
            <img 
                src={currentVideo.bigImg} 
                className="w-full h-72 object-cover rounded"
            />
            <p className="mt-2 text-center font-semibold text-white">{currentVideo.title}</p>
        </>}
    </div>) : (
        <p className="text-center py-8 text-gray-400">No video playing</p>
    )}
    </div>
    {playVideo && <Button disabled={playNextLoader} onClick={PlayNext}><Play /> {playNextLoader ? "Loading..." : "Play Next"}</Button>}       
{/* Queue Box */}
            <div className="bg-white p-4 w-fit flex flex-col gap-4">
                {arr.map((item: Video, index) => (
                    <div key={index} className="flex gap-4">
                        <img src={item.bigImg} alt="" className="w-72 rounded-xl h-40 object-cover" />
                        <div className="flex flex-col h-full justify-between">
                        <h1>{item.title}</h1>
                        <div className="flex w-full justify-between">
                            <Button onClick={() => handleVote(item.id, item.haveUpvoted ? false : true)} className="flex gap-6 items-center text-white">
                            {item.haveUpvoted ? <div className="flex gap-6"><ChevronDown />{item.upvotes}</div> : <div className="flex gap-6"><ChevronUp className={`${liked && "text-blue-800"}`} />{item.upvotes}</div>} 
                            </Button>
                            <Link href={item.url}>here is the link</Link>
                        </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default StreamView