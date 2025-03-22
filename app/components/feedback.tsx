"use client"

import { useState, useRef, useEffect } from "react"
import { Info, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"

type TabType = "Issue" | "Idea" | "Other"

export default function FeedbackComponent() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>("Issue")
  const [email, setEmail] = useState("")
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  const handleSubmit = async () => {
    if (!email || !feedback) {
        toast("Enter email and feedback both");
    };
  
    const formData = new FormData();
    formData.append("email", email);
    formData.append("type", activeTab);
    formData.append("feedback", feedback);
  
    try {
        setLoading(true);
      const response = await fetch("https://script.google.com/macros/s/AKfycbxdW4DY0lErTo9I90jnU6Hu5zCW0gzf4LZvfSeRB2l2RYvNetQfuaGck3dWW5tSwE5b/exec", {
        method: "POST",
        body: formData,
      });
  
      if (response.ok) {
        setShowThankYou(true);
  
        setTimeout(() => {
          setEmail("");
          setFeedback("");
          setShowThankYou(false);
          setIsOpen(false);
        }, 3000);
      } else {
        console.error("Failed to submit feedback");
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
    } finally{
        setLoading(false);
    }
  };
  

  const tabColors: Record<TabType, string> = {
    Issue: "bg-red-700/40",
    Idea: "bg-blue-700/40",
    Other: "bg-green-700/40",
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed right-3 cursor-pointer flex items-center gap-2 z-50 top-1/2 -translate-y-1/2 bg-[#171717] text-white px-3 py-6 rounded-b-3xl text-sm rounded-t-md shadow-lg transform rotate-180 [writing-mode:vertical-lr] tracking-wider font-medium"
      >
        FEEDBACK
        <Info className="rotate-90" size={20} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed pr-[4.5rem] inset-0 bg-black/30 flex items-center justify-end z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
                 ref={modalRef}
                 className="bg-[#171717] transition-all ease-in-out w-full max-w-sm rounded-lg shadow-xl overflow-hidden"
                 initial={{ scale: 0.8, opacity: 0 }}
                 animate={{ scale: 1, opacity: 1 }}
                 exit={{ scale: 0.8, opacity: 0 }} 
                 transition={{
                   type: "spring",
                   stiffness: 100, 
                 }}
                >
              <div className="p-4">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-xl font-semibold text-white font-funnel">Share your thoughts</h2>
                  <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <div className="flex space-x-2 mb-3 bg-[#1a1a1a] rounded-md p-1">
                  {(["Issue", "Idea", "Other"] as TabType[]).map((tab) => (
                    <motion.button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={cn(
                        "px-4 py-1.5 rounded-md text-sm font-medium font-funnel transition-colors",
                        activeTab === tab ? `${tabColors[tab]} text-white` : "text-gray-400 hover:text-white",
                      )}
                      layout
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      {tab}
                    </motion.button>
                  ))}
                </div>

                {showThankYou ? (
                  <motion.div
                    className="text-center py-10 text-white"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <h3 className="text-xl font-medium mb-2">Thank you for your feedback!</h3>
                    <p className="text-gray-400">We appreciate your input.</p>
                  </motion.div>
                ) : (
                  <motion.form
                    onSubmit={(e) => {
                      e.preventDefault()
                      handleSubmit()
                    }}
                    className="flex flex-col gap-1"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                  >
                    <input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-transparent border border-red-500 rounded-md px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                      required
                    />

                    <textarea
                      placeholder="Your feedback"
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      className="w-full bg-transparent border border-red-500 rounded-md px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-red-500 min-h-[100px] resize-none"
                      required
                    />

                    <button
                      type="submit"
                      disabled={loading}
                      className={`w-full mt-2 ${loading ? 'bg-gray-600' : 'bg-black'} hover:bg-gray-900 text-white font-medium py-2 rounded-md transition-colors`}
                    >
                      {loading ? `Sending...` : "Send"} 
                    </button>
                  </motion.form>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
