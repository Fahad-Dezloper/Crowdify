/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { SetStateAction } from "react";

export const fetchRoomDetails = async (roomId: string | string[] | undefined, setRoomData: { (value: SetStateAction<null>): void; (arg0: any): void; }, setIsAdmin: { (value: SetStateAction<boolean>): void; (arg0: any): void; }, setUserId, setUserDets) => {
    try {
        const res = await axios.get(`/api/room/${roomId}`);
        // console.log("res from /api/room:-", res);
        setRoomData(res.data.room); 
        setIsAdmin(res.data.isAdmin);
        setUserId(res.data.userId);

        const userDetails = await axios.get("/api/user/fetchUser");
        // console.log("user details are", userDetails);
        setUserDets(userDetails);

      } catch (err) {
        console.log("error", err);
      }
  };