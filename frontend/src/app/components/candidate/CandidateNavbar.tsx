import { useState, PropsWithChildren, MouseEvent } from 'react';
import { useRouter } from 'next/navigation';
import React from 'react';

type NavbarProps = {
    user: {
        username: string;
    };
};

// Minimal custom Button component
type CustomButtonProps = {
    onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
    variant?: 'outline' | 'ghost' | 'secondary';
    className?: string;
    children: React.ReactNode;
};
const Button = ({
    onClick,
    variant = 'ghost',
    className = '',
    children,
}: CustomButtonProps) => {
    const base =
        'px-4 py-2 rounded transition font-medium focus:outline-none focus:ring-2';
    let variantStyle = '';
    switch (variant) {
        case 'outline':
            variantStyle =
                'border border-blue-400 text-blue-400 bg-transparent hover:bg-blue-800 hover:text-white';
            break;
        case 'secondary':
            variantStyle = 'bg-blue-600 text-white hover:bg-blue-500';
            break;
        case 'ghost':
        default:
            variantStyle = 'bg-transparent text-white hover:text-blue-400';
    }
    return (
        <button onClick={onClick} className={`${base} ${variantStyle} ${className}`}>
            {children}
        </button>
    );
};

// Minimal custom Dialog component
type DialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: React.ReactNode;
};
const Dialog = ({ open, onOpenChange, children }: DialogProps) => {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full relative">
                {children}
                <button
                    aria-label="Close dialog"
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
                    onClick={() => onOpenChange(false)}
                >
                    ×
                </button>
            </div>
        </div>
    );
};

const CandidateNavbar: React.FC<NavbarProps> = () => {
    const [activeTab, setActiveTab] =
        useState<'jobs' | 'my-applications'>('jobs');
    const router = useRouter();

    const handleTabChange = (tab: 'jobs' | 'my-applications') => {
        setActiveTab(tab);
        if (tab === 'jobs') {
            router.push('/candidate/jobs');
        } else {
            router.push('/candidate/applications');
        }
    };

    return (
        <nav className="flex justify-between items-center p-4 bg-gray-800 text-white">
            {/* Tab Navigation */}
            <div className="flex space-x-6">
                <Button
                    variant={activeTab === 'jobs' ? 'secondary' : 'ghost'}
                    className={activeTab === 'jobs' ? 'font-bold shadow' : ''}
                    onClick={() => handleTabChange('jobs')}
                >
                    Jobs
                </Button>
                <Button
                    variant={activeTab === 'my-applications' ? 'secondary' : 'ghost'}
                    className={activeTab === 'my-applications' ? 'font-bold shadow' : ''}
                    onClick={() => handleTabChange('my-applications')}
                >
                    My Applications
                </Button>
            </div>

            {/* Profile Button */}
            <Button
                variant="outline"
                onClick={() => router.push('/candidate/profile')}
                className="ml-4"
            >
                Profile
            </Button>

        </nav>
    );
};

export default CandidateNavbar;

