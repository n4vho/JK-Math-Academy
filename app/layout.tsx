import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import Image from "next/image";
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
  title: "Math Academy - Cadet College Admission Coaching",
  description: "Specialized Math coaching for Bangladesh Cadet College admission tests. Directed by Jahangir Kabir Sir. Special Care Program with personalized attention. Call +8801914070418.",
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
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <Image
                  src="/math-academy-logo.jpeg"
                  alt="Math Academy Logo"
                  width={40}
                  height={40}
                  className="h-10 w-auto"
                  priority
                />
                <span className="text-lg font-semibold text-foreground">
                  Math Academy
                </span>
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
                <Link
                  href="/student/login"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Student Login
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
