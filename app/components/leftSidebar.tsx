import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import LiteYouTubeEmbed from 'react-lite-youtube-embed'

const LeftSidebar = ({handleSubmit, inputLink, YT_REGEX, setInputLink}) => {
    return (
        <div className="min-w-[22vw] h-full py-5 px-3">
            <div className="min-w-[22vw] rounded-2xl flex flex-col bg-white h-full overflow-y-auto px-4">
                <h1 className="font-funnel text-4xl text-center py-8 font-semibold">Crowdify</h1>
                <div className="flex flex-col gap-2">
                <div className="flex gap-3">
                <Input placeholder="Add Song..." className="text-black border" value={inputLink} onChange={(e) => setInputLink(e.target.value)} />
                <Button onClick={(e) => handleSubmit(e)}>Add to Queue</Button>
                </div>
                {inputLink && inputLink.match(YT_REGEX) ? (
                <div className="bg-gray-900 border-gray-800 rounded-b-xl overflow-hidden">
                    <div className="w-full h-[23vh]">
                        <LiteYouTubeEmbed title="" id={inputLink.split("?v=")[1]}/>
                    </div>
                </div>
            ) : <div className="bg-[#101216] border-gray-800 rounded-b-xl overflow-hidden h-[23vh] text-white text-2xl flex items-center justify-center w-full font-funnel">No Preview Available</div>}
            </div>
            </div>
        </div>
    )
}

export default LeftSidebar