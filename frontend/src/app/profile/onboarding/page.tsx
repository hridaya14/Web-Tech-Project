'use client'
import { CandidateOnboarding } from '@/app/components/signup/CandidateOnboarding'
import { CompanyOnboarding } from '@/app/components/signup/CompanyOnboarding'
import { redirect } from 'next/navigation'
import { useEffect, useState } from 'react'

const Onboarding = () => {
    const [isloading, setIsloading] = useState(true)
    const [role, setRole] = useState(null)

    useEffect(() => {

        const checkStatus = async () => {

            try {

                const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/getProfile`, { credentials: "include" });
                const data = await res.json();

                if (!data.needsOnboarding) {
                    redirect("/dashboard")
                }

                setRole(data.role)
                setIsloading(false)

            }
            catch {
                redirect("/auth/login")
            }
        }

        checkStatus()
    }, [])

    if (isloading) {
        return <div>Loading...</div>
    }

    return (
        <div className="w-full">
            {role === "candidate" ? (
                <CandidateOnboarding />
            ) : (
                <CompanyOnboarding />
            )}
        </div>
    );
}

export default Onboarding
