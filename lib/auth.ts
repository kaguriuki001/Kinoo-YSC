import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const authOptions: any = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        identifier: { label: "Phone or Name", type: "text" },
        phone: { label: "Phone", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials: any) {
        try {
          const { connectDB } = await import("@/lib/db");
          const User = (await import("@/models/User")).default;
          await connectDB();

          const identifier = credentials.identifier || credentials.phone || "";
          if (!identifier) return null;

          const searchValue = identifier.trim();
          const isNumeric = /^[\d\s\+\-]+$/.test(searchValue);

          let user;
          if (isNumeric) {
            let formattedPhone = searchValue.replace(/\D/g, "");
            if (formattedPhone.startsWith("0")) formattedPhone = "254" + formattedPhone.substring(1);
            if (formattedPhone.startsWith("7") || formattedPhone.startsWith("1")) formattedPhone = "254" + formattedPhone;
            user = await User.findOne({ phone: formattedPhone });
          }

          if (!user) {
            user = await User.findOne({ fullName: { $regex: new RegExp(`^${searchValue}$`, 'i') } });
          }

          if (!user) {
            user = await User.findOne({ fullName: { $regex: new RegExp(searchValue, 'i') } });
          }

          if (!user) return null;

          const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
          if (!isValid) return null;

          return {
            id: String(user._id),
            name: user.fullName,
            phone: user.phone,
            roles: user.roles,
            outstation: user.outstation || null
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
        token.id = user.id;
        token.roles = user.roles || ['member'];
        token.phone = user.phone;
        token.name = user.name;
        token.outstation = user.outstation || null;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.roles = token.roles as string[];
        session.user.phone = token.phone as string;
        session.user.name = token.name as string;
        (session.user as any).outstation = token.outstation;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET || "kinoo-ysc-secret-key-2026",
  trustHost: true,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60
  },
  useSecureCookies: true,
  cookies: {
    sessionToken: {
      name: "__Secure-next-auth.session-token",
      options: { httpOnly: true, sameSite: "lax", path: "/", secure: true }
    },
    callbackUrl: {
      name: "__Secure-next-auth.callback-url",
      options: { sameSite: "lax", path: "/", secure: true }
    },
    csrfToken: {
      name: "__Host-next-auth.csrf-token",
      options: { httpOnly: true, sameSite: "lax", path: "/", secure: true }
    }
  },
  pages: { signIn: "/" }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
