import Appbar from "./components/Appbar";
import Redirect from "./components/Redirect";

export default function Home() {
  return (
    <div className="w-screen h-screen overflow-hidden p-6">
      <Appbar />
      <Redirect />
      <div className="w-full h-full flex items-center justify-center text-[6vw] text-white">Crowdify</div>
    </div>
  ); 
}
