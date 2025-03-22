/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LiteYouTubeEmbed from "react-lite-youtube-embed";
import { useWebSocket } from "../context/WebContext";
import Switch from "@/components/fancy/Button1";
import CopyButton from "@/components/fancy/CopytoClipboard";
import { FC, useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import axios from "axios";
import { Search } from "lucide-react";

interface LeftSidebarProps {
  addToQueue: (e: React.MouseEvent<HTMLButtonElement>) => void;
  inputLink: string;
  YT_REGEX: RegExp;
  setInputLink: (value: string) => void;
  isAdmin: boolean;
  roomId: string;
}

interface YouTubeSearchResult {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
    thumbnails: {
      default: {
        url: string;
      };
    };
  };
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
  const { songAddStatus, userCount } = useWebSocket();

  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<YouTubeSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchResultsRef = useRef<HTMLDivElement>(null);
  
  const videoId = extractVideoId(inputLink);

  const handleAddToQueue = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!inputLink.trim()) {
      setError("Please enter a YouTube link.");
      toast("Please enter a YouTube link.");
      return;
    }
    if (!videoId) {
      toast("Invalid Youtube URL");
      setError("Invalid YouTube URL.");
      return;
    }
    setError("");
    addToQueue(e);
  };

const handleSearch = async () => {
  if (!searchQuery.trim()) return;
  
  setIsSearching(true);
  setShowSearchResults(true);
  
  try {
    const response = await axios.get(`/api/youtube-search?q=${encodeURIComponent(searchQuery)}`);
    
    if (!response) {
      console.error("error while fetching song from youtube");
      toast("error while fetching song from youtube")
    }

    // console.log("data", response);
    
    const data = response;
    setSearchResults(data.data.items);
  } catch (err) {
    console.error("Search error:", err);
    toast("Failed to search. Please try again.");
    setSearchResults([]);
  } finally {
    setIsSearching(false);
  }
};

  const handleSelectVideo = (video: YouTubeSearchResult) => {
    const youtubeUrl = `https://www.youtube.com/watch?v=${video.id.videoId}`;
    setInputLink(youtubeUrl);
    setShowSearchResults(false);
    setSearchQuery("");
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchResultsRef.current && !searchResultsRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="w-full md:w-[40vw] lg:w-[23vw] h-full py-3 px-2 md:pt-5 md:px-3">
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
          <span className="text-sm text-gray-700 font-semibold font-funnel">Total Users: <span className="font-funnel text-base text-blue-600">{userCount}</span></span>
          {songAddStatus || isAdmin ? (
            <>
              <div className="flex flex-col md:flex-row gap-2">
                {isAdmin && (
                  <div className="md:hidden flex w-full justify-end">
                    <Switch />
                  </div>
                )}
                <Input
                  placeholder="Add Song URL..."
                  className="text-black border"
                  value={inputLink}
                  onChange={(e) => setInputLink(e.target.value)}
                />
                <Button className="w-full md:w-auto" onClick={handleAddToQueue}>
                  Add to Queue
                </Button>
              </div>
              
              <div className="relative mt-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Search YouTube..."
                    className="text-black border"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyPress}
                  />
                  <Button 
                    onClick={handleSearch}
                    disabled={isSearching}
                    className="w-fit md:w-auto"
                  >
                    {isSearching ? <><Search />...</> : <Search />}
                  </Button>
                </div>
                
                {/* Search Results Dropdown */}
                {showSearchResults && searchResults.length > 0 && (
                  <div 
                    ref={searchResultsRef}
                    className="absolute z-[999] mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
                  >
                    {searchResults.map((result) => (
                      <div 
                        key={result.id.videoId}
                        className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleSelectVideo(result)}
                      >
                        <div className="flex-shrink-0 w-16 h-12 rounded-xl mr-2 overflow-hidden">
                          <img 
                            src={result.snippet.thumbnails.default.url} 
                            alt={result.snippet.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 truncate text-xs">
                          {result.snippet.title}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {error && <p className="text-red-500 text-sm">{error}</p>}
              {videoId && (
                <div className="bg-gray-900 border-gray-800 rounded-b-xl overflow-hidden mt-2">
                  <div className="w-full h-fit md:h-[23vh]">
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