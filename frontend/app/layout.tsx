import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { QueryProvider } from "@/components/providers/query-provider";
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
  title: "Quiz Builder",
  description: "Create and manage quizzes with multiple question types",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background min-h-screen`}
      >
        <QueryProvider>
          <nav className="bg-card shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex items-center">
                  <Link href="/" className="text-xl font-bold text-primary">
                    Quiz Builder
                  </Link>
                </div>
                <div className="flex items-center space-x-4">
                  <Button variant="ghost" asChild>
                    <Link href="/quizzes">All Quizzes</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/create">Create Quiz</Link>
                  </Button>
                </div>
              </div>
            </div>
          </nav>
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
        </QueryProvider>
      </body>
    </html>
  );
}
