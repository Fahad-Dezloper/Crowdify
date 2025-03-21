/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LiteYouTubeEmbed from "react-lite-youtube-embed";
import { useWebSocket } from "../context/WebContext";
import Switch from "@/components/fancy/Button1";
import CopyButton from "@/components/fancy/CopytoClipboard";
import { FC, useState } from "react";

interface LeftSidebarProps {
  addToQueue: (e: React.MouseEvent<HTMLButtonElement>) => void;
  inputLink: string;
  YT_REGEX: RegExp;
  setInputLink: (value: string) => void;
  isAdmin: boolean;
  roomId: string;
}

const extractVideoId = (url: string): string | null => {
  const regex =
    /(?:youtube\.com\/(?:[^\/]+\/.*|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

const LeftSidebar: FC<LeftSidebarProps> = ({
  addToQueue,
  inputLink,
  setInputLink,
  isAdmin,
  roomId,
}) => {
  // @ts-ignore
  const { songAddStatus } = useWebSocket();
//   console.log("left sidebar song add status", songAddStatus);

  const [error, setError] = useState("");
  const videoId = extractVideoId(inputLink);

  const handleAddToQueue = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!inputLink.trim()) {
      setError("Please enter a YouTube link.");
      return;
    }
    if (!videoId) {
      setError("Invalid YouTube URL.");
      return;
    }
    setError("");
    addToQueue(e);
  };

  return (
    <div className="w-full md:w-[40vw] lg:w-[23vw] h-full py-3 px-2 md:py-5 md:px-3">
      <div className="w-full bg-white py-4 rounded-2xl flex flex-col h-full overflow-y-auto px-4">
        <div className="flex md:flex-col items-center">
          <h1 className="font-funnel text-3xl md:text-4xl text-center pb-3 md:pt-8 md:pb-4 font-semibold">
            Crowdify
          </h1>

          <div className="w-full flex md:flex-row-reverse justify-end md:justify-between items-center min-h-[60px] md:min-h-[80px]">
            {isAdmin && (
              <div className="hidden md:flex">
                <Switch />
              </div>
            )}
            <div className="py-1 md:py-2">
              <CopyButton roomId={roomId} />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {songAddStatus || isAdmin ? (
            <>
              <div className="flex flex-col md:flex-row gap-2">
                {isAdmin && (
                  <div className="md:hidden flex w-full justify-end">
                    <Switch />
                  </div>
                )}
                <Input
                  placeholder="Add Song..."
                  className="text-black border"
                  value={inputLink}
                  onChange={(e) => setInputLink(e.target.value)}
                />
                <Button className="w-full md:w-auto" onClick={handleAddToQueue}>
                  Add to Queue
                </Button>
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              {videoId && (
                <div className="bg-gray-900 border-gray-800 rounded-b-xl overflow-hidden">
                  <div className="w-full h-[30vh] md:h-[23vh]">
                    <LiteYouTubeEmbed title="" id={videoId} />
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default LeftSidebar;