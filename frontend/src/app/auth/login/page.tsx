"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
                credentials: "include", // crucial for cookies
            });

            if (!res.ok) {
                const err = await res.json();
                setError(err?.message || "Login failed");
                return;
            }

            router.push("/dashboard");
        } catch (err: any) {
            setError("Something went wrong. Try again.");
        }
    };

    return (
        <main className="min-h-screen bg-gradient-to-b from-purple-800 via-black to-black flex items-center justify-center text-white px-4">
            <form
                onSubmit={handleLogin}
                className="bg-zinc-900 p-8 md:p-10 rounded-xl shadow-lg w-full max-w-md space-y-6"
            >
                <div className="text-center space-y-1">
                    <h1 className="text-2xl font-bold">Welcome Back</h1>
                    <p className="text-sm text-zinc-400">Log in to your account</p>
                </div>

                <div className="space-y-4">
                    <input
                        name="email"
                        type="email"
                        placeholder="Email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2 rounded-md bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                    <input
                        name="password"
                        type="password"
                        placeholder="Password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-2 rounded-md bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                </div>

                {error && (
                    <p className="text-red-400 text-sm text-center">{error}</p>
                )}

                <button
                    type="submit"
                    className="w-full py-2 bg-purple-600 hover:bg-purple-700 transition-colors text-white font-medium rounded-md"
                >
                    Log In
                </button>

                <p className="text-sm text-center text-zinc-400">
                    Don’t have an account?{" "}
                    <Link href="/auth/register" className="text-purple-400 hover:underline">
                        Sign Up
                    </Link>
                </p>
            </form>
        </main>
    );
}

