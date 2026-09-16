import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://ayaabot.vercel.app"),
  title: "Ayaa Bot 🌸 — Cute AI Image Upscaler & Sweet Virtual Economy",
  description:
    "Private Discord bot untuk image upscaling 2× HD dan virtual economy gemas. Created with love by Justdhif.",
  icons: {
    icon: "/avatar.jpeg",
    apple: "/avatar.jpeg",
  },
  openGraph: {
    title: "Ayaa Bot 🌸 — Cute AI Image Upscaler",
    description: "Sulap fotomu makin jernih, tajam & gemas langsung dari Discord! ✨",
    images: [
      {
        url: "/banner.png",
        width: 2048,
        height: 768,
        alt: "Ayaa Bot Banner",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>
        <div className="bg-blob-1" />
        <div className="bg-blob-2" />
        {children}
      </body>
    </html>
  );
}
