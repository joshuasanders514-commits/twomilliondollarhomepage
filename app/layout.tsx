import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "2M Homepage",
  description: "Built by Noah using AI",
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}