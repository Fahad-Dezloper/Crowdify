import StreamView from '@/app/components/StreamView'
import React from 'react'

const page = ({params: {creatorId}}) => {
  return (
    <div>
      <StreamView creatorId={creatorId} />
    </div>
  )
}

export default page