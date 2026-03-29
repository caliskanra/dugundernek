import { PrismaAdapter } from "@auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./prisma"

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "demo-client-id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "demo-client-secret",
    }),
    CredentialsProvider({
      name: "Demo Giris (Test Icin)",
      credentials: {
        username: { label: "Kullanıcı Adı", type: "text", placeholder: "demo" },
        password: { label: "Şifre", type: "password" }
      },
      async authorize(credentials) {
        // For local testing without Google Client ID/Secret
        if (credentials.username === "demo" && credentials.password === "demo") {
          let user = await prisma.user.findFirst({ where: { email: "demo@dugundernek.com" } });
          if (!user) {
            user = await prisma.user.create({
              data: {
                name: "Demo Çift",
                email: "demo@dugundernek.com",
              }
            });
          }
          return user;
        }
        return null;
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/", // We will put login on the main page
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub;
      }
      return session;
    }
  }
}
