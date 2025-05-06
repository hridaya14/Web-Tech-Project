"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getProfile } from '@/utils/profile'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                const profile = await getProfile();

                if (profile?.needsOnboarding) {
                    router.replace("/profile/onboarding");
                } else if (profile?.role === "company") {
                    router.replace("/company/listings");
                } else if (profile?.role === "job_seeker") {
                    router.replace("/candidate/listings");
                } else {
                    setIsChecking(false); // fallback: show auth page
                }
            } catch (err) {
                // Not logged in, show auth page
                setIsChecking(false);
            }
        };

        checkAuthStatus();
    }, [router]);

    if (isChecking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black text-white">
                <p className="text-zinc-400">Checking authentication...</p>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-gradient-to-b from-purple-800 via-black to-black text-white">
            {children}
        </main>
    );
}

