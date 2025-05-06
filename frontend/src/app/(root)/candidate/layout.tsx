"use client"
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CandidateNavbar from '@/app/components/candidate/CandidateNavbar';


const getProfile = async () => {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/getProfile`, {
            method: 'GET',
            credentials: 'include'
        });

        if (!res.ok) {
            throw new Error('Failed to fetch user profile');
        }

        const data = await res.json();
        return data;
    } catch (error) {
        console.error('Profile fetch failed', error);
        throw new Error('Unable to fetch profile');
    }
};

const CandidateLayout = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<any>(null); // User profile
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        let cancelled = false; // prevent state updates if unmounted

        const fetchProfile = async () => {
            try {
                const userProfile = await getProfile();

                if (cancelled) return;

                if (!userProfile) {
                    router.replace('/auth/login');
                    return;
                }

                if (userProfile.role !== 'candidate') {
                    router.replace('/company/listings');
                    return;
                }

                setUser(userProfile);
            } catch (error) {
                console.error('Error fetching profile:', error);
                if (!cancelled) router.replace('/auth/login');
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchProfile();

        return () => {
            cancelled = true; // clean up to avoid state updates on unmounted components
        };
    }, [router]);

    if (loading) return <div>Loading...</div>; // You can replace with a spinner

    return (
        <div>
            <CandidateNavbar user={user} />
            <div>{children}</div> {/* Page content */}
        </div>
    );
};

export default CandidateLayout;
