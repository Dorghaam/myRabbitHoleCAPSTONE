"use client";

// login page where users sign in with email and password
// matches the wireframe with a centered card, email/password fields, and a link to signup

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  // state for the form fields and any error messages
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // this runs when the user clicks the login button
  const handleLogin = async (e: React.FormEvent) => {
    // prevent the page from refreshing when the form submits
    e.preventDefault();
    setError("");
    setLoading(true);

    // call supabase to sign in with email and password
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // login worked, send them to the home page
      router.push("/");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl border border-gray-200 shadow-sm">
        {/* heading */}
        <h1 className="text-2xl font-bold mb-1">Login to</h1>
        <p className="text-gray-500 mb-8">continue with myRabbitHole</p>

        {/* login form */}
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          {/* email field */}
          <div>
            <label className="block font-bold mb-2">Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-pink-400"
              required
            />
          </div>

          {/* password field */}
          <div>
            <label className="block font-bold mb-2">Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-pink-400"
              required
            />
          </div>

          {/* show error if login fails */}
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          {/* link to signup page */}
          <p className="text-sm text-gray-600">
            Need an account?{" "}
            <Link href="/signup" className="text-pink-400 underline">
              Sign up here
            </Link>
            .
          </p>

          {/* login button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-black text-white text-lg font-bold rounded-full hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
