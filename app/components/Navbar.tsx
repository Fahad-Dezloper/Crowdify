"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import { motion } from "framer-motion";

export default function Navbar() {
  const session = useSession();

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full flex justify-center fixed top-6 z-50"
    >
      <motion.div
        className="w-fit flex items-center bg-white gap-10 sm:gap-16 md:gap-32 lg:gap-56 border px-6 py-3 rounded-full shadow-lg"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <div className="font-funnel text-lg sm:text-xl">Crowdify</div>
        <motion.button
          className="px-5 py-2 rounded-full text-white transition-all duration-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={{ duration: 0.2 }}
          onClick={session.data?.user ? () => signOut() : () => signIn()}
          style={{
            backgroundColor: session.data?.user ? "black" : "#3b82f6",
          }}
        >
          {session.data?.user ? "Logout" : "Signin"}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
