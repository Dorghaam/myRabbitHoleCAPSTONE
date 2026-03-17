"use client";

// login page where users sign in with email and password
// matches the wireframe with a centered card, email/password fields, and a link to signup

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  // state for the form fields and any error messages
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // checks the form inputs before we even call supabase
  const validate = () => {
    if (!email.trim()) {
      return "please enter your email";
    }
    // simple check that the email has an @ and a dot
    if (!email.includes("@") || !email.includes(".")) {
      return "please enter a valid email address";
    }
    if (!password) {
      return "please enter your password";
    }
    if (password.length < 6) {
      return "password must be at least 6 characters";
    }
    return "";
  };

  // turns supabase error messages into friendlier ones
  const getFriendlyError = (message: string) => {
    if (message.includes("Invalid login credentials")) {
      return "incorrect email or password, please try again";
    }
    if (message.includes("Email not confirmed")) {
      return "please check your email and confirm your account first";
    }
    if (message.includes("Too many requests")) {
      return "too many login attempts, please wait a moment and try again";
    }
    if (message.includes("User not found")) {
      return "no account found with this email, please sign up first";
    }
    return message;
  };

  // this runs when the user clicks the login button
  const handleLogin = async (e: React.FormEvent) => {
    // prevent the page from refreshing when the form submits
    e.preventDefault();
    setError("");

    // check for input errors first
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    // call supabase to sign in with email and password
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setError(getFriendlyError(error.message));
      setLoading(false);
    } else {
      // login worked, do a full page reload to the home page
      // this makes sure the auth provider picks up the new session
      window.location.href = "/";
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
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-pink-400"
            />
          </div>

          {/* password field */}
          <div>
            <label className="block font-bold mb-2">Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="at least 6 characters"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-pink-400"
            />
          </div>

          {/* show error if something went wrong */}
          {error && (
            <p className="text-red-500 text-sm bg-red-50 px-4 py-2 rounded-lg">
              {error}
            </p>
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
