import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/providers/provider";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Auth System Dash",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}

          {/* Toast container */}
          <Toaster
            position="bottom-center"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#333",
                color: "#fff",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
