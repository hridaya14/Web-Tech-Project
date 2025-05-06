"use client"
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CompanyNavbar from '@/app/components/company/CompanyNavbar';


const getProfile = async () => {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/getProfile`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
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

const CompanyLayout = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<any>(null); // User profile
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        let cancelled = false; // Prevent state updates if component is unmounted

        const fetchProfile = async () => {
            try {
                const userProfile = await getProfile(); // Fetch user profile
                if (cancelled) return;

                if (!userProfile) {
                    router.replace('/auth/login'); // Use replace to avoid adding to history
                    return;
                }

                if (userProfile.role !== 'company') {
                    router.replace('/candidate/jobs'); // Redirect to candidate jobs if role is not company
                    return;
                }

                setUser(userProfile);
            } catch (error) {
                console.error('Error fetching profile:', error);
                if (!cancelled) router.replace('/auth/login'); // Redirect to login on error
            } finally {
                if (!cancelled) setLoading(false); // Set loading to false once profile is fetched
            }
        };

        fetchProfile();

        return () => {
            cancelled = true; // Cleanup to avoid state updates on unmounted component
        };
    }, [router]);

    if (loading) return <div>Loading...</div>; // Optionally, you can replace with a spinner

    return (
        <div>
            <CompanyNavbar user={user} />
            <div>{children}</div> {/* Page content */}
        </div>
    );
};

export default CompanyLayout;
