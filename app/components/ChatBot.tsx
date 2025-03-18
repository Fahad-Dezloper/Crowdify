"use client"
import { ChevronUp } from "lucide-react";
import { useState } from "react";
import { useWebSocket } from "../context/WebContext";
import Switch from "@/components/fancy/Button";

const ChatBot = ({isAdmin}) => {
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
        <div className="w-full h-full  overflow-y-auto">
            <div className="bg-white w-full p-3 h-full flex flex-col justify-between rounded-2xl">
           {isAdmin ? <div className="w-full flex items-end justify-end "><Switch /></div> : ""}                 
                        {/* <h1>Room ID: {roomId}</h1> */}
                        {/* <button onClick={messageControl}>{chatPaused ? "play" : "pause"}</button> */}
      <div className="w-full h-full overflow-y-auto flex flex-col gap-2 mb-2">
        {messages.map((msg, index) => (
          <div key={index} className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gray-400 rounded-full" />
            <p className="text-sm">{msg}</p>
          </div>
        ))}
      </div>
      <div className="w-full h-fit flex gap-4 items-center">
      <input
        type="text"
        value={input}
        disabled={chatPaused}
        placeholder={`${chatPaused ? "Paused" : ""}`}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSend();
          }
        }}
        className="bg-gray-400 w-full h-full rounded-2xl px-5 outline-none placeholder:text-black"
      />
      <button onClick={handleSend} className={`p-3 ${chatPaused ? "" : "bg-black"} rounded-full outline-none text-white`}><ChevronUp /></button>
      </div>

    </div>
        </div>
    )
}

export default ChatBot