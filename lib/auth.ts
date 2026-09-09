import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const authOptions: any = {
  providers: [
    CredentialsProvider({
      name: "phone",
      credentials: {
        phone: { label: "Phone", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials: any) {
        try {
          const { connectDB } = await import("@/lib/db");
          const User = (await import("@/models/User")).default;
          await connectDB();
          const user = await User.findOne({ phone: credentials.phone });
          if (!user) return null;
          const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
          if (!isValid) return null;
          return { 
            id: String(user._id), 
            name: user.fullName, 
            phone: user.phone, 
            roles: user.roles 
          };
        } catch (err) {
          return null;
        }
      }
    })
  ],
  secret: process.env.NEXTAUTH_SECRET || "kinoo-ysc-secret-key-2026",
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/" }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };