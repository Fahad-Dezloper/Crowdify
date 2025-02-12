import Redirect from "./components/Redirect";
import LandingPage from "./components/LandingPage";

export default function Home() {
  return (
    <div className="w-fit h-fit flex flex-col items-center justify-center overflow-hidden">
      <Redirect />
      <LandingPage />
    </div>
  ); 
}
