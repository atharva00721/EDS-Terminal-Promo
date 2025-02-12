import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EDS Terminal | Echelon Dev Society",
  description:
    "A premium interactive console experience by Echelon Dev Society. Join our community for cutting-edge developments.",
  icons: {
    icon: "/public/edsicon.png",
    apple: "/public/edsicon.png",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "EDS Terminal | Echelon Dev Society",
    description:
      "A premium interactive console experience by Echelon Dev Society",
    images: [
      {
        url: "/edsicon.png",
        width: 800,
        height: 800,
        alt: "EDS Terminal Logo",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "EDS Terminal | Echelon Dev Society",
    description:
      "A premium interactive console experience by Echelon Dev Society",
    images: ["/edsicon.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/edsicon.png" />
        <link rel="apple-touch-icon" href="/edsicon.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
