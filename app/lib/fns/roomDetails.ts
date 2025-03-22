/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosResponse } from "axios";

// @ts-ignore
export const fetchRoomDetails = async (roomId: string | string[] | undefined) => {
    try {
      const [roomResponse, userResponse] = await Promise.all([
        axios.get(`/api/room/${roomId}`),
        axios.get("/api/user/fetchUser")
    ]);

    // console.log("Room details response:", roomResponse);
    // console.log("User details response:", userResponse);

    return {
        room: roomResponse.data,
        user: userResponse.data
    };

      } catch (err) {
        console.log("error", err);
      }
  };