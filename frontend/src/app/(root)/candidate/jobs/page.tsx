"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";

type JobListingFilters = {
    WorkType: string;
    JobType: string;
    ExperienceLevel: string;
    SalaryRange: string;
    RequiredSkills: string[];
};

const defaultFilters: JobListingFilters = {
    WorkType: "",
    JobType: "",
    ExperienceLevel: "",
    SalaryRange: "",
    RequiredSkills: [],
};

type Job = {
    id: string;
    title: string;
    company: string;
    description: string;
    work_type: string;
    job_type: string;
    experience_level: string;
    salary_range: string;
    required_skills: string[];
};

export default function JobBoard() {
    const [filters, setFilters] = useState<JobListingFilters>(defaultFilters);
    const [jobListings, setJobListings] = useState<Job[]>([]);
    const [skillsInput, setSkillsInput] = useState("");
    const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());

    useEffect(() => {
        fetchJobs(filters);
    }, [filters]);

    const fetchJobs = async (filters: JobListingFilters) => {
        try {
            const params = new URLSearchParams();
            for (const key in filters) {
                const value = filters[key as keyof JobListingFilters];
                if (Array.isArray(value)) {
                    value.forEach((val: string) => params.append(key, val));
                } else if (value) {
                    params.append(key, value);
                }
            }

            const response = await axios.get<{ listings: any[] }>(
                `${process.env.NEXT_PUBLIC_BASE_URL}/candidate/getJobs?${params.toString()}`,
                { withCredentials: true }
            );

            const normalizedJobs = (response.data.listings ?? []).map((job) => ({
                id: job.ID,
                title: job.Listing_title,
                company: job.Company_id,
                description: job.Description,
                work_type: job.Work_type,
                job_type: job.Job_type,
                experience_level: job.Experience_type,
                salary_range: job.Salary_range,
                required_skills: job.Required_skills,
            }));

            setJobListings(normalizedJobs);
        } catch (err) {
            console.error("Failed to fetch jobs", err);
        }
    };

    const handleApply = async (jobId: string) => {
        try {
            await axios.post(
                `${process.env.NEXT_PUBLIC_BASE_URL}/candidate/apply`,
                { jobId },
                { withCredentials: true }
            );
            setAppliedJobs(new Set([...appliedJobs, jobId]));
            alert("Application submitted!");
        } catch (err) {
            console.error("Failed to apply", err);
            alert("Failed to apply for this job.");
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilters((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleAddSkill = () => {
        if (skillsInput && !filters.RequiredSkills.includes(skillsInput)) {
            setFilters((prev) => ({
                ...prev,
                RequiredSkills: [...prev.RequiredSkills, skillsInput],
            }));
            setSkillsInput("");
        }
    };

    const handleFilter = () => {
        fetchJobs(filters);
    };

    return (
        <div className="bg-[#121212] min-h-screen text-white p-6">
            <h1 className="text-3xl font-bold mb-4">Job Listings</h1>

            <div className="grid md:grid-cols-5 gap-4 bg-[#1f1f1f] p-4 rounded-xl">
                <select name="WorkType" onChange={handleChange} className="bg-[#2a2a2a] p-2 rounded text-white">
                    <option value="">All Work Types</option>
                    <option value="Onsite">Onsite</option>
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                </select>

                <select name="JobType" onChange={handleChange} className="bg-[#2a2a2a] p-2 rounded text-white">
                    <option value="">All Job Types</option>
                    <option value="Full-Time">Full-Time</option>
                    <option value="Part-Time">Part-Time</option>
                    <option value="Contract">Contract</option>
                    <option value="Freelance">Freelance</option>
                    <option value="Internship">Internship</option>
                </select>

                <select name="ExperienceLevel" onChange={handleChange} className="bg-[#2a2a2a] p-2 rounded text-white">
                    <option value="">All Experience</option>
                    <option value="Internship">Internship</option>
                    <option value="Entry Level">Entry Level</option>
                    <option value="Associate">Associate</option>
                    <option value="Mid Senior Level">Mid Senior Level</option>
                    <option value="Director">Director</option>
                </select>

                <select name="SalaryRange" onChange={handleChange} className="bg-[#2a2a2a] p-2 rounded text-white">
                    <option value="">All Salaries</option>
                    <option value="Below 25k">Below 25k</option>
                    <option value="25k - 50k">25k - 50k</option>
                    <option value="50k - 75k">50k - 75k</option>
                    <option value="75k - 100k">75k - 100k</option>
                    <option value="100k - 150k">100k - 150k</option>
                    <option value="150k - 200k">150k - 200k</option>
                    <option value="200k+">200k+</option>
                </select>

                <div className="flex items-center space-x-2">
                    <input
                        value={skillsInput}
                        onChange={(e) => setSkillsInput(e.target.value)}
                        placeholder="Add Skill"
                        className="bg-[#2a2a2a] p-2 rounded text-white w-full"
                    />
                    <button onClick={handleAddSkill} className="bg-blue-600 px-2 py-1 rounded">+</button>
                </div>
            </div>

            <div className="mt-4 mb-6">
                <div className="text-sm text-gray-400">Skills: {filters.RequiredSkills.join(", ")}</div>
                <button
                    onClick={handleFilter}
                    className="bg-green-600 hover:bg-green-700 px-4 py-2 mt-2 rounded"
                >
                    Apply Filters
                </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                {jobListings.length > 0 ? (
                    jobListings.map((job, idx) => (
                        <div key={idx} className="bg-[#1f1f1f] p-3 rounded-md shadow-sm border border-[#333] text-sm">
                            <h2 className="text-lg font-semibold">{job.title}</h2>
                            <p className="text-xs text-gray-400">{job.company}</p>
                            <p className="mt-1">{job.description}</p>
                            <div className="mt-1 text-xs text-gray-300">
                                {job.work_type} | {job.job_type} | {job.experience_level} | {job.salary_range}
                            </div>
                            <div className="mt-1 flex flex-wrap gap-1">
                                {job?.required_skills?.map((skill, i) => (
                                    <span key={i} className="bg-[#333] px-2 py-0.5 rounded text-xs">{skill}</span>
                                ))}
                            </div>
                            <button
                                onClick={() => handleApply(job.id)}
                                disabled={appliedJobs.has(job.id)}
                                className={`mt-2 px-3 py-1 rounded text-sm ${appliedJobs.has(job.id)
                                    ? "bg-gray-600 cursor-not-allowed"
                                    : "bg-blue-600 hover:bg-blue-700"
                                    }`}
                            >
                                {appliedJobs.has(job.id) ? "Applied" : "Apply"}
                            </button>
                        </div>
                    ))
                ) : (
                    <p>No jobs found.</p>
                )}
            </div>
        </div>
    );
}

