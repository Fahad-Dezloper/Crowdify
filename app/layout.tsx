import type { Metadata } from "next";
import { Funnel_Display, Roboto } from "next/font/google";
import "./globals.css";
import { Provider } from "./Provider";
import Navbar from "./components/Navbar";
import { Toaster } from "@/components/ui/sonner"

const funnelDisplay = Funnel_Display({
  subsets: ["latin"],
  variable: "--font-funnel",
  display: "swap",
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "700"], // Adjust weights as needed
  variable: "--font-roboto",
  display: "swap",
});


export const metadata: Metadata = {
  title: "Crowdify",
  description: "Music Streaming Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${funnelDisplay.variable} ${roboto.variable} antialiased relative`}
      >
        <Provider>
          <Toaster />
        {children}
        </Provider>
      </body>
    </html>
  );
}
