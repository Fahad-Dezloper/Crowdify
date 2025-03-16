"use client"
import { ChevronUp } from "lucide-react";
import { useState } from "react";
import { useWebSocket } from "../context/WebContext";

const ChatBot = () => {
  const { messages, sendMessage } = useWebSocket();
  const [input, setInput] = useState("");
  console.log("messages here", messages);
    const handleSend = () => {
      if (input.trim()) {
        sendMessage(input, "User");
        setInput("");
      }
    };
    
    return (
        <div className="w-full h-full  overflow-y-auto">
            <div className="bg-white w-full p-3 h-full flex flex-col justify-between rounded-2xl">
                            
                        {/* <h1>Room ID: {roomId}</h1> */}
      <div className="w-full h-full overflow-y-auto flex flex-col gap-2">
        {messages.map((msg, index) => (
          <div key={index} className="flex items-center gap-3">
          <div className="w-2 h-2 bg-green-300 rounded-full" />
          <p className="text-sm">{msg}</p>
          </div>
        ))}
      </div>
      <div className="w-full h-fit flex gap-4 items-center">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="bg-gray-400 w-full h-full rounded-2xl px-5 outline-none"
      />
      <button onClick={handleSend} className="p-3 bg-black rounded-full outline-none text-white"><ChevronUp /></button>
      </div>

    </div>
        </div>
    )
}

export default ChatBot