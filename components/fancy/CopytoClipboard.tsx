import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface CopyButtonProps {
  roomId: string;
}

const CopyButton = ({ roomId }: CopyButtonProps) => {
  const [copied, setCopied] = useState(false);
  const textToCopy = roomId;
  
  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy).catch(err => {
      console.error('Failed to copy text: ', err);
    });
    
    setCopied(true);
    toast("RoomId Copied Successfully");
    setTimeout(() => setCopied(false), 2000);
  };

  const renderParticles = () => {
    if (!copied) return null;
    
    return [...Array(12)].map((_, index) => {
      const size = Math.random() * 7 + 4;
      const angle = (index / 12) * 340; 
      const distance = Math.random() * 60 + 60;
      const x = Math.cos(angle * (Math.PI / 180)) * distance;
      const y = Math.sin(angle * (Math.PI / 180)) * distance;
      const colors = ['#ff6b6b', '#ff9e7d', '#ffcf91', '#f8f9fa'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      return (
        <motion.div
          key={`particle-${index}-${Date.now()}`}
          initial={{ x: 0, y: 0, opacity: 1 }}
          animate={{ 
            x: x, 
            y: y, 
            opacity: 0,
            scale: 0.5,
          }}
          transition={{ 
            duration: 0.8 + Math.random() * 0.3,
            ease: "easeOut" 
          }}
          className="absolute rounded-full z-30"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            backgroundColor: color,
            top: "50%",
            left: "50%",
            marginTop: `-${size/2}px`,
            marginLeft: `-${size/2}px`,
          }}
        />
      );
    });
  };

  return (
      <div className="relative">
        <button 
          onClick={handleCopy}
          onTouchStart={handleCopy}
          className="flex items-center gap-2 text-sm text-gray-700 z-50 px-4 py-2 rounded-md transition-all hover:border ease-in-out duration-200 border-0 border-gray-700"
        >
          <span className="font-mono">{roomId}</span>
          {copied ? (
            <Check size={16} className="text-green-400" />
          ) : (
            <Copy size={16} />
          )}
        </button>

        {/* Copied text */}
        <AnimatePresence>
          {copied && (
            <motion.div 
              initial={{ opacity: 0, y: -60 }}
              animate={{ opacity: 1, y: -72 }}
              exit={{ opacity: 0 }}
              className="absolute left-0 -right-14 rotate-[-30deg] text-center"
            >
              <span className="text-gray-600 font-black px-2 py-1 rounded-sm text-sm">
                Copied!
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {renderParticles()}
      </div>
  );
};

export default CopyButton;