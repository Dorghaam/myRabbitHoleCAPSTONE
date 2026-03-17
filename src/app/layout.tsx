// this is the root layout that wraps every page in the app
// the navbar goes here so it shows on all pages

import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "myRabbitHole",
  description: "explore any topic through interactive concept maps",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-black">
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
