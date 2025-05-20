'use client'

import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import ListingCard from '@/app/components/company/ListingCard';
import Modal from '@/app/components/company/Modal';
import { useRouter } from 'next/navigation';

// Enum-based dropdown options:
const WORK_TYPES = ["Onsite", "Remote", "Hybrid"];
const JOB_TYPES = ["Full-Time", "Part-Time", "Contract", "Freelance", "Internship"];
const EXPERIENCE_LEVELS = ["Internship", "Entry Level", "Associate", "Mid Senior Level", "Director"];
const SALARY_RANGES = [
    "Below 25k",
    "25k - 50k",
    "50k - 75k",
    "75k - 100k",
    "100k - 150k",
    "150k - 200k",
    "200k+",
];

const backendUrl = '/company/getListings';

// Make sure your JobListing interface looks like this:
export interface JobListing {
    Listing_title: string;
    Description: string;
    Location: string;
    Work_type: string;
    Job_type: string;
    Experience_type: string;
    Experience_months: number; // <-- number type
    Salary_range: string;
    Required_skills: string[];
    ID?: string;
    created_at?: string;
}

const initialListing: JobListing = {
    Listing_title: '',
    Description: '',
    Location: '',
    Work_type: '',
    Job_type: '',
    Experience_type: '',
    Experience_months: 0, // integer default
    Salary_range: '',
    Required_skills: [],
};

const Listings: React.FC = () => {
    const router = useRouter();
    const [listings, setListings] = useState<JobListing[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [fetchError, setFetchError] = useState<string>('');
    const [selectedListing, setSelectedListing] = useState<JobListing | null>(null);
    const [showModal, setShowModal] = useState<boolean>(false);

    // State for create listing
    const [creating, setCreating] = useState<boolean>(false);
    const [form, setForm] = useState<JobListing>(initialListing);
    const [formError, setFormError] = useState<string>('');

    const handleLogout = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/logout`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                router.push('/auth/login');
            } else {
                throw new Error('Logout failed');
            }
        } catch (err) {
            console.error('Logout error:', err);
        }
    };

    // Fetch all listings
    const fetchListings = () => {
        setLoading(true);
        setFetchError('');
        fetch(`${process.env.NEXT_PUBLIC_BASE_URL}${backendUrl}`, { credentials: 'include' })
            .then(res => {
                if (!res.ok) throw new Error('Could not fetch listings');
                return res.json();
            })
            .then(data => {
                setListings(data?.Listings);
            })
            .catch(() => {
                setListings([]);
                setFetchError('Oops! Failed to load listings. Please try again.');
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchListings();
    }, []);

    const handleCardClick = (listing: JobListing) => {
        setSelectedListing(listing);
        setShowModal(true);
    };

    const handleModalClose = () => setShowModal(false);

    const handleCreateBtn = () => {
        setForm(initialListing);
        setCreating(true);
        setFormError('');
    };

    const handleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        // Map form field names to JobListing property names
        const fieldMapping: Record<string, keyof JobListing> = {
            title: 'Listing_title',
            description: 'Description',
            location: 'Location',
            work_type: 'Work_type',
            job_type: 'Job_type',
            experience_type: 'Experience_type',
            experience_months: 'Experience_months',
            salary_range: 'Salary_range'
        };
        const listingField = fieldMapping[name] || (name as keyof JobListing);

        if (listingField === 'Experience_months') {
            // Always keep as number
            const num = (e.target as HTMLInputElement).valueAsNumber;
            setForm({ ...form, [listingField]: isNaN(num) ? 0 : num });
        } else if (listingField === 'Required_skills') {
            setForm({ ...form, Required_skills: value.split(',').map(x => x.trim()) });
        } else {
            setForm({ ...form, [listingField]: value });
        }
    };

    const handleSkillsChange = (e: ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, Required_skills: e.target.value.split(',').map(x => x.trim()) });
    };

    const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setFormError('');
        try {
            const payload = { ...form };

            const resp = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/company/createListing`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                credentials: 'include'
            });
            if (!resp.ok) throw new Error('Failed to create');
            await resp.json();
            fetchListings();
            setCreating(false);
        } catch (err) {
            setFormError('Could not create listing.');
        }
    };

    const handleDeleteListing = async (listingId?: string) => {
        if (!listingId) {
            alert("Could not determine listing ID to delete.");
            return;
        }

        if (!window.confirm("Are you sure you want to delete this job listing?")) return;

        try {
            const resp = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/company/deleteListing`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ listing_id: listingId }),
            });

            if (!resp.ok) {
                const data = await resp.json();
                throw new Error(data.error || "Failed to delete listing");
            }

            fetchListings();
            setShowModal(false);
        } catch (err) {
            alert((err as Error).message || "Could not delete the listing.");
        }
    };

    return (
        <div className="min-h-[100dvh] bg-gradient-to-br from-slate-800 to-slate-900 px-4 py-10 text-slate-200 font-sans">
            {/* Header */}
            <div className="flex items-center justify-between mb-10">
                <h2 className="text-3xl font-extrabold text-indigo-200 tracking-tight">Job Listings</h2>
                <div className="flex gap-4">
                    <button
                        onClick={handleCreateBtn}
                        className="bg-gradient-to-r from-indigo-600 to-violet-700 text-white rounded-lg px-6 py-3 font-bold text-lg shadow hover:shadow-lg hover:from-indigo-500 transition border-b-4 border-violet-900"
                    >
                        + Create Listing
                    </button>
                    <button
                        onClick={handleLogout}
                        className="bg-red-600 hover:bg-red-700 text-white rounded-lg px-4 py-3 font-bold text-lg shadow transition"
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* Main Content */}
            {loading ? (
                <div className="text-center text-base text-indigo-300">Loading...</div>
            ) : fetchError ? (
                <div className="text-center mt-20">
                    <div className="text-pink-400 text-lg mb-6">{fetchError}</div>
                    <button
                        onClick={fetchListings}
                        className="bg-slate-800 hover:bg-indigo-800 text-indigo-200 font-semibold px-5 py-2 rounded-lg shadow border border-indigo-600"
                    >
                        Retry
                    </button>
                </div>
            ) : !listings || listings.length === 0 ? (
                <div className="text-center mt-24 bg-gradient-to-br from-slate-800 to-slate-900 p-12 rounded-xl shadow-xl max-w-md mx-auto">
                    <div className="text-5xl mb-4">🗂️</div>
                    <div className="text-xl text-indigo-200 mb-1">No job listings yet.</div>
                    <div className="text-indigo-400 text-base">Be the first to create one!</div>
                </div>
            ) : (
                <div className="flex flex-wrap gap-8">
                    {listings.map((listing, i) => (
                        <ListingCard
                            key={i}
                            listing={listing}
                            onClick={handleCardClick}
                        />
                    ))}
                </div>
            )}

            {/* Expanded Listing Modal */}
            {showModal && selectedListing && (
                <Modal onClose={handleModalClose}>
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-2">
                            <h2 className="text-2xl font-extrabold text-indigo-200">{selectedListing.Listing_title}</h2>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-indigo-300 text-base mb-2">
                            <span className="flex items-center gap-1">
                                <span role="img" aria-label="location">📍</span>
                                <span>{selectedListing.Location}</span>
                            </span>
                            <span className="bg-slate-700 text-indigo-200 px-2 py-1 rounded">{selectedListing.Work_type}</span>
                            <span className="bg-slate-700 text-indigo-200 px-2 py-1 rounded">{selectedListing.Job_type}</span>
                            <span className="bg-slate-700 text-indigo-200 px-2 py-1 rounded">{selectedListing.Salary_range}</span>
                        </div>
                        <div className="flex gap-6 text-indigo-400 text-sm mb-2">
                            <span><b>Exp Level:</b> {selectedListing.Experience_type}</span>
                            <span><b>Exp (months):</b> {selectedListing.Experience_months}</span>
                        </div>
                        <div>
                            <div className="font-semibold text-indigo-200 mb-1">Job Description</div>
                            <div className="bg-slate-800 rounded-lg p-4 text-indigo-100 text-base">{selectedListing.Description}</div>
                        </div>
                        <div>
                            <div className="font-semibold text-indigo-200 mb-1">Required Skills</div>
                            <div className="flex flex-wrap gap-3 mt-1">
                                {selectedListing.Required_skills.map((skill, idx) => (
                                    <span key={idx} className="bg-indigo-800 text-indigo-100 font-semibold px-4 py-1 rounded-full text-sm">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="mt-3 text-xs text-indigo-500">
                            {selectedListing.created_at && (
                                <>Posted on: {new Date(selectedListing.created_at).toLocaleDateString()}</>
                            )}
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                onClick={handleModalClose}
                                className="bg-slate-700 hover:bg-slate-800 text-indigo-100 px-5 py-2 rounded-lg font-semibold transition"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => handleDeleteListing(selectedListing?.ID)}
                                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg font-semibold transition border-b-2 border-red-900"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Create Listing Modal */}
            {creating && (
                <Modal onClose={() => setCreating(false)}>
                    <h3 className="text-2xl font-bold text-indigo-200 mb-6 text-center">Create New Listing</h3>
                    <form onSubmit={handleFormSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold mb-1 text-indigo-300">Title <span className="text-pink-400">*</span></label>
                                <input
                                    name="title"
                                    value={form.Listing_title}
                                    onChange={handleFormChange}
                                    placeholder="Job Title"
                                    required
                                    className="w-full p-3 rounded-md border border-indigo-800 bg-slate-900 text-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1 text-indigo-300">Location</label>
                                <input
                                    name="location"
                                    value={form.Location}
                                    onChange={handleFormChange}
                                    placeholder="e.g. Remote, NYC, India"
                                    className="w-full p-3 rounded-md border border-indigo-800 bg-slate-900 text-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1 text-indigo-300">Work Type</label>
                                <select
                                    name="work_type"
                                    value={form.Work_type}
                                    onChange={handleFormChange}
                                    required
                                    className="w-full p-3 rounded-md border border-indigo-800 bg-slate-900 text-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="" disabled>Select</option>
                                    {WORK_TYPES.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1 text-indigo-300">Job Type</label>
                                <select
                                    name="job_type"
                                    value={form.Job_type}
                                    onChange={handleFormChange}
                                    required
                                    className="w-full p-3 rounded-md border border-indigo-800 bg-slate-900 text-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="" disabled>Select</option>
                                    {JOB_TYPES.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1 text-indigo-300">Experience Level</label>
                                <select
                                    name="experience_type"
                                    value={form.Experience_type}
                                    onChange={handleFormChange}
                                    required
                                    className="w-full p-3 rounded-md border border-indigo-800 bg-slate-900 text-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="" disabled>Select</option>
                                    {EXPERIENCE_LEVELS.map(level => (
                                        <option key={level} value={level}>{level}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1 text-indigo-300">Experience (months)</label>
                                <input
                                    name="experience_months"
                                    value={form.Experience_months}
                                    onChange={handleFormChange}
                                    placeholder="e.g. 36"
                                    type="number"
                                    min={0}
                                    required
                                    className="w-full p-3 rounded-md border border-indigo-800 bg-slate-900 text-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1 text-indigo-300">Salary Range</label>
                                <select
                                    name="salary_range"
                                    value={form.Salary_range}
                                    onChange={handleFormChange}
                                    required
                                    className="w-full p-3 rounded-md border border-indigo-800 bg-slate-900 text-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="" disabled>Select</option>
                                    {SALARY_RANGES.map(range => (
                                        <option key={range} value={range}>{range}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold mb-1 text-indigo-300">Required Skills</label>
                                <input
                                    name="required_skills"
                                    value={form.Required_skills.join(', ')}
                                    onChange={handleSkillsChange}
                                    placeholder="e.g. React, Node.js, TypeScript"
                                    className="w-full p-3 rounded-md border border-indigo-800 bg-slate-900 text-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-1 text-indigo-300">Description <span className="text-pink-400">*</span></label>
                            <textarea
                                name="description"
                                value={form.Description}
                                onChange={handleFormChange}
                                placeholder="Describe the job, responsibilities, requirements, etc."
                                required
                                rows={4}
                                className="w-full p-3 rounded-md border border-indigo-800 bg-slate-900 text-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        {formError && (
                            <p className="text-pink-400 text-sm">{formError}</p>
                        )}
                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-indigo-700 to-violet-700 text-white rounded-lg px-6 py-3 font-bold text-lg shadow hover:from-indigo-600 hover:to-violet-800 transition mt-2"
                        >
                            Create
                        </button>
                    </form>
                </Modal>
            )}
        </div>
    );
};

export default Listings;

