'use client'
import { CandidateOnboarding } from '@/app/components/signup/CandidateOnboarding'
import { CompanyOnboarding } from '@/app/components/signup/CompanyOnboarding'
import { getProfile } from '@/utils/profile'
import { redirect } from 'next/navigation'
import { useEffect, useState } from 'react'

const Onboarding = () => {
    const [isloading, setIsloading] = useState(true)
    const [role, setRole] = useState(null)

    useEffect(() => {

        const checkStatus = async () => {

            try {

                const user = await getProfile()

                if (!user.needsOnboarding) {
                    redirect("/dashboard")
                }

                setRole(user.role)
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
