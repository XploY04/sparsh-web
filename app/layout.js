"use client";
import "./globals.css";
import { SessionProvider } from "next-auth/react";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <div className="flex min-h-screen">
            <aside className="w-64 bg-gray-800 text-white p-4">
              <nav>
                <ul>
                  <li>
                    <a href="/dashboard">Dashboard</a>
                  </li>
                  <li>
                    <a href="/dashboard/trials/new">New Trial</a>
                  </li>
                </ul>
              </nav>
            </aside>
            <main className="flex-1 p-8 bg-gray-50">{children}</main>
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
