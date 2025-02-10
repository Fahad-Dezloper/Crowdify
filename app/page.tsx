import Appbar from "./components/Appbar";

export default function Home() {
  return (
    <div className="w-screen h-screen overflow-hidden p-6">
      <Appbar />
    
      <div className="w-full h-full flex items-center justify-center text-[6vw] text-white">Crowdify</div>
    </div>
  ); 
}
