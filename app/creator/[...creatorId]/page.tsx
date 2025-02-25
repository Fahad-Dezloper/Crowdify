"use client";
import { useParams } from "next/navigation";
import StreamView from "@/app/components/StreamView";
import React from "react";
import { useSession } from "next-auth/react";

const Page = () => {
  const params = useParams();
  // const session = useSession();
  if (!params?.creatorId) {
    return <div>Loading...</div>; // Handle case when params are not yet available
  }

  return (
    <div>
      <StreamView creatorId={params.creatorId} playVideo={false} />
    </div>
  );
};

export default Page;
