'use client';

import { useState, PropsWithChildren, MouseEvent } from 'react';
import { useRouter } from 'next/navigation';

type CompanyProfile = {
    email: string;
    needsOnboarding: boolean;
    role: string;
    username: string;
    profile: {
        company_description: string;
        company_name: string;
        company_size: string;
        contact_person: string;
        contact_phone: string;
        industry: string;
        website_url: string;
    };
};

type NavbarProps = {
    user: CompanyProfile;
};

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

const DialogTitle = ({ children }: PropsWithChildren) => (
    <h2 className="text-xl font-semibold mb-2">{children}</h2>
);

const DialogDescription = ({ children }: PropsWithChildren) => (
    <div className="text-gray-600 mb-4">{children}</div>
);

const CompanyNavbar: React.FC<NavbarProps> = ({ user }) => {
    const [activeTab, setActiveTab] = useState<'my-listings' | 'applicants'>('my-listings');
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const router = useRouter();

    const handleTabChange = (tab: 'my-listings' | 'applicants') => {
        setActiveTab(tab);
        if (tab === 'my-listings') {
            router.push('/company/listings');
        } else {
            router.push('/company/applicants');
        }
    };

    return (
        <nav className="flex justify-between items-center p-4 bg-gray-800 text-white">
            <div className="flex space-x-6">
                <Button
                    variant={activeTab === 'my-listings' ? 'secondary' : 'ghost'}
                    className={activeTab === 'my-listings' ? 'font-bold shadow' : ''}
                    onClick={() => handleTabChange('my-listings')}
                >
                    My Listings
                </Button>
                <Button
                    variant={activeTab === 'applicants' ? 'secondary' : 'ghost'}
                    className={activeTab === 'applicants' ? 'font-bold shadow' : ''}
                    onClick={() => handleTabChange('applicants')}
                >
                    Applicants
                </Button>
            </div>

            <Button variant="outline" onClick={() => setIsProfileModalOpen(true)} className="ml-4">
                Profile
            </Button>

            <Dialog open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen}>
                <div className="p-6 bg-gray-900 text-gray-100 rounded-lg shadow-lg max-w-lg w-full">
                    <DialogTitle>
                        <span className="text-2xl font-bold text-white">Company Profile</span>
                    </DialogTitle>
                    <DialogDescription>
                        <p className="text-gray-400">
                            Profile details for <span className="font-semibold text-blue-400">{user.username}</span>
                        </p>
                    </DialogDescription>

                    <div className="mt-4 grid grid-cols-1 gap-3 text-sm leading-6">
                        <div><span className="font-medium text-gray-300">Email:</span> {user.email}</div>
                        <div><span className="font-medium text-gray-300">Role:</span> {user.role}</div>
                        <div><span className="font-medium text-gray-300">Onboarding Needed:</span> {user.needsOnboarding ? 'Yes' : 'No'}</div>
                    </div>

                    <hr className="my-5 border-gray-700" />

                    <div className="grid grid-cols-1 gap-3 text-sm leading-6">
                        <div><span className="font-medium text-gray-300">Company Name:</span> {user.profile.company_name}</div>
                        <div><span className="font-medium text-gray-300">Description:</span> {user.profile.company_description}</div>
                        <div><span className="font-medium text-gray-300">Size:</span> {user.profile.company_size}</div>
                        <div><span className="font-medium text-gray-300">Industry:</span> {user.profile.industry}</div>
                        <div><span className="font-medium text-gray-300">Contact Person:</span> {user.profile.contact_person}</div>
                        <div><span className="font-medium text-gray-300">Phone:</span> {user.profile.contact_phone}</div>
                        <div><span className="font-medium text-gray-300">Website:</span> {user.profile.website_url || 'N/A'}</div>
                    </div>

                    <div className="flex justify-end mt-6">
                        <Button onClick={() => setIsProfileModalOpen(false)} className="text-sm font-semibold">
                            Close
                        </Button>
                    </div>
                </div>
            </Dialog>
        </nav>
    );
};

export default CompanyNavbar;

