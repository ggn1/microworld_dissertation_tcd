import { Inter } from "next/font/google"
import "./globals.css"

const font = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Mycroforest",
  description: "A microworld to teach about forest mangement and climate change.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={font.className}>{children}</body>
    </html>
  );
}
