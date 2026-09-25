import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RSU Shuttle Tracker",
  description: "Public shuttle route and stop information"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
