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

          let searchValue = identifier.trim();
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
            roles: user.roles
          };
        } catch (err) {
          console.error("Auth error:", err);
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