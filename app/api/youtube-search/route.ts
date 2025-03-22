/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";


type SearchResult = {
    items: Array<{
      id: {
        videoId: string;
      };
      snippet: {
        title: string;
        thumbnails: {
          default: {
            url: string;
          };
        };
      };
    }>;
  };

export async function GET(req: any){
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");
    console.log("query is q", q);
    
    // if (!q || typeof q !== 'string') {
    //     return NextResponse.json({ message: 'Search query is required'}, {status: 403});
    //   }

      try{
        // console.log("reached here");
        const apiKey = process.env.YOUTUBE_API_KEY;

        if (!apiKey) {
            // console.log("api key is there")
            return NextResponse.json({ message: 'YouTube API key not configured' }, {
                status: 403
            });
          }

          const response = await fetch(
            `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=5&q=${encodeURIComponent(
              q || ''
            )}&type=video&key=${apiKey}`
          );

        //   console.log("response from yt api", response);

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'YouTube API request failed');
          }
      
          const data: SearchResult = await response.json();

        //   console.log("response from data api", response);
          
          const formattedResults = data.items.map(item => ({
            id: { videoId: item.id.videoId },
            snippet: {
              title: item.snippet.title, 
              thumbnails: { default: { url: item.snippet.thumbnails.default.url } }
            }
          }));      

          // console.log("this is formatted result", formattedResults);

          return NextResponse.json({items: formattedResults }, {status: 200})
      }catch(error){
        console.error('YouTube search error:', error);
        return NextResponse.json({message: "Youtube search error" }, {status: 500})
      }
}