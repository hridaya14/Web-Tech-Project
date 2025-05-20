'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Profile = {
    full_name: string;
    location: string;
    phone_number: string;
    linkedin_url: string;
    portfolio_url: string;
    resume_url?: string;
    skills: string[];
    experience: number;
    expected_roles: string;
    current_status: string;
};

export default function CandidateProfile() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [error, setError] = useState('');
    const router = useRouter();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/getProfile`, { credentials: 'include' });
                if (!res.ok) throw new Error('Failed to fetch profile');
                const data = await res.json();
                if (!data.profile) throw new Error('Profile not found');
                setProfile(data.profile);
            } catch (err: any) {
                setError(err.message || 'An error occurred');
            }
        };
        fetchProfile();
    }, []);

    const handleLogout = () => {
        // Add your logout logic here
        router.push('/auth/login');
    };

    return (
        <div className="min-h-screen bg-gray-950 text-white p-6 md:p-10">
            {/* Top Bar */}
            <div className="flex justify-between items-center mb-10">
                <div></div>
                <h1 className="text-3xl font-bold tracking-wide">Your Profile</h1>
                <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-md text-sm font-medium"
                >
                    Logout
                </button>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-700/80 p-4 rounded-md text-sm mb-4">
                    {error}
                </div>
            )}

            {/* Loading State */}
            {!error && !profile && (
                <div className="text-gray-400 text-sm">Loading profile...</div>
            )}

            {/* Profile Content */}
            {profile && (
                <div className="bg-gray-900 p-8 rounded-2xl shadow-md border border-gray-700 space-y-10">
                    {/* Personal Info */}
                    <div className="space-y-2">
                        <h2 className="text-xl font-semibold border-b border-gray-700 pb-2 mb-3">Personal Information</h2>
                        <div className="grid sm:grid-cols-2 gap-6">
                            <p><span className="text-gray-400">Name:</span> {profile.full_name}</p>
                            <p><span className="text-gray-400">Phone:</span> {profile.phone_number}</p>
                            <p><span className="text-gray-400">Location:</span> {profile.location}</p>
                            <p><span className="text-gray-400">Experience:</span> {profile.experience} month(s)</p>
                        </div>
                    </div>

                    {/* Status Info */}
                    <div className="space-y-2">
                        <h2 className="text-xl font-semibold border-b border-gray-700 pb-2 mb-3">Job Preferences</h2>
                        <div className="grid sm:grid-cols-2 gap-6">
                            <p><span className="text-gray-400">Current Status:</span> {profile.current_status}</p>
                            <p><span className="text-gray-400">Expected Role:</span> {profile.expected_roles}</p>
                        </div>
                    </div>

                    {/* Skills */}
                    <div>
                        <h2 className="text-xl font-semibold border-b border-gray-700 pb-2 mb-3">Skills</h2>
                        <div className="flex flex-wrap gap-3 mt-3">
                            {profile?.skills?.map((skill, idx) => (
                                <span key={idx} className="px-3 py-1.5 bg-gray-700 rounded-full text-sm">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Links */}
                    <div>
                        <h2 className="text-xl font-semibold border-b border-gray-700 pb-2 mb-3">External Links</h2>
                        <ul className="space-y-2 mt-3">
                            {profile.linkedin_url && profile.linkedin_url !== 'N/A' && (
                                <li>
                                    <a
                                        href={profile.linkedin_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-blue-400 hover:underline"
                                    >
                                        LinkedIn Profile
                                    </a>
                                </li>
                            )}
                            {profile.portfolio_url && profile.portfolio_url !== 'N/A' && (
                                <li>
                                    <a
                                        href={profile.portfolio_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-blue-400 hover:underline"
                                    >
                                        Portfolio Website
                                    </a>
                                </li>
                            )}
                        </ul>
                    </div>

                    {/* Resume Button */}
                    <div className="text-right mt-10">
                        {profile.resume_url ? (
                            <button
                                onClick={() => window.open(profile.resume_url, '_blank')}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-md font-medium text-white transition"
                            >
                                Preview Resume
                            </button>
                        ) : (
                            <span className="text-gray-400">No resume uploaded</span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

