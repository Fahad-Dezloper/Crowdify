"use client"
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { FastForward, Pause, Play, Rewind, SkipBack, SkipForward, Volume2, VolumeOff } from "lucide-react";
import { useRef, useState } from "react";
import ReactPlayer from "react-player"
import { useWebSocket } from "../context/WebContext";

const MusicPlayer = ({isAdmin}) => {
  const {nowPlaying, nextSong, prevSong, userDets} = useWebSocket()
  console.log("now playing event happened", nowPlaying);

  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [mute, setMute] = useState(false);
  const playerRef = useRef<ReactPlayer>(null);

  // console.log("new", video);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const handleMute = () => {
    setMute(!mute);
  }

  const handleSongEnd = () => {
    setProgress(0); 
    if(isAdmin){
      nextSong();
    }
  };

  const handleProgress = (state: { played: number; playedSeconds: number }) => {
    setProgress(state.playedSeconds)
  }

  const handleDuration = (duration: number) => {
    setDuration(duration)
  }

  const handleSliderChange = (value: number[]) => {
    const newTime = value[0]
    setProgress(newTime)
    playerRef.current?.seekTo(newTime)
  }

    // console.log("here dets", video);
    return (

        <>
          {nowPlaying ? <div className="flex flex-col gap-4 w-full h-full ">
            <div className="flex flex-col justify-between h-full">
            <div className="w-full h-[25vh] shadow-xl rounded-2xl overflow-hidden">
              <ReactPlayer
                    ref={playerRef}
                    url={nowPlaying.url}
                    playing={isPlaying}
                    width="100%"
                    height="100%"
                    muted={mute}
                    onEnded={handleSongEnd}
                    onProgress={handleProgress}
                    onDuration={handleDuration}
                    config={{
                    youtube: {
                        playerVars: { showinfo: 0, controls: 0, modestbranding: 1 },
                    },
                    }}
                />
            </div>


            <div className="space-y-1">
                <h2 className="text-base font-semibold text-center leading-none font-roboto">{nowPlaying.title}</h2>
            </div>
            </div>

        <div className="flex flex-col gap-2">
            <div className="space-y-2">
                <Slider
                    value={[progress]}
                    min={0}
                    max={duration}
                    step={1}
                    onValueChange={handleSliderChange}
                    // className="[&>span]:h-1 [&>span]:bg-orange-500"
                />
                <div className="flex justify-between text-sm text-gray-500">
                    <span>{formatTime(progress)}</span>
                    <span>{formatTime(duration)}</span>
                </div>
            </div>

            <div className="flex items-center justify-center gap-4">
            <Button onClick={handleMute} variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700">
                {mute ? <VolumeOff className="h-6 w-6" /> : <Volume2 className="h-6 w-6" /> }
                {/* <Volume2 className="h-6 w-6" /> */}
            </Button>
            {/* {isAdmin ? <Button onClick={prevSong} variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700">
                <SkipBack className="h-6 w-6" />
            </Button> : ""} */}
            <Button
                variant="ghost"
                size="icon"
                className="h-12 w-12 rounded-full bg-black hover:bg-[#191919] duration-200 text-white"
                onClick={() => setIsPlaying(!isPlaying)}
            >
                {isPlaying ? <Pause className="h-6 w-6 text-white" /> : <Play className="h-6 w-6 text-white" />}
            </Button>
            {isAdmin ? <Button onClick={nextSong} variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700">
                <SkipForward className="h-6 w-6" />
            </Button> : ""}

            </div>

        </div>
        </div> : 
        <div className="flex flex-col justify-between w-full h-full">
          <div className="relative border-2 shadow-2xl rounded-lg">
            <img src="/fallback2.svg" alt="fallbackimage" className="w-full object-contain" />
            <span className="absolute bottom-8 left-[35%] font-funnel font-black text-3xl text-blue-400">{userDets ? userDets.data.user.name.split(" ")[0] : "⭐"}
            </span>
          </div>
          <div className="w-full h-full flex items-center justify-center flex-col">
            {/* <span>{userDets.data.user.name}</span> */}
            <button onClick={nextSong} className="py-2 px-6 hover:bg-black/80 transition-all duration-200 ease-in-out rounded-full border bg-black text-white font-semibold ">
              Start streaming now
              </button>
            </div>
        </div>
        }
      </>
      // <div className="w-full h-full  flex flex-col rounded-2xl">
      //   <button onClick={nextSong}>Play next</button>
      //                                       <img src="/carddd.png" alt="card" className="w-full h-full object-cover" />
      //                                   </div>
    )
}

export default MusicPlayer;