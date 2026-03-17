"use client";

// the main navbar that shows on every page
// has the logo, navigation links, and login/profile section
// when logged in it shows the users name instead of the login link

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";

export default function Navbar() {
  // usePathname lets us know which page we are on so we can bold the active link
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();

  // get a display name from the user object
  // try full name from metadata first, then fall back to the email
  const displayName =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "User";

  // sign the user out and send them to the home page
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

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

        {/* right side: login link or user name */}
        <div className="flex items-center gap-4">
          {loading ? (
            // show nothing while we check if user is logged in
            <div className="w-20" />
          ) : user ? (
            // user is logged in, show their name and a logout button
            <>
              <span className="text-lg font-bold">{displayName}</span>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Logout
              </button>
            </>
          ) : (
            // user is not logged in, show login link
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
          )}

          {/* profile icon */}
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
