/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useWebSocket } from "@/app/context/WebContext";
import React, { useState } from "react";

const Switch = () => {
  const [checked, setChecked] = useState(false);
  // @ts-ignore
  const { messageControl, chatPaused } = useWebSocket();
  // console.log("from switch component", chatPaused);

  // useEffect(() => {
  //   if(chatPause){
  //     toast("Chat Continued");
  //   } else{
  //     toast("Chat Paused Successfully");
  //   }
  // }, [chatPaused])

  return (
    <div className="relative aspect-[292/142] h-7">
      <input
        type="checkbox"
        className="absolute z-10 w-full h-full opacity-0 cursor-pointer"
        checked={chatPaused}
        onChange={messageControl}
      />
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 292 142"
        className="w-full h-full overflow-visible"
      >
        {/* Background */}
        <path
          d="M71 142C31.7878 142 0 110.212 0 71C0 31.7878 31.7878 0 71 0C110.212 0 119 30 146 30C173 30 182 0 221 0C260 0 292 31.7878 292 71C292 110.212 260.212 142 221 142C181.788 142 173 112 146 112C119 112 110.212 142 71 142Z"
          className={`transition-colors duration-400 ${
            chatPaused ? "fill-blue-600" : "fill-gray-300"
          }`}
        />

        {/* Small Rectangle */}
        <rect
          rx={6}
          height={64}
          width={12}
          y={39}
          x={64}
          className={`transition-colors duration-400 ${
            chatPaused ? "fill-white" : "fill-gray-300"
          }`}
        />

        {/* Circle Animation */}
        <g filter="url('#goo')">
          <rect
            fill="#fff"
            rx={29}
            height={58}
            width={116}
            y={42}
            x={13}
            className={`transition-transform duration-600 ${
              chatPaused ? "translate-x-[150px]" : "translate-x-0"
            }`}
          />
          <rect
            fill="#fff"
            rx={58}
            height={114}
            width={114}
            y={14}
            x={14}
            className={`transition-transform duration-450 ${
              chatPaused ? "scale-0" : "scale-100"
            }`}
          />
          <rect
            fill="#fff"
            rx={58}
            height={114}
            width={114}
            y={14}
            x={164}
            className={`transition-transform duration-450 ${
              chatPaused ? "scale-100" : "scale-0"
            }`}
          />
        </g>

        {/* On/Off Icon */}
        <path
          d="M221 91C232.046 91 241 82.0457 241 71C241 59.9543 232.046 51 221 51C209.954 51 201 59.9543 201 71C201 82.0457 209.954 91 221 91ZM221 103C238.673 103 253 88.6731 253 71C253 53.3269 238.673 39 221 39C203.327 39 189 53.3269 189 71C189 88.6731 203.327 103 221 103Z"
          className={`transition-colors duration-400 ${
            chatPaused ? "fill-blue-600" : "fill-gray-100"
          }`}
        />
      </svg>
    </div>
  );
};

export default Switch;
