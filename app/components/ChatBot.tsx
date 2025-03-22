/* eslint-disable @typescript-eslint/no-explicit-any */
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
  const { messages, sendMessage, messageControl, chatPaused } = useWebSocket() as {
    messages: { sender: string; text: string }[];
    sendMessage: (message: string) => void;
    messageControl: any;
    chatPaused: boolean;
  };
  const [input, setInput] = useState("");
  // console.log("chat paused fn", messages);
    const handleSend = () => {
      if (input.trim()) {
        sendMessage(input);
        setInput("");
      }
    };
    
    return (
      <div className="w-full h-full overflow-hidden">
  <div className="bg-white w-full p-3 h-full flex flex-col rounded-2xl">
    
    {isAdmin && (
      <div className="w-full flex items-end justify-end">
        <Switch />
      </div>
    )}

    <div className="w-full flex-1 overflow-y-auto flex flex-col gap-2 mb-2 
                    min-h-[15vh] max-h-[30vh] md:min-h-0 md:max-h-none">
      {messages ? (
        messages.map((msg, index) => (
          <div key={index} className="flex">
            {/* <div className="w-10 rounded-xl h-full bg-gray-300"></div> */}
          <div className="flex flex-col justify-start w-full items-start px-3">
            <p className="text-[10px] font-semibold text-[#171717]">{msg.sender}</p>
            <p className="text-xs sm:text-sm px-2 py-1 rounded-xl text-white bg-[#171717]/60">{msg.text}</p>
          </div>
          </div>
        ))
      ) : (
        <div className="text-xl w-full h-full flex items-center justify-center">
        
        </div>
      )}
    </div>

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