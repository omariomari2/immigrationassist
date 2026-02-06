import { useEffect, useMemo, useState } from 'react';
import {
    MessageSquare,
    ExternalLink,
    Star,
    Navigation
} from 'lucide-react';
import { motion } from 'framer-motion';
import { MapboxMap, geocodeAddress } from './MapboxMap';
import { getRecents, saveRecents, RECENTS_EVENT } from '../recents';
import type { RecentItem } from '../recents';

type ResourceCategory = 'recents' | 'lawyers' | 'surgeons' | 'shelter' | 'ice';

type StaticCategory = Exclude<ResourceCategory, 'recents'>;

interface ResourceItem {
    id: string;
    title: string;
    description: string;
    address: string;
    city: string;
    state: string;
    phone?: string;
    rating?: number;
    website?: string;
    coordinates?: [number, number];
}

const DEFAULT_CENTER: [number, number] = [37.7749, -122.4194];

const RESOURCE_TABS: Array<{ id: ResourceCategory; label: string }> = [
    { id: 'recents', label: 'Recents' },
    { id: 'lawyers', label: 'Immigration Lawyers' },
    { id: 'surgeons', label: 'Civil Surgeons' },
    { id: 'shelter', label: 'Shelter' },
    { id: 'ice', label: 'ICE Status' }
];

const STATIC_RESOURCE_DATA: Record<StaticCategory, ResourceItem[]> = {
    lawyers: [
        {
            id: '1',
            title: 'Harrison Law Office',
            description: 'Full-service immigration law, asylum, deportation defense',
            address: '870 Market St Suite 574',
            city: 'San Francisco',
            state: 'CA',
            phone: '(415) 212-6817',
            rating: 4.8,
            coordinates: [37.7849, -122.4074]
        },
        {
            id: '2',
            title: 'Law Office of Amie D. Miller',
            description: 'Visas, citizenship, asylum, Bay Area immigration attorney',
            address: '220 Montgomery St',
            city: 'San Francisco',
            state: 'CA',
            phone: '(415) 362-8602',
            rating: 4.7,
            coordinates: [37.7915, -122.4019]
        },
        {
            id: '3',
            title: 'Oasis Law Group',
            description: 'Bay Area immigration law, family visas, employment immigration',
            address: '1230 Market St',
            city: 'San Francisco',
            state: 'CA',
            phone: '(415) 865-0010',
            rating: 4.5,
            coordinates: [37.7782, -122.4168]
        },
        {
            id: '4',
            title: 'Richard S. Kolomejec Immigration Law',
            description: 'San Francisco immigration attorney, green cards, naturalization',
            address: '388 Market St',
            city: 'San Francisco',
            state: 'CA',
            phone: '(415) 433-7205',
            rating: 4.6,
            coordinates: [37.7925, -122.3989]
        }
    ],
    surgeons: [
        {
            id: '1',
            title: 'Downtown Medical Group',
            description: 'USCIS civil surgeon, immigration medical exams, Union Square',
            address: '450 Sutter St',
            city: 'San Francisco',
            state: 'CA',
            phone: '(415) 362-2630',
            rating: 4.7,
            coordinates: [37.7893, -122.4073]
        },
        {
            id: '2',
            title: 'UCIS Medical Exam Center',
            description: 'USCIS authorized civil surgeon, I-693 exams',
            address: '2100 Webster St',
            city: 'San Francisco',
            state: 'CA',
            phone: '(415) 923-6311',
            rating: 4.5,
            coordinates: [37.7909, -122.4334]
        },
        {
            id: '3',
            title: 'Dr. Maria Santos - Civil Surgeon',
            description: 'USCIS designated civil surgeon, immigration physicals',
            address: '909 Hyde St',
            city: 'San Francisco',
            state: 'CA',
            phone: '(415) 474-8600',
            rating: 4.6,
            coordinates: [37.7891, -122.4165]
        },
        {
            id: '4',
            title: 'Golden Gate Immigration Health',
            description: 'USCIS medical exams, vaccinations, Form I-693',
            address: '2238 Geary Blvd',
            city: 'San Francisco',
            state: 'CA',
            phone: '(415) 931-5000',
            rating: 4.4,
            coordinates: [37.7837, -122.4431]
        }
    ],
    shelter: [
        {
            id: '1',
            title: 'SF Homeless Outreach Team (SFHOT)',
            description: 'Street outreach, shelter referrals, homeless services',
            address: '1500 Mission St',
            city: 'San Francisco',
            state: 'CA',
            phone: '(628) 652-8000',
            rating: 4.3,
            coordinates: [37.7728, -122.4194]
        },
        {
            id: '2',
            title: 'CHANGES Shelter Reservation',
            description: 'Emergency shelter reservations, same-day placement',
            address: '1171 Mission St',
            city: 'San Francisco',
            state: 'CA',
            phone: '(415) 487-3300',
            rating: 4.1,
            coordinates: [37.7783, -122.4142]
        },
        {
            id: '3',
            title: 'Adult Access Point - Sanctuary',
            description: 'Emergency shelter, transitional housing for adults',
            address: '201 5th St',
            city: 'San Francisco',
            state: 'CA',
            phone: '(415) 503-6060',
            rating: 4.4,
            coordinates: [37.7825, -122.4056]
        },
        {
            id: '4',
            title: 'Compass Family Services',
            description: 'Family shelter, prevention services, housing assistance',
            address: '37 Grove St',
            city: 'San Francisco',
            state: 'CA',
            phone: '(415) 644-0504',
            rating: 4.6,
            coordinates: [37.7789, -122.4197]
        }
    ],
    ice: [
        {
            id: '1',
            title: 'ICE San Francisco Field Office',
            description: 'Enforcement and Removal Operations, Northern California',
            address: '630 Sansome St Rm 590',
            city: 'San Francisco',
            state: 'CA',
            phone: '(415) 365-8800',
            rating: 3.4,
            coordinates: [37.7945, -122.4022]
        },
        {
            id: '2',
            title: 'ICE Detained Reporting - SF',
            description: 'Non-detained reporting location for check-ins',
            address: '630 Sansome St 4th Floor',
            city: 'San Francisco',
            state: 'CA',
            phone: '(415) 844-5512',
            rating: 3.2,
            coordinates: [37.7945, -122.4020]
        },
        {
            id: '3',
            title: 'SF Rapid Response Network',
            description: '24/7 hotline for ICE activity, legal assistance',
            address: 'San Francisco Bay Area',
            city: 'San Francisco',
            state: 'CA',
            phone: '(415) 200-1548',
            rating: 4.5,
            coordinates: [37.7749, -122.4194]
        },
        {
            id: '4',
            title: 'Contra Costa West County Detention Facility',
            description: 'ICE detention facility - Bay Area',
            address: '5555 Giant Hwy',
            city: 'Richmond',
            state: 'CA',
            phone: '(510) 262-4000',
            rating: 2.9,
            coordinates: [37.9358, -122.3477]
        }
    ]
};

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 3959;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

const mapRecentToResource = (recent: RecentItem, coordinates?: [number, number]): ResourceItem => {
    return {
        id: recent.id,
        title: recent.title,
        description: recent.description,
        address: recent.address || recent.locationQuery || 'Recent activity',
        city: recent.city || '',
        state: recent.state || '',
        phone: recent.phone,
        rating: recent.rating,
        website: recent.website,
        coordinates: coordinates || recent.coordinates
    };
};

export function OpsStatus() {
    const [activeResourceTab, setActiveResourceTab] = useState<ResourceCategory>('recents');
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [distanceInfo, setDistanceInfo] = useState<{ index: number; distance: string } | null>(null);
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const [recentResources, setRecentResources] = useState<ResourceItem[]>([]);

    const totalResources = useMemo(() =>
        Object.values(STATIC_RESOURCE_DATA).reduce((sum, list) => sum + list.length, 0),
        []);

    const resourceData = useMemo<Record<ResourceCategory, ResourceItem[]>>(() => ({
        recents: recentResources,
        ...STATIC_RESOURCE_DATA
    }), [recentResources]);

    const currentResources = resourceData[activeResourceTab] || [];

    useEffect(() => {
        const loadRecents = async () => {
            const recents = getRecents();
            if (!recents.length) {
                setRecentResources([]);
                return;
            }

            let updated = false;
            const updatedRecents = [...recents];

            const resources = await Promise.all(recents.map(async (recent, index) => {
                if (!recent.coordinates && recent.locationQuery) {
                    const geocoded = await geocodeAddress(recent.locationQuery);
                    if (geocoded) {
                        updatedRecents[index] = { ...recent, coordinates: geocoded };
                        updated = true;
                        return mapRecentToResource(recent, geocoded);
                    }
                }
                return mapRecentToResource(recent);
            }));

            if (updated) {
                saveRecents(updatedRecents);
            }

            setRecentResources(resources);
        };

        loadRecents();

        const handleUpdate = () => {
            loadRecents();
        };

        window.addEventListener(RECENTS_EVENT, handleUpdate);
        window.addEventListener('storage', handleUpdate);

        return () => {
            window.removeEventListener(RECENTS_EVENT, handleUpdate);
            window.removeEventListener('storage', handleUpdate);
        };
    }, []);

    const mapMarkers = useMemo(() =>
        currentResources
            .filter((resource) => resource.coordinates)
            .map((resource) => ({
                position: resource.coordinates!,
                title: resource.title,
                phone: resource.phone,
                address: resource.address,
                city: resource.city,
                state: resource.state,
                website: resource.website
            })),
        [currentResources]);

    const selectedResource = selectedIndex !== null ? currentResources[selectedIndex] : null;
    const mapCenter = selectedResource?.coordinates || DEFAULT_CENTER;
    const mapZoom = selectedResource?.coordinates ? 14 : 12;

    const handleResourceTabChange = (tab: ResourceCategory) => {
        setActiveResourceTab(tab);
        setSelectedIndex(null);
        setHoveredIndex(null);
        setDistanceInfo(null);
    };

    const handleDistanceClick = (index: number) => {
        if (distanceInfo?.index === index) {
            setDistanceInfo(null);
            return;
        }

        const listing = currentResources[index];
        if (!listing?.coordinates || !userLocation) {
            return;
        }

        const [lat, lng] = listing.coordinates;
        const distance = calculateDistance(userLocation[0], userLocation[1], lat, lng);
        setDistanceInfo({ index, distance: distance.toFixed(1) });
    };

    const targetLocation = distanceInfo
        ? currentResources[distanceInfo.index]?.coordinates || null
        : null;

    const statValue = activeResourceTab === 'recents' ? recentResources.length : totalResources;
    const statLabel = activeResourceTab === 'recents'
        ? 'Recent activity across the app'
        : 'Essential Resources near you';

    const mapLabel = activeResourceTab === 'ice'
        ? 'ICE Support Network'
        : activeResourceTab === 'recents'
            ? 'Recent activity map'
            : 'San Francisco Bay Area';

    return (
        <div className="flex flex-col h-full w-full">
            <div className="flex-1 overflow-auto">
                <div className="h-full">
                    <div className="flex flex-col lg:flex-row h-full gap-6">
                        <div className="w-full lg:w-[30%] flex flex-col gap-6 h-[calc(100vh-250px)]">
                            <div className="flex flex-col">
                                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                                    {statLabel}
                                </h3>
                                <div className="flex items-baseline gap-2">
                                    <motion.div
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="text-6xl sm:text-7xl font-semibold tracking-tight text-gray-800 leading-none"
                                    >
                                        {statValue}
                                    </motion.div>
                                    <span className="text-xs text-gray-400 font-semibold">active listings</span>
                                </div>
                            </div>

                            <div className="flex-1 flex flex-col bg-white rounded-3xl shadow-soft p-6 overflow-hidden">
                                <div className="flex justify-between items-center mb-6">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                            Local Resources
                                        </h3>
                                        <span className="bg-gray-100 text-gray-600 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                                            {currentResources.length}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 mb-4">
                                    {RESOURCE_TABS.map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => handleResourceTabChange(tab.id)}
                                            className={`px-3 py-2 text-[11px] font-medium rounded-xl transition-all ${activeResourceTab === tab.id
                                                ? 'bg-black text-white'
                                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                                }`}
                                        >
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>

                                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                                    {currentResources.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center text-center text-xs text-gray-400 border border-dashed border-gray-200 rounded-2xl py-8">
                                            No recent activity yet.
                                        </div>
                                    ) : (
                                        currentResources.map((resource, idx) => {
                                            const isSelected = selectedIndex === idx;
                                            const isHovered = hoveredIndex === idx;
                                            const hasCoordinates = Boolean(resource.coordinates);
                                            const distanceLabel = !hasCoordinates
                                                ? 'No location'
                                                : distanceInfo?.index === idx
                                                    ? `${distanceInfo.distance} mi`
                                                    : userLocation
                                                        ? 'Distance'
                                                        : 'Enable location';

                                            const locationText = [resource.address, resource.city, resource.state]
                                                .filter(Boolean)
                                                .join(', ');

                                            return (
                                                <div
                                                    key={resource.id}
                                                    className={`p-4 rounded-2xl border transition-all cursor-pointer group bg-white ${isSelected
                                                        ? 'border-black shadow-sm'
                                                        : isHovered
                                                            ? 'border-gray-300 shadow-sm'
                                                            : 'border-gray-100'
                                                        }`}
                                                    onClick={() => {
                                                        setSelectedIndex(idx);
                                                        setDistanceInfo(null);
                                                    }}
                                                    onMouseEnter={() => setHoveredIndex(idx)}
                                                    onMouseLeave={() => setHoveredIndex(null)}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className="w-7 h-7 rounded-full bg-gray-50 text-gray-900 flex items-center justify-center text-xs font-bold flex-shrink-0 border border-gray-200">
                                                            {idx + 1}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-start justify-between gap-2">
                                                                <div>
                                                                    <h4 className="font-semibold text-sm text-gray-900">{resource.title}</h4>
                                                                    <p className="text-xs text-gray-500 mt-1">{resource.description}</p>
                                                                </div>
                                                                {resource.rating !== undefined && (
                                                                    <span className="flex items-center gap-1 text-xs font-semibold text-gray-700">
                                                                        <Star size={12} className="text-gray-700" />
                                                                        {resource.rating.toFixed(1)}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-gray-500 mt-2">
                                                                {locationText || 'Location pending'}
                                                            </p>

                                                            <div className="flex flex-wrap items-center gap-2 mt-3">
                                                                {resource.phone && (
                                                                    <span className="text-[10px] bg-gray-50 px-2 py-1 rounded text-gray-500 flex items-center gap-1 border border-gray-100">
                                                                        <MessageSquare size={10} /> {resource.phone}
                                                                    </span>
                                                                )}
                                                                {resource.website && (
                                                                    <a
                                                                        onClick={(event) => event.stopPropagation()}
                                                                        href={resource.website}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="text-[10px] bg-gray-50 px-2 py-1 rounded text-gray-500 flex items-center gap-1 hover:text-black border border-gray-100 transition-colors"
                                                                    >
                                                                        <ExternalLink size={10} /> Website
                                                                    </a>
                                                                )}
                                                                <button
                                                                    onClick={(event) => {
                                                                        event.stopPropagation();
                                                                        handleDistanceClick(idx);
                                                                    }}
                                                                    disabled={!hasCoordinates}
                                                                    className={`text-[10px] px-2 py-1 rounded flex items-center gap-1 border transition-colors ${distanceInfo?.index === idx
                                                                        ? 'bg-black text-white border-black'
                                                                        : 'bg-gray-50 text-gray-500 border-gray-100 hover:text-black'
                                                                        } ${!hasCoordinates ? 'opacity-60 cursor-not-allowed' : ''}`}
                                                                >
                                                                    <Navigation size={10} /> {distanceLabel}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="w-full lg:w-[70%] overflow-hidden relative h-[calc(100vh-250px)]">
                            <div className="absolute top-4 left-4 z-[400] bg-white px-3 py-2 rounded-lg shadow-md border border-gray-200">
                                <p className="text-xs font-semibold text-gray-700">
                                    {mapLabel}
                                </p>
                            </div>
                            <MapboxMap
                                center={mapCenter}
                                zoom={mapZoom}
                                markers={mapMarkers}
                                height="100%"
                                userLocation={userLocation}
                                targetLocation={targetLocation}
                                distance={distanceInfo?.distance || null}
                                selectedMarkerIndex={selectedIndex}
                                hoveredMarkerIndex={hoveredIndex}
                                onMarkerClick={(index) => {
                                    setSelectedIndex(index);
                                    setDistanceInfo(null);
                                }}
                                onLocationFound={(location) => setUserLocation(location)}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
