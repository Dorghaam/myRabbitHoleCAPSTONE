"use client";

// signup page where new users create an account
// matches the wireframe with a centered card, email/password fields, and a signup button

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function SignupPage() {
  // state for the form fields and any error/success messages
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
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
      return "please enter a password";
    }
    if (password.length < 6) {
      return "password must be at least 6 characters";
    }
    if (password !== confirmPassword) {
      return "passwords do not match";
    }
    return "";
  };

  // turns supabase error messages into friendlier ones
  const getFriendlyError = (message: string) => {
    if (message.includes("User already registered")) {
      return "an account with this email already exists, try logging in instead";
    }
    if (message.includes("Password should be at least")) {
      return "password must be at least 6 characters";
    }
    if (message.includes("Unable to validate email")) {
      return "please enter a valid email address";
    }
    if (message.includes("Too many requests")) {
      return "too many signup attempts, please wait a moment and try again";
    }
    if (message.includes("Signups not allowed")) {
      return "signups are currently disabled, please contact the admin";
    }
    return message;
  };

  // this runs when the user clicks the signup button
  const handleSignup = async (e: React.FormEvent) => {
    // prevent the page from refreshing when the form submits
    e.preventDefault();
    setError("");
    setSuccess("");

    // check for input errors first
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    // call supabase to create a new account
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });

    if (error) {
      setError(getFriendlyError(error.message));
      setLoading(false);
    } else {
      // account created, let user know then redirect to login
      setSuccess("account created! redirecting to login...");
      setLoading(false);
      // full page reload so the auth provider picks up the session
      setTimeout(() => {
        window.location.href = "/login";
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

          {/* confirm password field */}
          <div>
            <label className="block font-bold mb-2">Confirm Password:</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="type your password again"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-pink-400"
            />
          </div>

          {/* show error if something went wrong */}
          {error && (
            <p className="text-red-500 text-sm bg-red-50 px-4 py-2 rounded-lg">
              {error}
            </p>
          )}

          {/* show success message */}
          {success && (
            <p className="text-green-600 text-sm bg-green-50 px-4 py-2 rounded-lg">
              {success}
            </p>
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
