'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Modal = ({
    open,
    onClose,
    children,
}: {
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
}) => {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
            <div className="bg-gray-800 rounded-xl shadow-lg p-8 max-w-lg w-full relative">
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-400 hover:text-white text-xl"
                    aria-label="Close"
                >
                    &times;
                </button>
                {children}
            </div>
        </div>
    );
};

interface Application {
    ApplicationID: string;
    CandidateID: string;
    JobID: string;
    Status: string;
    AppliedAt: string;
}

interface JobListing {
    ID: string;
    Company_id: string;
    Listing_title: string;
    Description: string;
    Location: string;
    Work_type: string;
    Job_type: string;
    Experience_type: string;
    Experience_months: string;
    Salary_range: string;
    Required_skills: string[];
    created_at: string;
    UpdatedAt: string;
}

const ApplicationsPage = () => {
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal State
    const [selectedApp, setSelectedApp] = useState<Application | null>(null);
    const [jobDetails, setJobDetails] = useState<JobListing | null>(null);
    const [jobLoading, setJobLoading] = useState(false);
    const [jobError, setJobError] = useState<string | null>(null);
    const [withdrawing, setWithdrawing] = useState(false);

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const res = await axios.get<{ applications: Application[] | null }>(
                    `${process.env.NEXT_PUBLIC_BASE_URL}/candidate/Applications`,
                    { withCredentials: true }
                );
                // Defensive logging for diagnostics
                console.log('Backend response:', res.data);
                // Always assign an array to avoid blank screen
                let apps = res.data.applications;
                if (!Array.isArray(apps)) apps = [];
                setApplications(apps);
            } catch (err) {
                setError('Could not fetch your applications. Please try again.');
                setApplications([]);
            } finally {
                setLoading(false);
            }
        };

        try {
            fetchApplications();
        } catch (e: any) {
            setError('Unexpected error in fetching applications: ' + e?.message);
            setApplications([]);
            setLoading(false);
        }
    }, []);

    const handleCardClick = async (app: Application) => {
        setSelectedApp(app);
        setJobDetails(null);
        setJobError(null);
        setJobLoading(true);
        try {
            const res = await axios.get<{ job: JobListing }>(
                `${process.env.NEXT_PUBLIC_BASE_URL}/getListing/${app.JobID}`,
                { withCredentials: true }
            );
            setJobDetails(res.data.job);
        } catch (err: any) {
            setJobError('Unable to fetch job details.');
        } finally {
            setJobLoading(false);
        }
    };

    const closeModal = () => {
        setSelectedApp(null);
        setJobDetails(null);
        setJobError(null);
        setJobLoading(false);
        setWithdrawing(false);
    };

    const handleWithdraw = async () => {
        if (!selectedApp) return;
        if (!window.confirm('Are you sure you want to withdraw this application?')) return;
        setWithdrawing(true);
        try {
            await axios.post(
                `${process.env.NEXT_PUBLIC_BASE_URL}/candidate/deleteApplication`,
                { application_id: selectedApp.ApplicationID },
                { withCredentials: true }
            );
            setApplications((prev) =>
                prev.filter((app) => app.ApplicationID !== selectedApp.ApplicationID)
            );
            closeModal();
        } catch (err: any) {
            alert(
                err?.response?.data?.error ||
                'Could not withdraw application, please try again.'
            );
        } finally {
            setWithdrawing(false);
        }
    };

    // SAFETY: Error fallback UI
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900 text-red-400">
                <p>{error}</p>
            </div>
        );
    }

    if (loading) {
        return <p className="text-center mt-6 text-white">Loading...</p>;
    }

    // Defensive: avoid blank screen for any "falsy" applications value
    if (!Array.isArray(applications) || applications.length === 0) {
        return (
            <p className="text-center mt-6 text-white">No Applications Found.</p>
        );
    }

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
                            className="bg-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-xl transition duration-300 border border-gray-700 cursor-pointer"
                            onClick={() => handleCardClick(app)}
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
            {/* Modal */}
            <Modal open={!!selectedApp} onClose={closeModal}>
                {selectedApp && (
                    <div>
                        <h2 className="text-2xl font-bold mb-4 text-center">
                            Application Details
                        </h2>
                        <p>
                            <span className="font-semibold text-gray-300">
                                Application ID:
                            </span>{' '}
                            {selectedApp.ApplicationID}
                        </p>
                        <p>
                            <span className="font-semibold text-gray-300">Status:</span>{' '}
                            <span
                                className={`font-bold ${selectedApp.Status === 'pending'
                                    ? 'text-yellow-400'
                                    : selectedApp.Status === 'accepted'
                                        ? 'text-green-400'
                                        : 'text-red-400'
                                    }`}
                            >
                                {selectedApp.Status.charAt(0).toUpperCase() +
                                    selectedApp.Status.slice(1)}
                            </span>
                        </p>
                        <p>
                            <span className="font-semibold text-gray-300">Applied At:</span>{' '}
                            {new Date(selectedApp.AppliedAt).toLocaleDateString()}
                        </p>
                        <hr className="my-4 border-gray-700" />
                        <h3 className="text-xl font-semibold mb-2">Job Details</h3>
                        {jobLoading && <p>Loading job details...</p>}
                        {jobError && (
                            <p className="text-red-400">{jobError}</p>
                        )}
                        {jobDetails && (
                            <div>
                                <p>
                                    <span className="font-semibold text-gray-300">
                                        Title:
                                    </span>{' '}
                                    {jobDetails.Listing_title}
                                </p>
                                <p>
                                    <span className="font-semibold text-gray-300">
                                        Description:
                                    </span>{' '}
                                    {jobDetails.Description}
                                </p>
                                <p>
                                    <span className="font-semibold text-gray-300">
                                        Location:
                                    </span>{' '}
                                    {jobDetails.Location}
                                </p>
                                <p>
                                    <span className="font-semibold text-gray-300">
                                        Work Type:
                                    </span>{' '}
                                    {jobDetails.Work_type}
                                </p>
                                <p>
                                    <span className="font-semibold text-gray-300">
                                        Job Type:
                                    </span>{' '}
                                    {jobDetails.Job_type}
                                </p>
                                <p>
                                    <span className="font-semibold text-gray-300">
                                        Experience:
                                    </span>{' '}
                                    {jobDetails.Experience_type} ({jobDetails.Experience_months} months)
                                </p>
                                <p>
                                    <span className="font-semibold text-gray-300">
                                        Salary Range:
                                    </span>{' '}
                                    {jobDetails.Salary_range}
                                </p>
                                <p>
                                    <span className="font-semibold text-gray-300">
                                        Skills:
                                    </span>{' '}
                                    {jobDetails.Required_skills && jobDetails.Required_skills.length > 0
                                        ? jobDetails.Required_skills.join(', ')
                                        : 'N/A'}
                                </p>
                            </div>
                        )}
                        <div className="flex justify-end mt-6 gap-4">
                            <button
                                onClick={closeModal}
                                className="bg-slate-700 hover:bg-slate-800 text-indigo-100 px-5 py-2 rounded-lg font-semibold transition"
                                disabled={withdrawing}
                            >
                                Close
                            </button>
                            <button
                                onClick={handleWithdraw}
                                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg font-semibold transition border-b-2 border-red-900"
                                disabled={withdrawing}
                            >
                                {withdrawing ? 'Withdrawing...' : 'Withdraw'}
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default ApplicationsPage;

