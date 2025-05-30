'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Application {
    ApplicationID: string;
    CandidateID: string;
    JobID: string;
    Status: string;
    AppliedAt: string;
    CandidateName: string;
    CandidateSkills: string[];
}

interface ApplicantPool {
    JobID: string;
    Applications: Application[];
}

interface ApplicantsResponse {
    applications: ApplicantPool[];
}

interface Candidate {
    id: string;
    user_id: string;
    full_name: string;
    location: string;
    phone_number: string;
    linkedin_url?: string;
    portfolio_url?: string;
    resume_url: string;
    skills: string[];
    experience_years: number;
    expected_roles: string;
    current_status: string;
    created_at: string;
}

const CompanyApplicantsPage = () => {
    const [applicantPools, setApplicantPools] = useState<ApplicantPool[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedCandidateID, setSelectedCandidateID] = useState<string | null>(null);
    const [candidateData, setCandidateData] = useState<Candidate | null>(null);

    useEffect(() => {
        const fetchApplicants = async () => {
            try {
                const response = await axios.get<ApplicantsResponse>(
                    `${process.env.NEXT_PUBLIC_BASE_URL}/company/Applicants`,
                    {
                        withCredentials: true,
                    }
                );
                setApplicantPools(response.data.applications ?? []);
            } catch (error) {
                console.error('Error fetching applicants:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchApplicants();
    }, []);

    const fetchCandidateData = async (candidateId: string) => {
        try {
            const response = await axios.get<Candidate>(
                `${process.env.NEXT_PUBLIC_BASE_URL}/candidate/${candidateId}`,
                { withCredentials: true }
            );
            setCandidateData(response.data);
        } catch (error) {
            console.error('Error fetching candidate data:', error);
            setCandidateData(null);
        }
    };

    const handleCandidateClick = (candidateId: string) => {
        setSelectedCandidateID(candidateId);
        fetchCandidateData(candidateId);
        setModalOpen(true);
    };

    if (loading) return <p className="text-center mt-6 text-white">Loading...</p>;

    if (applicantPools.length === 0)
        return <p className="text-center mt-6 text-white">No Applicants Found.</p>;

    return (
        <div className="bg-gray-950 min-h-screen text-white py-10 px-4">
            <div className="max-w-5xl mx-auto space-y-10">
                <h1 className="text-3xl font-bold mb-6 text-center">Applicant Pools</h1>

                {applicantPools?.map((pool) => (
                    <div key={pool.JobID} className="space-y-4">
                        <h2 className="text-xl font-semibold border-b border-gray-700 pb-2">
                            Job ID: <span className="text-blue-400 font-mono">{pool.JobID}</span>
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {pool?.Applications?.map((app) => (
                                <div
                                    key={app.ApplicationID}
                                    className="bg-gray-800 p-5 rounded-2xl shadow-md border border-gray-700 hover:bg-gray-700 transition-all space-y-3 cursor-pointer"
                                    onClick={() => handleCandidateClick(app.CandidateID)}
                                >
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-lg font-semibold">{app.CandidateName}</h3>
                                        <span
                                            className={`px-2 py-1 rounded text-sm ${app.Status === 'pending'
                                                ? 'bg-yellow-600'
                                                : app.Status === 'accepted'
                                                    ? 'bg-green-600'
                                                    : 'bg-red-600'
                                                }`}
                                        >
                                            {app.Status.charAt(0).toUpperCase() + app.Status.slice(1)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-400">
                                        Applied on: {new Date(app.AppliedAt).toLocaleDateString()}
                                    </p>
                                    <p className="text-sm">
                                        <strong>Candidate ID:</strong> <span className="font-mono text-xs">{app.CandidateID}</span>
                                    </p>
                                    <p className="text-sm">
                                        <strong>Skills:</strong> {app.CandidateSkills.length > 0 ? app.CandidateSkills.join(', ') : 'N/A'}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {modalOpen && candidateData && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 px-4">
                    <div className="bg-gray-900 rounded-2xl shadow-2xl p-6 w-full max-w-2xl text-white relative space-y-6">
                        <button
                            className="absolute top-3 right-4 text-white text-2xl hover:text-red-400"
                            onClick={() => {
                                setModalOpen(false);
                                setSelectedCandidateID(null);
                                setCandidateData(null);
                            }}
                        >
                            &times;
                        </button>
                        <h2 className="text-3xl font-bold border-b border-gray-700 pb-2">Candidate Profile</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                            <div>
                                <h3 className="text-lg font-semibold mb-1">Basic Info</h3>
                                <p><strong>Name:</strong> {candidateData.full_name}</p>
                                <p><strong>Location:</strong> {candidateData.location}</p>
                                <p><strong>Phone:</strong> {candidateData.phone_number}</p>
                                <p className="text-sm text-gray-400 mt-2">Joined on: {new Date(candidateData.created_at).toLocaleDateString()}</p>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold mb-1">Professional</h3>
                                <p><strong>Experience:</strong> {candidateData.experience_years} years</p>
                                <p><strong>Expected Roles:</strong> {candidateData.expected_roles}</p>
                                <p><strong>Status:</strong> {candidateData.current_status}</p>
                                <p><strong>Skills:</strong> {candidateData.skills.join(', ')}</p>
                            </div>

                            <div className="col-span-1 md:col-span-2">
                                <h3 className="text-lg font-semibold mb-1">Links</h3>
                                <div className="flex flex-col gap-2">
                                    {candidateData.linkedin_url && (
                                        <a
                                            className="text-blue-400 underline hover:text-blue-300"
                                            href={candidateData.linkedin_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            LinkedIn Profile
                                        </a>
                                    )}
                                    {candidateData.portfolio_url && (
                                        <a
                                            className="text-blue-400 underline hover:text-blue-300"
                                            href={candidateData.portfolio_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Portfolio Website
                                        </a>
                                    )}
                                    <a
                                        className="inline-block mt-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium w-fit"
                                        href={candidateData.resume_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        View Resume
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CompanyApplicantsPage;


