"use client";

// signup page where new users create an account
// matches the wireframe with a centered card, email/password fields, and a signup button

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function SignupPage() {
  // state for the form fields and any error/success messages
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // this runs when the user clicks the signup button
  const handleSignup = async (e: React.FormEvent) => {
    // prevent the page from refreshing when the form submits
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    // call supabase to create a new account
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // account created, let user know to check email or redirect them
      setSuccess("Account created! You can now log in.");
      setLoading(false);
      // after a short delay, send them to the login page
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl border border-gray-200 shadow-sm">
        {/* heading */}
        <h1 className="text-2xl font-bold mb-1">Signup to</h1>
        <p className="text-gray-500 mb-8">continue with myRabbitHole</p>

        {/* signup form */}
        <form onSubmit={handleSignup} className="flex flex-col gap-4">
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
              minLength={6}
              required
            />
          </div>

          {/* show error if signup fails */}
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          {/* show success message */}
          {success && (
            <p className="text-green-500 text-sm">{success}</p>
          )}

          {/* link to login page */}
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="text-pink-400 underline">
              Log in here
            </Link>
            .
          </p>

          {/* signup button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-black text-white text-lg font-bold rounded-full hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Signup"}
          </button>
        </form>
      </div>
    </div>
  );
}
