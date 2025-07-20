"use client";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { usePathname } from "next/navigation";
import Navigation from "./components/Navigation";
import ToastProvider from "./components/ui/Toast";
import ErrorBoundary from "./components/ui/ErrorBoundary";

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login" || pathname === "/";

  return (
    <html lang="en">
      <head>
        <title>Sparsh - Clinical Trials Portal</title>
        <meta
          name="description"
          content="Professional clinical trials management system"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="antialiased">
        <ErrorBoundary>
          <SessionProvider>
            <ToastProvider />
            {isLoginPage ? (
              <main className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
                {children}
              </main>
            ) : (
              <div className="flex min-h-screen bg-neutral-50">
                <Navigation />
                <main className="flex-1 overflow-hidden">
                  <div className="h-full overflow-y-auto">
                    <div className="p-8">
                      <ErrorBoundary>{children}</ErrorBoundary>
                    </div>
                  </div>
                </main>
              </div>
            )}
          </SessionProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
