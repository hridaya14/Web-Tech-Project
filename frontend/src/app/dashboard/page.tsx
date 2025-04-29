'use client'
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface User {
    username: string
    email: string
    role: string
}

export default function DashboardClient() {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/getProfile`, {
                    credentials: "include",
                })

                if (!res.ok) {
                    throw new Error("Failed to fetch user info")
                }

                const data = await res.json()

                if (data.needsOnboarding) {
                    router.push("/profile/onboarding")
                } else {
                    setUser(data)
                }
            } catch (error) {
                console.log("Unable to fetch user:", error)
                router.push("/auth/login")
            } finally {
                setLoading(false)
            }
        }

        fetchProfile()
    }, [router])

    if (loading) return <div>Loading...</div>

    return (
        <div className="flex items-center justify-center h-screen">
            <div className="bg-black shadow-xl rounded-2xl p-8 max-w-sm text-center">
                <h2 className="text-2xl font-semibold mb-2">Welcome, {user?.username} 👋</h2>
                <p className="text-gray-600">Email: {user?.email}</p>
                <p className="text-gray-600">Role: {user?.role}</p>
            </div>
        </div>
    )
}

