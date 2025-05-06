// app/auth/register/page.tsx
import { registerHandler } from "@/actions/auth";
import Link from "next/link";
import React from "react";

export default function RegisterPage() {
    return (
        <main className="min-h-screen bg-gradient-to-b from-purple-800 via-black to-black flex items-center justify-center text-white px-4">
            <form
                action={registerHandler}
                className="bg-zinc-900 p-8 md:p-10 rounded-xl shadow-lg w-full max-w-md space-y-6"
            >
                <div className="text-center space-y-1">
                    <h1 className="text-2xl font-bold">Sign Up Account</h1>
                    <p className="text-sm text-zinc-400">
                        Enter your details to create your account
                    </p>
                </div>

                <div className="space-y-4">
                    <input
                        name="username"
                        placeholder="Username"
                        required
                        className="w-full px-4 py-2 rounded-md bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                    <input
                        name="email"
                        type="email"
                        placeholder="Email"
                        required
                        className="w-full px-4 py-2 rounded-md bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                    <input
                        name="password"
                        type="password"
                        placeholder="Password"
                        required
                        className="w-full px-4 py-2 rounded-md bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                    <p className="text-xs text-zinc-500">Minimum 8 characters</p>

                    <div className="flex items-center justify-start gap-4 text-sm mt-2">
                        <label className="flex items-center space-x-2">
                            <input
                                type="radio"
                                name="role"
                                value="candidate"
                                defaultChecked
                                className="accent-purple-600"
                            />
                            <span>Job Seeker</span>
                        </label>
                        <label className="flex items-center space-x-2">
                            <input
                                type="radio"
                                name="role"
                                value="company"
                                className="accent-purple-600"
                            />
                            <span>Company</span>
                        </label>
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full py-2 bg-purple-600 hover:bg-purple-700 transition-colors text-white font-medium rounded-md"
                >
                    Sign Up
                </button>

                <p className="text-sm text-center text-zinc-400">
                    Already have an account?{" "}
                    <Link href="/auth/login" className="text-purple-400 hover:underline">
                        Log In
                    </Link>
                </p>
            </form>
        </main>
    );
}

