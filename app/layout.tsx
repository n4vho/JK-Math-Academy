import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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
  title: "Tutoring Center - Excellence in Education",
  description: "Personalized tutoring that helps students achieve their academic goals. Enroll today and start your learning journey.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <nav className="border-b bg-background">
          <div className="container mx-auto px-4">
            <div className="flex h-16 items-center justify-between">
              <Link
                href="/"
                className="text-lg font-semibold text-foreground hover:text-foreground/80"
              >
                Tutoring Center
              </Link>
              <div className="flex items-center gap-4">
                <Link
                  href="/#services"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Services
                </Link>
                <Link
                  href="/#how-it-works"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  How It Works
                </Link>
                <Link
                  href="/#contact"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Contact
                </Link>
                <Link
                  href="/enroll/status"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Check Status
                </Link>
                <Link href="/enroll">
                  <Button size="sm">Enroll</Button>
                </Link>
              </div>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
