import { UserPlus } from 'lucide-react'
import React from 'react'

const RoomBox = () => {
  return (
    <div className='flex flex-col gap-4 items-center'>
        <h1 className='text-xl font-white font-semibold'>Join / Create a Room</h1>
        <div className='flex gap-2 items-center'>
            <input type="text" className='border-gray-400 font-funnel py-2 px-4 rounded-xl bg-[#333333]' placeholder='abc-def-ghi' />
            <div className='py-2 px-3 bg-[#99A0AC] rounded-xl'>
            <UserPlus className='text-[#333333]' size={26} />
            </div>
        </div>
    </div>
  )
}

export default RoomBox