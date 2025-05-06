import React from "react";

export interface JobListing {
    ID?: number;
    Listing_title: string;
    Description: string;
    Location: string;
    Work_type: string;
    Job_type: string;
    Experience_type: string;
    Experience_months: string;
    Salary_range: string;
    Required_skills: string[];
    created_at?: string;
}

interface ListingCardProps {
    listing: JobListing;
    onClick: (listing: JobListing) => void;
}

const ListingCard: React.FC<ListingCardProps> = ({ listing, onClick }) => (
    <div
        onClick={() => onClick(listing)}
        className="
      bg-gradient-to-br from-slate-800 to-indigo-900 
      rounded-2xl p-6 min-w-[270px] max-w-xs cursor-pointer 
      shadow-lg border border-slate-700 transition 
      hover:scale-[1.025] hover:shadow-2xl hover:border-indigo-600
      flex flex-col
    "
        tabIndex={0}
        role="button"
        aria-pressed="false"
    >
        <h3 className="font-extrabold text-lg text-indigo-200">{listing?.Listing_title}</h3>
        <div className="mt-2 text-indigo-400 text-sm flex items-center gap-1">
            <span role="img" aria-label="location">📍</span> {listing?.Location}
        </div>
        <div className="text-indigo-300 text-xs mt-1 mb-1">{listing.Salary_range}</div>
        <div className="flex gap-2 text-xs mb-2">
            <span className="bg-slate-700 text-indigo-300 px-2 py-1 rounded">{listing?.Work_type}</span>
            <span className="bg-slate-700 text-indigo-300 px-2 py-1 rounded">{listing?.Job_type}</span>
        </div>
        <div className="mt-2 flex flex-wrap gap-2 text-xs">
            {listing?.Required_skills?.slice(0, 3)?.map((skill, idx) => (
                <span
                    key={idx}
                    className="bg-indigo-700 text-indigo-100 font-semibold px-3 py-1 rounded-full"
                >
                    {skill}
                </span>
            ))}
            {listing?.Required_skills?.length > 3 && (
                <span className="text-indigo-300">+{listing?.Required_skills.length - 3} more</span>
            )}
        </div>
    </div>
);

export default ListingCard;

