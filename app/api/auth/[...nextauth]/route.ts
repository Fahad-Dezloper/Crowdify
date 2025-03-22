import { prismaClient } from "@/app/lib/db";
import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

const handler = NextAuth({
  providers: [GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID ?? "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? ""
  })],
  secret: process.env.NEXTAUTH_SECRET ?? "secret",
  callbacks: {
    async signIn(params){
          // console.log("user auth details", params);
          if(!params.user.email){
            return false;
          }
          try {
            await prismaClient.user.create({
              data: {
                email: params.user.email,
                name: params.user.name ?? "CN",
                image: params.user.image ?? "",
                provider: "Google"
              }
            })
          } catch (error) {
            console.log(error);
          }
          return true
    }
  }
})

export { handler as GET, handler as POST }