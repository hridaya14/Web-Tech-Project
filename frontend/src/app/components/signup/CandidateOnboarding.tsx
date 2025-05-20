import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export const CandidateOnboarding = () => {
    const router = useRouter();
    const [formData, setFormData] = useState({
        full_name: '',
        phone: '',
        location: '',
        linkedin_url: '',
        portfolio_url: '',
        experience_months: 0, // integer, default 0
        expected_roles: '',
        current_status: '',
        skills: '',
    });

    const [resumeFile, setResumeFile] = useState<File | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        // Special handling for experience_months to ensure integer and no leading zero
        if (name === 'experience_months') {
            // Allow empty string for user to clear the input, but store as 0
            const val = value.replace(/^0+(?=\d)/, ''); // Remove leading zeros
            if (val === '') {
                setFormData(prev => ({ ...prev, experience_months: 0 }));
            } else {
                // Only allow non-negative integers
                const intVal = Math.max(0, parseInt(val, 10) || 0);
                setFormData(prev => ({ ...prev, experience_months: intVal }));
            }
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const allowedTypes = [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            ];
            if (!allowedTypes.includes(file.type)) {
                alert('Only PDF, DOC, or DOCX files are allowed.');
                return;
            }
            setResumeFile(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!resumeFile) {
            alert('Please upload your resume.');
            return;
        }

        const payload = new FormData();

        // Add text fields
        payload.append('full_name', formData.full_name);
        payload.append('phone', formData.phone);
        payload.append('location', formData.location);
        payload.append('linkedin_url', formData.linkedin_url);
        payload.append('portfolio_url', formData.portfolio_url);
        payload.append('experience_months', formData.experience_months.toString());
        payload.append('current_status', formData.current_status);
        payload.append('expected_roles', formData.expected_roles);
        payload.append('skills', formData.skills);

        // File
        payload.append('resume_file', resumeFile);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/profile/createCandidate`, {
                method: 'POST',
                body: payload,
                credentials: 'include'
            });

            const result = await res.json();
            if (!res.ok) {
                throw new Error(result.Message || 'Submission failed');
            }

            alert('🎉 Candidate profile submitted successfully!');
            router.push("/candidate/dashboard");
            console.log('✅ Server Response:', result);
        } catch (err: any) {
            console.error('Upload Error:', err);
            router.push("/profile/onboarding");
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gray-900 px-4 py-10">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-3xl p-6 sm:p-8 bg-gray-800 text-white rounded-2xl shadow-xl space-y-6"
            >
                <h2 className="text-3xl font-bold text-center text-cyan-400">Candidate Registration</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                        type="text"
                        name="full_name"
                        placeholder="Full Name"
                        value={formData.full_name}
                        onChange={handleChange}
                        required
                        className="bg-gray-700 p-3 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    />
                    <input
                        type="text"
                        name="phone"
                        placeholder="Phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="bg-gray-700 p-3 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    />
                    <input
                        type="text"
                        name="location"
                        placeholder="Location"
                        value={formData.location}
                        onChange={handleChange}
                        className="bg-gray-700 p-3 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    />
                    <input
                        type="url"
                        name="linkedin_url"
                        placeholder="LinkedIn URL"
                        value={formData.linkedin_url}
                        onChange={handleChange}
                        className="bg-gray-700 p-3 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    />
                    <input
                        type="url"
                        name="portfolio_url"
                        placeholder="Portfolio URL"
                        value={formData.portfolio_url}
                        onChange={handleChange}
                        className="bg-gray-700 p-3 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    />
                    <input
                        type="text"
                        name="skills"
                        placeholder="Skills (comma-separated)"
                        value={formData.skills}
                        onChange={handleChange}
                        className="bg-gray-700 p-3 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    />
                    <input
                        type="number"
                        name="experience_months"
                        placeholder="Months of Experience"
                        min={0}
                        value={formData.experience_months === 0 ? '' : formData.experience_months}
                        onChange={handleChange}
                        className="bg-gray-700 p-3 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    />

                    <select
                        name="expected_roles"
                        value={formData.expected_roles}
                        onChange={handleChange}
                        className="bg-gray-700 p-3 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    >
                        <option value="">Select Expected Role</option>
                        {[
                            'BACKEND_ENGINEER',
                            'FRONTEND_ENGINEER',
                            'FULLSTACK_ENGINEER',
                            'DATA_SCIENTIST',
                            'ML_ENGINEER',
                            'DEVOPS_ENGINEER',
                            'PRODUCT_MANAGER',
                            'DESIGNER',
                            'SALES',
                            'MARKETING'
                        ].map(role => (
                            <option key={role} value={role}>{role}</option>
                        ))}
                    </select>

                    <select
                        name="current_status"
                        value={formData.current_status}
                        onChange={handleChange}
                        className="bg-gray-700 p-3 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    >
                        <option value="">Select Current Status</option>
                        {[
                            'ACTIVELY_LOOKING',
                            'OPEN_TO_OFFERS',
                            'NOT_LOOKING',
                            'SWITCHING_SOON'
                        ].map(status => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col items-start">
                    <label className="text-sm mb-1 text-gray-300">Upload Resume</label>
                    <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                        className="text-sm text-gray-300 file:bg-gray-600 file:text-white file:rounded-md file:px-4 file:py-1 file:border-0 file:cursor-pointer hover:file:bg-gray-500"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 transition-all font-semibold"
                >
                    Submit
                </button>
            </form>
        </div>
    );
};

