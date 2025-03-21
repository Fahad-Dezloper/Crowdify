/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"
import { AudioLines, Headphones, PauseCircle, PlayCircle, XIcon } from 'lucide-react'
import React, { useRef, useState } from 'react'
import { motion } from "motion/react"
import { StickyScroll } from '@/components/ui/sticky-scroll-reveal'
import { StickyScrollRevealDemo } from './StickyScrollContent'
import Link from 'next/link'
import Navbar from './Navbar'


const LandingPage = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [playingIndex, setPlayingIndex] = useState<number | null>(null);
    const elements = [
        {
          top: "top-20",
          left: "left-64",
          bgColor: "bg-white w-fit h-fit",
          image: "/diljit.jpg",
          alt: "Diljit Dosangh",
          song: "/audio/BornToShine.mp3", 
        },
        { 
            top: "top-[23rem]", 
            left: "left-28", 
            bgColor: "w-fit bg-white h-[28vh]",
            image: "/ap.webp",
            alt: "Ap Dhillon",
            song: "/audio/Brown.mp3", 
        },
        { 
            top: "top-[35rem]", 
            left: "left-[24rem]", 
            bgColor: "w-[13vw] h-fit",
            image: "/sidhu3.jpg",
          alt: "Sidhu", 
          song: "/audio/SameBeef.mp3", 
        },
        { 
            top: "top-20", 
            right: "right-64", 
            bgColor: "w-[13vw] h-[25vh]",
            image: "/snoop2.jpg",
            alt: "Snoop Dog",
            song: "/audio/snoop.mp3", 
         },
        { 
            top: "top-[22rem]", 
            right: "right-32", 
            bgColor: "w-[18vw] h-[23vh]",
            image: "/yoyo.jpg",
            alt: "Yo Yo Honey Singh",
            song: "/audio/Millionaire.mp3", 
         },
        { 
            top: "top-[35rem]", 
            right: "right-[28rem]", 
            bgColor: "w-[13vw] h-[25vh]",
            image: "eminem.webp",
            alt: "Eminem",
            song: "/audio/RapGod.mp3",  
        },
      ];

      const audioRefs = useRef<(HTMLAudioElement | null)[]>([]);
      const togglePlay = (index: number | null, song: string) => {
        if(playingIndex === index){
            if (index !== null && audioRefs.current[index]) {
                audioRefs.current[index].pause();
            }
            setPlayingIndex(null);
        }else{
            if (playingIndex !== null && audioRefs.current[playingIndex]) {
                audioRefs.current[playingIndex]?.pause();
            }
            if (typeof index === 'number') {
                audioRefs.current[index]?.play();
            }
            setPlayingIndex(index);
        }
      }
      const arrow = {
        initial: { opacity: 0 },
        animate: { opacity: 0 },
        whileHover: { opacity: 1 },
      };
  return (
    <>
    {/* section 1 */}
    {/* <Navbar /> */}
    <Navbar />
    <div className='flex flex-col w-screen h-screen fixed top-0 z-10 items-center justify-center'>
    <div className="w-fit h-fit font-funnel flex items-center justify-center leading-none text-[9vw] text-white">
      <span>Cr</span> 
      <motion.span initial={{scale:0}} animate={{scale: 1}} className="p-3 border-2 mx-2 rounded-full mt-6"><AudioLines size={65} className="text-white" /></motion.span>
      <span>wdify</span>
      </div>
      <div>
      {elements.map(({ top, left, right, bgColor, image, alt, song }, index) => (
        <motion.div
          key={index}
          drag
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          className={`absolute ${top} ${left || right} overflow-hidden border-2 cursor-grab ${bgColor} rounded-md`}
        >
            <img
              src={image}
              className="w-full h-full object-cover pointer-events-none"
              alt={alt}
            />

<motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 0 }}
      whileHover={{ opacity: 0.7 }}
      transition={{ duration: 0.3 }}
      className="absolute inset-0 w-full h-full"
      style={{
        background: "linear-gradient(to top, rgba(0, 0, 0, 1), rgba(0, 0, 0, 0.3))",
      }}
    >
        <button className='flex items-center justify-center w-full h-full' onClick={() => togglePlay(index, song)}>
                {playingIndex === index ? (
                  <PauseCircle size={50} className="text-white" />
                ) : (
                  <PlayCircle size={50} className="text-white" />
                )}
              </button>
    </motion.div>

          {song && (
            <audio ref={(el) => { audioRefs.current[index] = el; }} src={song} />
          )}

          {playingIndex === index && (
            <div className="absolute bottom-0 py-3 left-1/2 transform w-full  justify-center -translate-x-1/2 rotate-180 flex space-x-1" style={{
                background: "linear-gradient(to top, rgba(0, 0, 0, 1), rgba(0, 0, 0, 0.3))",
              }}>
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ height: [10, 25, 15, 30, 20, 10] }}
                  transition={{
                    repeat: Infinity,
                    duration: 5,
                    delay: i * 0.8,
                    ease: "easeInOut",
                  }}
                  className="w-1 bg-white "
                />
              ))}
            </div>
          )}

        </motion.div>
      ))}
    </div>

      {/* <motion.div
            layout
            data-expanded={isOpen}
            initial={{ borderRadius: 50 }}
            className="flex h-[100px] w-[100px] items-center justify-center bg-black data-[expanded=true]:h-[200px] data-[expanded=true]:w-[400px]"
            onHoverStart={() => setIsOpen(!isOpen)}
            onHoverEnd={() => setIsOpen(!isOpen)}
            >
            <motion.div layout className="h-10 w-10 rounded-full bg-white" />
            </motion.div> */}
    </div>

    {/* section 2 */}
    {/* Crowd Decide what you are going to Listen */}
    <div className='h-fit flex justify-center rounded-t-[4rem] pt-12 w-screen z-20 mt-[100%] bg-black text-white'>
        <div className="flex flex-col items-center leading-none">
        <h3 className="text-[8vw] font-semibold font-roboto text-[#333333] tracking-tight">Let Your</h3>
        {/* <h1 className="text-[20vw] font-semibold font-funnel text-white">Crowd</h1> */}
        <div className="w-fit h-fit font-funnel flex items-center justify-center leading-none text-[20vw] text-white">
            <span>Cr</span> 
            <motion.span initial={{scale:0}} animate={{scale: 1}} className="p-3 border-2 mx-2 rounded-full mt-16 "><AudioLines size={125} className="text-white" /></motion.span>
            <span>wd</span>
            </div>
            <h3 className='text-[6vw] font-semibold font-roboto text-[#333333]'>Decide What you <span className='font-funnel'>Hear  </span></h3>
            {/* <h1 className='font-funnel text-[35vw]'>Hear</h1> */}
        </div>
    </div>

    {/* section 3 */}
    <div className='w-screen h-fit z-30 bg-black'>
        <StickyScrollRevealDemo />
    </div>

    {/* section 4 */}
    <div className='w-screen h-screen z-30 bg-black text-6xl font-funnel flex items-center justify-center text-white'>
      Reviews
    </div>

    {/* section 5 */}
    <div className='w-screen h-fit py-9 px-6 bg-black z-30'>
      <div className='w-full h-full flex justify-between items-center px-16 py-8 bg-[#b3b3b3] rounded-2xl'>
        <h1 className="font-semibold font-funnel">crowdify@gmail.com <br />
        © 2025 India. All rights reserved.</h1>
        <Link href="https://x.com/l_fahadkhan_l" className="flex gap-1 font-funnel font-semibold hover:underline"><span>Build with 💙 by</span>𝕏</Link>
      </div>
    </div>
    </>
  )
}

export default LandingPage