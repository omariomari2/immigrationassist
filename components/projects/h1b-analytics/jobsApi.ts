const SIMPLIFY_JOBS_URL = 'https://raw.githubusercontent.com/SimplifyJobs/Summer2025-Internships/dev/.github/scripts/listings.json';

interface SimplifyJobListing {
    company_name: string;
    title: string;
    locations: string[];
    url: string;
    date_posted: number;
    active: boolean;
    is_visible: boolean;
    sponsorship: string;
}

export interface JobOpportunity {
    role: string;
    location: string;
    posted: string;
    applyUrl: string;
    sponsorship: string;
}

let cachedListings: SimplifyJobListing[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000;

function formatPostedDate(timestamp: number): string {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
}

function normalizeCompanyName(name: string): string {
    return name.toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .replace(/inc$|llc$|corp$|corporation$|ltd$|limited$/g, '');
}

function fuzzyMatch(companyName: string, listingCompany: string): boolean {
    const normalizedCompany = normalizeCompanyName(companyName);
    const normalizedListing = normalizeCompanyName(listingCompany);

    return normalizedListing.includes(normalizedCompany) ||
        normalizedCompany.includes(normalizedListing);
}

export async function fetchJobListings(): Promise<SimplifyJobListing[]> {
    const now = Date.now();

    if (cachedListings && (now - cacheTimestamp) < CACHE_DURATION) {
        return cachedListings;
    }

    try {
        const response = await fetch(SIMPLIFY_JOBS_URL);
        if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.status}`);
        }

        const data = await response.json();
        cachedListings = data as SimplifyJobListing[];
        cacheTimestamp = now;
        return cachedListings;
    } catch (error) {
        console.error('Error fetching job listings:', error);
        return cachedListings || [];
    }
}

export async function getOpportunitiesForCompany(companyName: string): Promise<JobOpportunity[]> {
    const listings = await fetchJobListings();

    const matchingListings = listings
        .filter(listing => (listing.active || listing.is_visible) && fuzzyMatch(companyName, listing.company_name))
        .slice(0, 10);

    return matchingListings.map(listing => ({
        role: listing.title,
        location: listing.locations.join(', ') || 'Remote',
        posted: formatPostedDate(listing.date_posted),
        applyUrl: listing.url,
        sponsorship: listing.sponsorship
    }));
}
