'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Application {
    ApplicationID: string;
    CandidateID: string;
    JobID: string;
    Status: string;
    AppliedAt: string;
}

const ApplicationsPage = () => {
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const res = await axios.get<{ applications: Application[] }>(
                    `${process.env.NEXT_PUBLIC_BASE_URL}/candidate/Applications`,
                    {
                        withCredentials: true,
                    }
                );
                setApplications(res.data.applications);
            } catch (err) {
                console.error('Failed to fetch applications', err);
            } finally {
                setLoading(false);
            }
        };

        fetchApplications();
    }, []);

    if (loading)
        return <p className="text-center mt-6 text-white">Loading...</p>;

    if (applications.length === 0)
        return (
            <p className="text-center mt-6 text-white">No Applications Found.</p>
        );

    return (
        <div className="min-h-screen bg-gray-900 text-white py-8 px-4">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 text-center">
                    Your Applications
                </h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {applications.map((app) => (
                        <div
                            key={app.ApplicationID}
                            className="bg-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-xl transition duration-300 border border-gray-700"
                        >
                            <p className="mb-3">
                                <span className="font-semibold text-gray-300">Job ID:</span>{' '}
                                {app.JobID}
                            </p>
                            <p className="mb-3">
                                <span className="font-semibold text-gray-300">Status:</span>{' '}
                                <span
                                    className={`font-bold ${app.Status === 'pending'
                                        ? 'text-yellow-400'
                                        : app.Status === 'accepted'
                                            ? 'text-green-400'
                                            : 'text-red-400'
                                        }`}
                                >
                                    {app.Status.charAt(0).toUpperCase() + app.Status.slice(1)}
                                </span>
                            </p>
                            <p>
                                <span className="font-semibold text-gray-300">Applied At:</span>{' '}
                                {new Date(app.AppliedAt).toLocaleDateString()}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ApplicationsPage;

