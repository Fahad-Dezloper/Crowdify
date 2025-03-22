// "use client"
// import React, { useRef, useState, useEffect } from 'react'
// import { motion } from 'framer-motion'
// import { AudioLines, PauseCircle, PlayCircle } from 'lucide-react';

// const Page = () => {
//     const [playingIndex, setPlayingIndex] = useState<number | null>(null);
//     const [windowSize, setWindowSize] = useState({
//         width: typeof window !== 'undefined' ? window.innerWidth : 1440,
//         height: typeof window !== 'undefined' ? window.innerHeight : 900,
//     });

//     // Update window dimensions on resize
//     useEffect(() => {
//         const handleResize = () => {
//             setWindowSize({
//                 width: window.innerWidth,
//                 height: window.innerHeight,
//             });
//         };

//         if (typeof window !== 'undefined') {
//             setWindowSize({
//                 width: window.innerWidth,
//                 height: window.innerHeight,
//             });
//             window.addEventListener('resize', handleResize);
//         }
        
//         return () => {
//             if (typeof window !== 'undefined') {
//                 window.removeEventListener('resize', handleResize);
//             }
//         };
//     }, []);

//     const musicData = [
//         {
//             image: "/diljit.jpg",
//             alt: "Diljit Dosangh",
//             song: "/audio/BornToShine.mp3",
//             artist: "Diljit Dosangh",
//             title: "Born To Shine",
//         },
//         {
//             image: "/ap.webp",
//             alt: "Ap Dhillon",
//             song: "/audio/Brown.mp3",
//             artist: "AP Dhillon",
//             title: "Brown Munde",
//         },
//         {
//             image: "/sidhu3.jpg",
//             alt: "Sidhu",
//             song: "/audio/SameBeef.mp3",
//             artist: "Sidhu Moose Wala",
//             title: "Same Beef",
//         },
//         {
//             image: "/snoop2.jpg",
//             alt: "Snoop Dog",
//             song: "/audio/snoop.mp3",
//             artist: "Snoop Dogg",
//             title: "Drop It Like It's Hot",
//         },
//         {
//             image: "/yoyo.jpg",
//             alt: "Yo Yo Honey Singh",
//             song: "/audio/Millionaire.mp3",
//             artist: "Yo Yo Honey Singh",
//             title: "Millionaire",
//         },
//         {
//             image: "eminem.webp",
//             alt: "Eminem",
//             song: "/audio/RapGod.mp3",
//             artist: "Eminem",
//             title: "Rap God",
//         },
//     ];

//     // Get fixed positions based on screen size
//     const getFixedPositions = () => {
//         const isMobile = windowSize.width <= 767;
//         const isTablet = windowSize.width >= 768 && windowSize.width <= 1023;
//         const isLaptop = windowSize.width >= 1024 && windowSize.width <= 1439;
//         const isDesktop = windowSize.width >= 1440;
        
//         let basePositions;
        
//         if (isMobile) {
//             // Mobile layout (2 columns, 3 rows)
//             basePositions = [
//                 { top: 160, left: 20 },                  // Top left
//                 { top: 160, right: 20 },                 // Top right
//                 { top: windowSize.height/2, left: 20 },  // Middle left
//                 { top: windowSize.height/2, right: 20 }, // Middle right
//                 { top: windowSize.height-180, left: 20 },// Bottom left
//                 { top: windowSize.height-180, right: 20 },// Bottom right
//             ];
//         } else if (isTablet) {
//             // Tablet layout (more spacing, maintain roughly hexagonal pattern)
//             basePositions = [
//                 { top: 100, left: windowSize.width/2-100 },  // Top center
//                 { top: 220, right: 50 },                    // Top right
//                 { top: windowSize.height/2+80, right: 70 },  // Bottom right
//                 { top: windowSize.height-150, left: windowSize.width/2-100 }, // Bottom center
//                 { top: windowSize.height/2+80, left: 70 },   // Bottom left
//                 { top: 220, left: 50 },                     // Top left
//             ];
//         } else if (isLaptop) {
//             // Laptop/medium desktop layout
//             basePositions = [
//                 { top: 100, left: windowSize.width/2-140 },  // Top center
//                 { top: 220, right: 120 },                    // Top right
//                 { top: windowSize.height/2+140, right: 150 }, // Bottom right
//                 { top: windowSize.height-180, left: windowSize.width/2-140 }, // Bottom center
//                 { top: windowSize.height/2+140, left: 150 },  // Bottom left
//                 { top: 220, left: 120 },                     // Top left
//             ];
//         } else {
//             // Large desktop layout
//             basePositions = [
//                 { top: 120, left: windowSize.width/2-160 },  // Top center
//                 { top: 220, right: 200 },                    // Top right
//                 { top: windowSize.height/2+180, right: 230 }, // Bottom right
//                 { top: windowSize.height-220, left: windowSize.width/2-160 }, // Bottom center
//                 { top: windowSize.height/2+180, left: 230 },  // Bottom left
//                 { top: 220, left: 200 },                     // Top left
//             ];
//         }
        
//         return basePositions.map(pos => {
//             // Determine card size based on screen
//             let width, height;
            
//             if (isMobile) {
//                 width = windowSize.width / 2 - 35; // Half screen width minus margin
//                 height = 160;
//             } else if (isTablet) {
//                 width = 200;
//                 height = 200;
//             } else if (isLaptop) {
//                 width = 220;
//                 height = 220;
//             } else {
//                 width = 260;
//                 height = 260;
//             }
            
//             return {
//                 ...pos,
//                 width: `${width}px`,
//                 height: `${height}px`,
//             };
//         });
//     };

//     const positions = getFixedPositions();
//     const audioRefs = useRef<(HTMLAudioElement | null)[]>([]);
    
//     // Handle play/pause functionality
//     const togglePlay = (index: number | null) => {
//         if (playingIndex === index) {
//             if (index !== null && audioRefs.current[index]) {
//                 audioRefs.current[index]?.pause();
//             }
//             setPlayingIndex(null);
//         } else {
//             if (playingIndex !== null && audioRefs.current[playingIndex]) {
//                 audioRefs.current[playingIndex]?.pause();
//             }
//             if (typeof index === 'number') {
//                 audioRefs.current[index]?.play();
//             }
//             setPlayingIndex(index);
//         }
//     }

//     // Stop playing audio when component unmounts
//     useEffect(() => {
//         return () => {
//             if (playingIndex !== null && audioRefs.current[playingIndex]) {
//                 audioRefs.current[playingIndex]?.pause();
//             }
//         };
//     }, [playingIndex]);

//     // Calculate safe drag constraints
//     const calculateConstraints = (position) => {
//         const width = parseFloat(position.width);
//         const height = parseFloat(position.height);
        
//         return {
//             left: -((position.left ? parseFloat(position.left) : 0) - 20),
//             right: windowSize.width - ((position.left ? parseFloat(position.left) : 0) + width + 20),
//             top: -((position.top ? parseFloat(position.top) : 0) - 20),
//             bottom: windowSize.height - ((position.top ? parseFloat(position.top) : 0) + height + 20),
//         };
//     };

//     return (
//         <div className='relative w-screen h-screen overflow-hidden bg-gradient-to-br from-purple-900 via-blue-800 to-indigo-900'>
//             {/* Background animated elements */}
//             <div className="absolute inset-0 overflow-hidden">
//                 {[...Array(8)].map((_, i) => (
//                     <motion.div
//                         key={i}
//                         className="absolute rounded-full bg-white/5"
//                         initial={{
//                             x: Math.random() * windowSize.width,
//                             y: Math.random() * windowSize.height,
//                             scale: Math.random() * 0.5 + 0.5,
//                         }}
//                         animate={{
//                             x: [
//                                 Math.random() * windowSize.width,
//                                 Math.random() * windowSize.width,
//                                 Math.random() * windowSize.width,
//                             ],
//                             y: [
//                                 Math.random() * windowSize.height,
//                                 Math.random() * windowSize.height,
//                                 Math.random() * windowSize.height,
//                             ],
//                         }}
//                         transition={{
//                             duration: 20 + i * 5,
//                             repeat: Infinity,
//                             repeatType: "reverse",
//                         }}
//                         style={{
//                             width: `${Math.random() * 300 + 100}px`,
//                             height: `${Math.random() * 300 + 100}px`,
//                         }}
//                     />
//                 ))}
//             </div>

//             {/* Centered Logo */}
//             <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
//                 <motion.div
//                     initial={{ scale: 0 }}
//                     animate={{ scale: 1 }}
//                     transition={{ type: "spring", duration: 1 }}
//                     className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-full shadow-2xl"
//                 >
//                     <div className="flex items-center justify-center text-white">
//                         <span className="text-5xl md:text-6xl lg:text-7xl font-bold">Cr</span>
//                         <motion.div
//                             animate={{ 
//                                 scale: [1, 1.1, 1],
//                                 opacity: [1, 0.8, 1]
//                             }}
//                             transition={{ 
//                                 duration: 2, 
//                                 repeat: Infinity,
//                                 repeatType: "loop"
//                             }}
//                             className="relative mx-2 p-2 border-2 rounded-full flex items-center justify-center"
//                         >
//                             <AudioLines size={windowSize.width < 768 ? 40 : 55} strokeWidth={1.5} />
//                         </motion.div>
//                         <span className="text-5xl md:text-6xl lg:text-7xl font-bold">wdify</span>
//                     </div>
//                 </motion.div>
//             </div>

//             {/* Music Cards */}
//             {musicData.map((music, index) => {
//                 const position = positions[index];
//                 const constraints = calculateConstraints(position);
                
//                 return (
//                     <motion.div
//                         key={index}
//                         drag
//                         dragConstraints={constraints}
//                         dragElastic={0.1}
//                         initial={{ 
//                             opacity: 0,
//                             x: 0,
//                             y: 0,
//                         }}
//                         animate={{ 
//                             opacity: 1,
//                             x: 0,
//                             y: 0,
//                             transition: { 
//                                 delay: 0.2 + index * 0.1,
//                                 duration: 0.8, 
//                                 type: "spring"
//                             }
//                         }}
//                         whileHover={{ 
//                             scale: 1.05,
//                             boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
//                             zIndex: 100
//                         }}
//                         whileTap={{ 
//                             scale: 1.02,
//                             cursor: "grabbing"
//                         }}
//                         className="absolute border-2 border-white/20 overflow-hidden rounded-xl cursor-grab shadow-lg"
//                         style={{
//                             left: position.left,
//                             right: position.right,
//                             top: position.top,
//                             width: position.width,
//                             height: position.height,
//                             zIndex: playingIndex === index ? 60 : 40
//                         }}
//                     >
//                         <img
//                             src={music.image}
//                             alt={music.alt}
//                             className="w-full h-full object-cover"
//                         />
                        
//                         {/* Info overlay */}
//                         <motion.div
//                             initial={{ opacity: 0 }}
//                             animate={{ opacity: playingIndex === index ? 0.85 : 0 }}
//                             whileHover={{ opacity: 0.85 }}
//                             className="absolute inset-0 bg-gradient-to-t from-black/90 to-black/40 flex flex-col justify-between p-3"
//                         >
//                             <div className="text-white">
//                                 <h3 className="font-bold truncate text-sm md:text-base">{music.artist}</h3>
//                                 <p className="text-xs md:text-sm text-white/80 truncate">{music.title}</p>
//                             </div>
                            
//                             <div className="flex justify-center items-center flex-1">
//                                 <motion.button
//                                     whileHover={{ scale: 1.1 }}
//                                     whileTap={{ scale: 0.95 }}
//                                     onClick={() => togglePlay(index)}
//                                     className="bg-white/20 rounded-full p-2 backdrop-blur-sm"
//                                 >
//                                     {playingIndex === index ? (
//                                         <PauseCircle className="text-white" size={windowSize.width < 768 ? 32 : 40} />
//                                     ) : (
//                                         <PlayCircle className="text-white" size={windowSize.width < 768 ? 32 : 40} />
//                                     )}
//                                 </motion.button>
//                             </div>
                            
//                             {/* Audio visualizer */}
//                             {playingIndex === index && (
//                                 <div className="flex justify-center items-center space-x-1 h-6">
//                                     {[...Array(5)].map((_, i) => (
//                                         <motion.div
//                                             key={i}
//                                             animate={{
//                                                 height: [5, 15, 7, 20, 5],
//                                                 backgroundColor: [
//                                                     "#ffffff",
//                                                     "#a855f7",
//                                                     "#ffffff",
//                                                     "#3b82f6", 
//                                                     "#ffffff"
//                                                 ]
//                                             }}
//                                             transition={{
//                                                 duration: 1.5,
//                                                 repeat: Infinity,
//                                                 delay: i * 0.2,
//                                                 ease: "easeInOut"
//                                             }}
//                                             className="w-1 bg-white rounded-full"
//                                         />
//                                     ))}
//                                 </div>
//                             )}
//                         </motion.div>
                        
//                         {/* Audio element */}
//                         <audio
//                             ref={(el) => audioRefs.current[index] = el}
//                             src={music.song}
//                             onEnded={() => setPlayingIndex(null)}
//                         />
//                     </motion.div>
//                 );
//             })}
            
//             {/* Instruction for mobile */}
//             {windowSize.width < 768 && (
//                 <motion.div
//                     initial={{ opacity: 0, y: 20 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ delay: 1.5 }}
//                     className="absolute bottom-4 left-0 right-0 text-center text-white/70 text-xs"
//                 >
//                     Tap and drag cards to move them
//                 </motion.div>
//             )}
//         </div>
//     );
// }

// export default Page;