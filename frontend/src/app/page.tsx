'use client'
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import {
    SparklesIcon,
    AdjustmentsHorizontalIcon,
    PaperAirplaneIcon,
} from '@heroicons/react/24/outline';

const features: {
    icon: React.ElementType;
    title: string;
    description: string;
}[] = [
        {
            icon: SparklesIcon,
            title: 'Smart AI Matchmaking',
            description:
                'Let our advanced AI analyze your resume and aspirations to connect you with the most relevant jobs.',
        },
        {
            icon: AdjustmentsHorizontalIcon,
            title: 'Personalized Suggestions',
            description:
                'Receive tailored job recommendations, curated for your skills, interests, and growth potential.',
        },
        {
            icon: PaperAirplaneIcon,
            title: 'One-Click Apply',
            description:
                'Apply effortlessly and track your applications in real-time - all in one place.',
        },
    ];

export default function LandingPage() {
    const router = useRouter()
    return (
        <div className="relative min-h-screen bg-gradient-to-tr from-[#17163b] via-[#23204d] to-[#251842] text-gray-100 flex flex-col">
            {/* Hero Section */}
            <header className="flex-1 flex flex-col justify-center items-center py-20 px-4">
                <div className="w-full max-w-2xl text-center">
                    <h1 className="text-5xl md:text-6xl font-extrabold mb-6 drop-shadow-lg">
                        Unlock Your <span className="text-indigo-400">Dream Job</span> with AI
                    </h1>
                    <p className="text-lg md:text-2xl text-gray-300 mb-10 font-light">
                        Discover careers you love. Our AI matches you to job opportunities based on your unique skills and aspirations.
                    </p>
                    <Button
                        size="lg"
                        className="bg-indigo-600 hover:bg-indigo-500 text-white text-lg rounded-full px-8 py-4 shadow-lg transition"
                        onClick={() => router.push('/candidate/jobs')}
                    >
                        Get Started – It’s Free
                    </Button>
                </div>
            </header>

            {/* Features Section */}
            <section className="w-full max-w-5xl mx-auto py-16 px-4 grid grid-cols-1 md:grid-cols-3 gap-10">
                {features.map((feature) => (
                    <div
                        key={feature.title}
                        className="bg-gradient-to-br from-[#232040] to-[#2e2357] rounded-2xl p-8 shadow-xl flex flex-col items-center text-center"
                    >
                        <feature.icon className="h-10 w-10 text-indigo-400 mb-4" />
                        <h3 className="font-semibold text-2xl mb-3">{feature.title}</h3>
                        <p className="text-gray-300">{feature.description}</p>
                    </div>
                ))}
            </section>

            {/* Footer */}
            <footer className="bg-[#1b192c] text-gray-400 py-6 text-center border-t border-[#26254a]">
                <p className="text-sm">&copy; 2025 AI Job Match. All rights reserved.</p>
            </footer>
        </div>
    );
}

