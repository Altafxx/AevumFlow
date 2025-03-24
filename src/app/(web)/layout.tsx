import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/styles/globals.css";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

//eslint-disable-next-line @typescript-eslint/no-unused-vars
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

//eslint-disable-next-line @typescript-eslint/no-unused-vars
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AevumFlow",
  description: "A simple VOD engine",
};

export default function WebLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />
      <div className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 relative">
        {children}
      </div>
      <Footer />
    </>
  );
}
