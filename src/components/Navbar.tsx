"use client";

// the main navbar that shows on every page
// has the logo, navigation links, and login/profile section

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  // usePathname lets us know which page we are on so we can bold the active link
  const pathname = usePathname();

  return (
    <nav className="w-full">
      <div className="flex items-center justify-between px-8 py-4">
        {/* logo on the left */}
        <Link href="/" className="text-2xl font-bold">
          my<span className="text-pink-400">Rabbit</span>Hole
        </Link>

        {/* navigation links in the middle */}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className={`text-lg ${
              pathname === "/" ? "font-bold" : "text-gray-600"
            }`}
          >
            Featured
          </Link>
          <Link
            href="/create"
            className={`text-lg ${
              pathname === "/create" ? "font-bold" : "text-gray-600"
            }`}
          >
            Create New
          </Link>
        </div>

        {/* login and profile on the right */}
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className={`text-lg ${
              pathname === "/login" || pathname === "/signup"
                ? "font-bold"
                : "text-gray-600"
            }`}
          >
            Login
          </Link>

          {/* profile icon placeholder */}
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-gray-400"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v2h20v-2c0-3.3-6.7-5-10-5z" />
            </svg>
          </div>
        </div>
      </div>

      {/* pink line under the navbar */}
      <div className="w-full h-0.5 bg-pink-300" />
    </nav>
  );
}
