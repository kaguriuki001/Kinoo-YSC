import "./globals.css";
import { Toaster } from "sonner";
import { Providers } from "./providers";

export const metadata = {
  title: "Kinoo YSC",
  description: "Kinoo Youth Group Management System",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          {children}
          <Toaster position="top-center" richColors />
        </Providers>
      </body>
    </html>
  );
}
