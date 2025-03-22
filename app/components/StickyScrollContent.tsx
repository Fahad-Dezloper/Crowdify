/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React from "react";
// import { StickyScroll } from "../ui/sticky-scroll-reveal";
import Image from "next/image";
import { StickyScroll } from "@/components/ui/sticky-scroll-reveal";
import RoomBox from "@/components/RoomBox";

const content = [
  {
    title: "Create the Room",
    description:
      "Just Create the Fucking Room...",
    content: (
      <div className="h-full w-full scale-150 flex items-center justify-center text-white">
        <RoomBox />
      </div>
    ),
  },
  {
    title: "Automate F***king Everything",
    description:
      "--> Real Time Upvoting --> Automatically playing the most upvoted song",
    content: (
      <div className="h-full w-full  flex items-center justify-center text-white">
        Add Dashboard video
      </div>
    ),
  },
  {
    title: "Spotify for Browser",
    description:
      "Don't wanna visit website again and again just download the extention we will give you every thing on your browser itself",
    content: (
      <div className="h-full w-full bg-[linear-gradient(to_bottom_right,var(--orange-500),var(--yellow-500))] flex items-center justify-center text-white">
        Add Extention Video
      </div>
    ),
  },
  {
    title: "Dynamic Island",
    description:
      "I know you couldn't have guessed right, Damn fucking dynamic island on you system itself",
    content: (
      <div className="h-full w-full bg-[linear-gradient(to_bottom_right,var(--orange-500),var(--yellow-500))] flex items-center justify-center text-white">
        Add Interactive Dynamic Island
      </div>
    ),
  },
];
export function StickyScrollRevealDemo() {
  return (
    <div className="p-10">
      <StickyScroll content={content} />
    </div>
  );
}
