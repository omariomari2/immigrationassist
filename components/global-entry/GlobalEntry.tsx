import React, { useState, useEffect, useRef } from 'react';
import { MonitorControl } from './MonitorControl';
import { SlotsList } from './SlotsList';
import { SystemStatus, MostRecentSlot } from './StatusCard';
import { SlotsTrendChart } from './SlotsTrendChart';
import { ActionButtons } from './ActionButtons';
import { fetchLocations, fetchSlots } from './api';
import { Location, Slot, SlotResponse } from './types';
import { sendExtensionMessage } from './extension-bridge';
import { logRecent } from '../recents';
import { AccountInfo } from './AccountInfo';
import { RecentActivities } from '../profile/RecentActivities';
import { AISuggestions } from '../profile/AISuggestions';
import { RecentAIChats } from '../profile/RecentAIChats';
import { ProfileTrendChart } from '../profile/ProfileTrendChart';

export const GlobalEntry = ({ onNavigateToOpsStatus, onNavigateToProjects, showAccountInfo = false }: { onNavigateToOpsStatus?: () => void; onNavigateToProjects?: () => void; showAccountInfo?: boolean }) => {
    const getInitialRunning = () => localStorage.getItem('ged_isRunning') === 'true';
    const getInitialSlots = () => {
        const savedRunning = localStorage.getItem('ged_isRunning') === 'true';
        if (!savedRunning) {
            return [];
        }
        const saved = localStorage.getItem('ged_slots');
        return saved ? JSON.parse(saved) : [];
    };

    const [locations, setLocations] = useState<Location[]>([]);
    const hasResyncedExtensionRef = useRef(false);

    // Initialize state from local storage
    const [isRunning, setIsRunning] = useState(getInitialRunning);

    const [slots, setSlots] = useState<Slot[]>(getInitialSlots);

    const [loading, setLoading] = useState(false);
    const [lastChecked, setLastChecked] = useState<Date | null>(() => {
        const saved = localStorage.getItem('ged_lastChecked');
        return saved ? new Date(saved) : null;
    });

    // Monitoring state
    const [monitorParams, setMonitorParams] = useState<{
        locationId: string;
        startDate: string;
        endDate: string;
    } | null>(() => {
        const saved = localStorage.getItem('ged_monitorParams');
        return saved ? JSON.parse(saved) : null;
    });

    // Persist state changes
    useEffect(() => {
        localStorage.setItem('ged_isRunning', String(isRunning));
        localStorage.setItem('ged_slots', JSON.stringify(slots));
        if (lastChecked) localStorage.setItem('ged_lastChecked', lastChecked.toISOString());
        if (monitorParams) localStorage.setItem('ged_monitorParams', JSON.stringify(monitorParams));
    }, [isRunning, slots, lastChecked, monitorParams]);

    const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Load locations on mount
    useEffect(() => {
        fetchLocations().then(setLocations);
    }, []);

    // Polling logic
    useEffect(() => {
        if (isRunning && monitorParams) {
            // Initial fetch
            fetchData();

            // Set up interval (every 60s)
            pollTimerRef.current = setInterval(fetchData, 60000);
        } else {
            if (pollTimerRef.current) {
                clearInterval(pollTimerRef.current);
                pollTimerRef.current = null;
            }
        }

        return () => {
            if (pollTimerRef.current) {
                clearInterval(pollTimerRef.current);
            }
        };
    }, [isRunning, monitorParams]);

    // Extension Integration
    useEffect(() => {
        // Request initial status
        sendExtensionMessage('REQ_STATUS');

        const handleMessage = (event: MessageEvent) => {
            if (event.source !== window) return;
            const data = event.data || {};
            if (data.source !== 'ged-ext') return;

            if (data.type === 'EXT_STATUS') {
                const payload = data.payload || {};
                const prefs = payload.prefs || {};
                const hasRequiredPrefs = Boolean(prefs.locationId && prefs.startDate && prefs.endDate);

                if (payload.isRunning) {
                    // Sync start from extension
                    setMonitorParams({
                        locationId: prefs.locationId || '',
                        startDate: prefs.startDate || '',
                        endDate: prefs.endDate || '',
                    });
                    setIsRunning(true);

                    if (hasRequiredPrefs && !hasResyncedExtensionRef.current) {
                        hasResyncedExtensionRef.current = true;
                        sendExtensionMessage('WEB_START', {
                            locationId: prefs.locationId,
                            startDate: prefs.startDate,
                            endDate: prefs.endDate,
                            tzData: prefs.tzData || '',
                            locationName: prefs.locationName || ''
                        });
                    }
                } else {
                    // Sync stop from extension
                    setIsRunning(false);
                    setSlots([]);
                    hasResyncedExtensionRef.current = false;
                }
            }

            if (data.type === 'BOOK_APPT_ACK') {
                // Handle booking ack if needed (e.g. notifications)
                console.log('Booking request acknowledged by extension');
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    const fetchData = async () => {
        if (!monitorParams) return;

        setLoading(true);
        const result = await fetchSlots(
            monitorParams.locationId,
            monitorParams.startDate,
            monitorParams.endDate
        );

        setLastChecked(new Date());
        setLoading(false);

        if (result) {
            setSlots(result.slots);
        }
    };

    const handleStart = (locationId: string, startDate: string, endDate: string) => {
        console.log('[GlobalEntry] Starting monitoring', { locationId, startDate, endDate });
        const selectedLocation = locations.find((location: Location) => location.id.toString() === locationId);
        const params = { locationId, startDate, endDate };
        setMonitorParams(params);
        setIsRunning(true);
        if (selectedLocation) {
            logRecent({
                title: selectedLocation.name,
                description: `Monitoring visa slots ${startDate} to ${endDate}`,
                locationQuery: `${selectedLocation.name} Global Entry`,
                source: 'global-entry'
            });
        }
        sendExtensionMessage('WEB_START', {
            ...params,
            tzData: selectedLocation?.tzData || '',
            locationName: selectedLocation?.name || ''
        });
    };

    const handleStop = () => {
        console.log('[GlobalEntry] Stopping monitoring');
        setIsRunning(false);
        setSlots([]); // Clear slots when stopped
        hasResyncedExtensionRef.current = false;
        sendExtensionMessage('WEB_STOP');
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1 flex flex-col gap-6">
                    <MostRecentSlot mostRecentSlot={slots.length > 0 ? slots[0].timestamp : null} />
                    {showAccountInfo ? (
                        <AccountInfo />
                    ) : (
                        <MonitorControl
                            locations={locations}
                            isRunning={isRunning}
                            onStart={handleStart}
                            onStop={handleStop}
                            initialValues={monitorParams || undefined}
                        />
                    )}
                    <SystemStatus
                        isRunning={isRunning}
                        lastChecked={lastChecked}
                    />
                    <div className="flex-1 flex flex-col justify-end mt-auto">
                        <ActionButtons
                            onNavigateToOpsStatus={onNavigateToOpsStatus}
                            onNavigateToProjects={onNavigateToProjects}
                            isProfile={showAccountInfo}
                        />
                    </div>
                </div>
                <div className="lg:col-span-3">
                    {showAccountInfo ? (
                        <div className="flex flex-col gap-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="h-[550px]">
                                    <RecentActivities />
                                </div>
                                <div className="flex flex-col gap-6">
                                    <div className="h-[260px]">
                                        <AISuggestions />
                                    </div>
                                    <div className="h-[260px]">
                                        <RecentAIChats />
                                    </div>
                                </div>
                            </div>
                            <div className="w-full">
                                <ProfileTrendChart />
                            </div>
                        </div>
                    ) : (
                        <>
                            <SlotsList
                                slots={slots}
                                loading={loading}
                                lastChecked={lastChecked}
                                locationId={monitorParams?.locationId}
                                locationName={locations.find((l: Location) => l.id.toString() === monitorParams?.locationId)?.name}
                                tzData={locations.find((l: Location) => l.id.toString() === monitorParams?.locationId)?.tzData}
                            />

                            <SlotsTrendChart slots={slots} />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
