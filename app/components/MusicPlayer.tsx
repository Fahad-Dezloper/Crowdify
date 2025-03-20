/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { FastForward, Pause, Play, Rewind, SkipBack, SkipForward, Volume2, VolumeOff } from "lucide-react";
import { useRef, useState } from "react";
import ReactPlayer from "react-player"
import { useWebSocket } from "../context/WebContext";

interface MusicPlayerProps {
  isAdmin: boolean;
}

const MusicPlayer = ({ isAdmin }: MusicPlayerProps) => {
  // @ts-ignore
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
      {nowPlaying ? (
        <div className="flex flex-col gap-3 w-full sm:max-h-[40vh] md:max-h-[50vh] lg:h-[60vh]">
          {/* Video Player */}
          <div className="w-full sm:h-[25vh] md:h-[25vh] lg:h-[27vh] shadow-lg rounded-2xl overflow-hidden">
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
              config={{ youtube: { playerVars: { showinfo: 0, controls: 0, modestbranding: 1 } } }}
            />
          </div>

          {/* Song Title */}
          <div className="text-center">
            <h2 className="text-sm sm:text-base font-semibold leading-none font-roboto">{nowPlaying.title}</h2>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2 px-2 sm:px-4">
            <Slider value={[progress]} min={0} max={duration} step={1} onValueChange={handleSliderChange} />
            <div className="flex justify-between text-xs sm:text-sm text-gray-500">
              <span>{formatTime(progress)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-3 sm:gap-4">
            <Button onClick={handleMute} variant="ghost" size="icon" className="text-gray-500 ">
              {mute ? <VolumeOff className="h-5 w-5 sm:h-6 sm:w-6" /> : <Volume2 className="h-5 w-5 sm:h-6 sm:w-6" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-black hover:bg-[#191919] duration-200 text-white"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause className="h-5 w-5 sm:h-6 sm:w-6 text-white" /> : <Play className="h-5 w-5 sm:h-6 sm:w-6 text-white" />}
            </Button>
            {isAdmin && (
              <Button onClick={nextSong} variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700">
                <SkipForward className="h-5 w-5 sm:h-6 sm:w-6" />
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center w-full h-full">
          <div className="relative border-2 shadow-lg rounded-lg w-full max-w-xs sm:max-w-sm">
            <img src="/fallback2.svg" alt="fallback" className="w-full object-contain" />
            <span className="absolute bottom-6 left-[30%] sm:left-[35%] font-bold text-xl sm:text-2xl text-blue-400">
              {userDets ? userDets.data.user.name.split(" ")[0] : "⭐"}
            </span>
          </div>
          <button
            onClick={nextSong}
            className="mt-4 py-2 px-5 sm:px-6 bg-black text-white rounded-full border hover:bg-black/80 transition duration-200"
          >
            Start streaming now
          </button>
        </div>
      )}
    </> 
    )
}

export default MusicPlayer;