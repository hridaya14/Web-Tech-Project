'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export const CompanyOnboarding = () => {
    const router = useRouter()
    const [formData, setFormData] = useState({
        company_name: '',
        company_website: '',
        company_size: '',
        industry: '',
        contact_person: '',
        contact_phone: '',
        company_description: '',
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.company_name) {
            alert("Company Name is required.")
            return
        }

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/profile/createCompany`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(formData),
            })

            const result = await res.json()

            if (!res.ok) {
                throw new Error(result.Message || 'Submission failed')
            }

            alert('🎉 Company registered successfully!')
            console.log('✅ Server Response:', result)
            router.push("/company/dashboard")
        } catch (err: any) {
            alert(`❌ Error: ${err.message}`)
            console.error('Upload Error:', err)
            router.push("/profile/onboarding")
        }
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gray-900 px-4 py-10">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-2xl p-6 sm:p-8 bg-gray-800 text-white rounded-2xl shadow-xl space-y-6"
            >
                <h2 className="text-3xl font-bold text-center text-cyan-400">Company Registration</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                        { name: 'company_name', placeholder: 'Company Name', required: true },
                        { name: 'company_website', placeholder: 'Company Website', type: 'url' },
                        { name: 'industry', placeholder: 'Industry' },
                        { name: 'contact_person', placeholder: 'Contact Person' },
                        { name: 'contact_phone', placeholder: 'Contact Phone', type: 'tel' },
                    ].map(({ name, placeholder, type = 'text', required = false }) => (
                        <input
                            key={name}
                            type={type}
                            name={name}
                            placeholder={placeholder}
                            value={formData[name as keyof typeof formData]}
                            onChange={handleChange}
                            required={required}
                            className="bg-gray-700 p-3 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                        />
                    ))}

                    <select
                        name="company_size"
                        value={formData.company_size}
                        onChange={handleChange}
                        className="bg-gray-700 p-3 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    >
                        <option value="">Select Company Size</option>
                        {['SMALL', 'MEDIUM', 'LARGE'].map(size => (
                            <option key={size} value={size}>{size}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <textarea
                        name="company_description"
                        placeholder="Company Description"
                        value={formData.company_description}
                        onChange={handleChange}
                        rows={4}
                        className="w-full bg-gray-700 p-3 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 transition-all font-semibold"
                >
                    Register Company
                </button>
            </form>
        </div>
    )
}

