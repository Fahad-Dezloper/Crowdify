/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"
import { ChevronUp } from "lucide-react";
import { useState } from "react";
import { useWebSocket } from "../context/WebContext";
import Switch from "@/components/fancy/Button";

interface ChatBotProps {
  isAdmin: boolean;
}

const ChatBot = ({ isAdmin }: ChatBotProps) => {
  // @ts-ignore
  const { messages, sendMessage, messageControl, chatPaused } = useWebSocket();
  const [input, setInput] = useState("");
  // console.log("chat paused fn", chatPaused)
    const handleSend = () => {
      if (input.trim()) {
        sendMessage(input, "User");
        setInput("");
      }
    };
    
    return (
      <div className="w-full h-full overflow-hidden">
  <div className="bg-white w-full p-3 h-full flex flex-col rounded-2xl">
    
    {/* Admin Toggle */}
    {isAdmin && (
      <div className="w-full flex items-end justify-end">
        <Switch />
      </div>
    )}

    {/* Chat Messages (Fix: Ensuring full height) */}
    <div className="w-full flex-1 overflow-y-auto flex flex-col gap-2 mb-2 px-2 sm:px-4 
                    min-h-[15vh] max-h-[30vh] md:min-h-0 md:max-h-none">
      {messages ? (
        messages.map((msg, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-400 rounded-full" />
            <p className="text-xs sm:text-sm">{msg}</p>
          </div>
        ))
      ) : (
        <div className="text-xl w-full h-full flex items-center justify-center">
          Chill bro
        </div>
      )}
    </div>

    {/* Input Section */}
    <div className="w-full h-fit flex gap-2 sm:gap-4 items-center p-2 sm:p-4">
      <input
        type="text"
        value={input}
        disabled={chatPaused}
        placeholder={`${chatPaused ? "Paused" : "Type a message..."}`}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
        className="bg-gray-200 w-full h-10 sm:h-12 rounded-xl px-4 outline-none text-sm sm:text-base placeholder:text-gray-600"
      />
      <button
        onClick={handleSend}
        className={`p-2 sm:p-3 ${chatPaused ? "bg-gray-400" : "bg-black"} rounded-full outline-none text-white`}
      >
        <ChevronUp />
      </button>
    </div>

  </div>
</div>


    )
}

export default ChatBot