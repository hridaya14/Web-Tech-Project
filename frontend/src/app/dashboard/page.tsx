"use client"

import { useEffect, useState } from "react"

interface User {
    username: string
    email: string
    role: string
}

export default function DashboardClient() {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch("http://localhost:8000/getProfile", {
                    credentials: "include", // This ensures cookies are sent
                })

                if (!res.ok) {
                    throw new Error("Failed to fetch user info")
                }

                const data = await res.json()
                setUser(data)
            } catch (error) {
                console.error("Error fetching profile:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchProfile()
    }, [])

    if (loading) return <div>Loading...</div>
    if (!user) return <div>Could not load user data</div>

    return (
        <div className="flex items-center justify-center h-screen">
            <div className="bg-black shadow-xl rounded-2xl p-8 max-w-sm text-center">
                <h2 className="text-2xl font-semibold mb-2">Welcome, {user.username} 👋</h2>
                <p className="text-gray-600">Email: {user.email}</p>
                <p className="text-gray-600">Role: {user.role}</p>
            </div>
        </div>
    )
}

