import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Slot } from './types';

interface SlotsTrendChartProps {
    slots: Slot[];
}

export const SlotsTrendChart: React.FC<SlotsTrendChartProps> = ({ slots }) => {
    // 1. Generate the next 30 days
    const next30Days = useMemo(() => {
        const days = [];
        const today = new Date();
        for (let i = 0; i < 30; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() + i);
            days.push(d);
        }
        return days;
    }, []);

    // 2. Aggregate slots per day
    const data = useMemo(() => {
        // Create a map of YYYY-MM-DD -> count
        const counts: Record<string, number> = {};

        slots.forEach(slot => {
            const dateKey = new Date(slot.timestamp).toISOString().split('T')[0]; // YYYY-MM-DD
            counts[dateKey] = (counts[dateKey] || 0) + 1;
        });

        // Find max for scaling (min 5 to avoid huge bars for 1 slot)
        const maxCount = Math.max(5, ...Object.values(counts));

        // Map calendar days to bars
        return next30Days.map((date, i) => {
            const dateKey = date.toISOString().split('T')[0];
            const count = counts[dateKey] || 0;
            const height = (count / maxCount) * 100; // 0 to 100%

            // Use a visual min-height for bars with 0 or low availability so they are visible but distinct
            // For 0, we can show a very small blip or nothing. Let's show nothing for 0.

            return {
                date,
                count,
                height: count > 0 ? Math.max(5, height) : 2, // 2% height for empty days to keep timeline
                isAvailable: count > 0,
                label: `${count} slots`
            };
        });
    }, [slots, next30Days]);

    // X-Axis Labels (every 5 days)
    const axisLabels = useMemo(() => {
        return next30Days.filter((_, i) => i % 5 === 0).map(d => ({
            label: d.toLocaleDateString([], { month: 'short', day: 'numeric' }),
            index: ((next30Days.indexOf(d)) / 29) * 100 // Positioning percentage
        }));
    }, [next30Days]);

    return (
        <div className="w-full bg-white p-6 pb-2 rounded-3xl shadow-soft relative overflow-hidden mt-6">
            {/* Header */}
            <div className="absolute top-6 left-6 right-6 flex justify-between items-start z-20">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Next 30 Days Availability
                </h3>
            </div>

            {/* Total Count Overlay */}
            <div className="absolute top-12 left-6 text-[10px] text-gray-500 leading-tight z-10 transition-opacity duration-300">
                Total Openings<br />
                <span className="font-semibold text-gray-900 text-lg">
                    {slots.filter(s => {
                        const d = new Date(s.timestamp);
                        const now = new Date();
                        const diffTime = Math.abs(d.getTime() - now.getTime());
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        return diffDays <= 30;
                    }).length}
                </span>
            </div>

            {/* Chart Bars */}
            <div className="h-[160px] w-full flex items-end justify-between gap-[2px] pt-12 relative z-10 mt-4">
                {data.map((d, i) => (
                    <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${d.height}%` }}
                        transition={{ duration: 0.5, delay: i * 0.02, ease: "easeOut" }}
                        className={`w-full rounded-t-sm hover:opacity-80 transition-opacity cursor-pointer relative group ${d.isAvailable ? 'bg-black' : 'bg-gray-100'
                            }`}
                    >
                        {/* Simple Tooltip */}
                        {d.isAvailable && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-black text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                                {d.date.toLocaleDateString([], { month: 'short', day: 'numeric' })}: {d.label}
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>

            {/* X Axis */}
            <div className="relative h-6 mt-4 w-full">
                {axisLabels.map((l, i) => (
                    <span
                        key={i}
                        className="absolute text-[9px] text-gray-400 font-medium -translate-x-1/2"
                        style={{ left: `${l.index}%` }}
                    >
                        {l.label}
                    </span>
                ))}
            </div>

            {/* Background Decor */}
            <div className="absolute bottom-10 left-0 right-0 h-10 bg-gradient-to-t from-gray-50/50 to-transparent pointer-events-none"></div>
        </div>
    );
};
