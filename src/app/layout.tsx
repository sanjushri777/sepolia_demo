import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";


const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "BITNET | Lightning Web3 Portal",
  description: "The next-gen decentralized data network.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${montserrat.className} bg-[#100426] min-h-screen w-full antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

