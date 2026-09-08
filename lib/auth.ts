import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "phone",
      credentials: {
        phone: { label: "Phone", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          const { connectDB } = await import("@/lib/db");
          const User = (await import("@/models/User")).default;
          await connectDB();
          const user = await User.findOne({ phone: credentials.phone });
          if (!user) return null;
          const isValid = await bcrypt.compare(credentials.password as string, user.passwordHash);
          if (!isValid) return null;
          return { 
            id: String(user._id), 
            name: user.fullName, 
            phone: user.phone, 
            roles: user.roles 
          };
        } catch (err) {
          console.error("Auth error:", err);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = String(user.id);
        token.roles = user.roles || [];
        token.phone = user.phone || "";
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.roles = token.roles as string[];
        session.user.phone = token.phone as string;
      }
      return session;
    }
  },
  pages: { signIn: "/" },
  secret: process.env.NEXTAUTH_SECRET || "kinoo-ysc-secret-key-2026",
  trustHost: true
});