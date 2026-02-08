import React, { useEffect, useRef, useState } from 'react';
import { Slot } from './types';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Clock, Calendar } from 'lucide-react';

import { sendExtensionMessage } from './extension-bridge';
import { logRecent } from '../recents';

interface SlotsListProps {
    slots: Slot[];
    loading: boolean;
    lastChecked: Date | null;
    locationId?: string;
    locationName?: string;
    locationShortName?: string;
    tzData?: string;
}

export const SlotsList: React.FC<SlotsListProps> = ({
    slots,
    loading,
    lastChecked,
    locationId,
    locationName,
    locationShortName,
    tzData
}) => {
    const bookingWindowRef = useRef<Window | null>(null);
    const pendingBookingUrlRef = useRef<string>('');
    const [bookingNotice, setBookingNotice] = useState<{ message: string; variant: 'success' | 'alert' } | null>(null);

    const formatTime = (isoString: string) => {
        return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (isoString: string) => {
        return new Date(isoString).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
    };

    const handleBook = (slot: Slot) => {
        const bookingUrl = 'https://ttp.cbp.dhs.gov/schedulerui/schedule-interview/location?lang=en&vo=true&returnUrl=ttp-external&service=up';
        bookingWindowRef.current = window.open('about:blank', '_blank');
        pendingBookingUrlRef.current = bookingUrl;

        if (!bookingWindowRef.current) {
            setBookingNotice({
                message: 'Popup blocked. Allow popups so we can open the booking page.',
                variant: 'alert'
            });
        } else {
            setBookingNotice({
                message: 'Selection sent. Waiting for the extension to confirm.',
                variant: 'success'
            });
        }

        // Notify extension to take over
        sendExtensionMessage('BOOK_APPT', {
            locationId,
            locationName,
            locationShortName,
            slotTimestamp: slot.timestamp,
            slotDisplay: `${formatDate(slot.timestamp)} ${formatTime(slot.timestamp)}`,
            tzData: tzData || ''
        });

        logRecent({
            title: locationName || 'Global Entry Slot',
            description: `Attempted booking: ${formatDate(slot.timestamp)} ${formatTime(slot.timestamp)}`,
            locationQuery: locationName ? `${locationName} Global Entry` : undefined,
            source: 'global-entry'
        });
    };

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.source !== window) return;
            const data = event.data || {};
            if (data.source !== 'ged-ext') return;
            if (data.type !== 'BOOK_APPT_ACK') return;

            const pendingUrl = pendingBookingUrlRef.current;
            if (!pendingUrl) return;

            if (bookingWindowRef.current && !bookingWindowRef.current.closed) {
                bookingWindowRef.current.location.href = pendingUrl;
            } else {
                window.open(pendingUrl, '_blank');
            }

            pendingBookingUrlRef.current = '';
            setBookingNotice({ message: 'Opening the booking page now.', variant: 'success' });
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    return (
        <div className="bg-white p-6 rounded-3xl shadow-soft h-[550px] flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        Available Slots
                    </h3>
                    <span className="bg-gray-100 text-gray-600 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                        {slots.length}
                    </span>
                </div>

                {lastChecked && (
                    <span className="text-[10px] text-gray-400">
                        Last checked: {lastChecked.toLocaleTimeString()}
                    </span>
                )}
            </div>

            {bookingNotice && (
                <div
                    className={`mb-4 rounded-xl px-3 py-2 text-[11px] font-medium ${bookingNotice.variant === 'alert'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-emerald-50 text-emerald-700'
                        }`}
                >
                    {bookingNotice.message}
                </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-hidden relative">
                {!loading && slots.length === 0 ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                            <Clock className="w-6 h-6 text-gray-300" />
                        </div>
                        <p className="text-sm font-medium text-gray-900">No open slots found</p>
                        <p className="text-xs text-gray-400 mt-1 max-w-[200px]">
                            We'll keep checking automatically. Try widening your date range.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-auto h-full pr-2 -mr-2 space-y-2">
                        <AnimatePresence>
                            {slots
                                .filter(s => s.timestamp) // Filter out empty timestamps
                                .map((slot, i) => (
                                    <motion.div
                                        key={`${slot.timestamp}-${i}`} // Composite key for uniqueness
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="group flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all bg-white"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="flex flex-col">
                                                <div className="text-xs font-semibold text-gray-900 flex items-center gap-1.5">
                                                    <Calendar className="w-3 h-3 text-gray-400" />
                                                    {formatDate(slot.timestamp)}
                                                </div>
                                                <div className="text-[10px] text-gray-500 pl-4.5">
                                                    {formatTime(slot.timestamp)}
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleBook(slot)}
                                            className="px-3 py-1.5 bg-black text-white text-xs font-medium rounded-lg flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            Book <ExternalLink className="w-3 h-3" />
                                        </button>
                                    </motion.div>
                                ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
};
