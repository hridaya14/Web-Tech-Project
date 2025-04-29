import React, { useState } from 'react';

export const CandidateOnboarding = () => {
    const [formData, setFormData] = useState({
        full_name: '',
        phone: '',
        location: '',
        linkedin_url: '',
        portfolio_url: '',
        experience_years: '',
        expected_roles: '',
        current_status: '',
        skills: '',
    });

    const [resumeFile, setResumeFile] = useState<File | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
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
        payload.append('experience_years', formData.experience_years);
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
            console.log('✅ Server Response:', result);
        } catch (err: any) {
            alert(`❌ Error: ${err.message}`);
            console.error('Upload Error:', err);
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
                    {[
                        { name: 'full_name', placeholder: 'Full Name' },
                        { name: 'phone', placeholder: 'Phone' },
                        { name: 'location', placeholder: 'Location' },
                        { name: 'linkedin_url', placeholder: 'LinkedIn URL', type: 'url' },
                        { name: 'portfolio_url', placeholder: 'Portfolio URL', type: 'url' },
                        { name: 'skills', placeholder: 'Skills (comma-separated)' },
                        { name: 'experience_years', placeholder: 'Years of Experience', type: 'number' }
                    ].map(({ name, placeholder, type = 'text' }) => (
                        <input
                            key={name}
                            type={type}
                            name={name}
                            placeholder={placeholder}
                            value={formData[name as keyof typeof formData]}
                            onChange={handleChange}
                            required={name === 'full_name'}
                            className="bg-gray-700 p-3 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                        />
                    ))}

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

