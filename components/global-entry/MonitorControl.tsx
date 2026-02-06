import React from 'react';
import { Location } from './types';
import { Play, Square, Calendar, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

interface MonitorControlProps {
    locations: Location[];
    isRunning: boolean;
    onStart: (locationId: string, startDate: string, endDate: string) => void;
    onStop: () => void;
    initialValues?: {
        locationId: string;
        startDate: string;
        endDate: string;
    };
}

export const MonitorControl: React.FC<MonitorControlProps> = ({
    locations,
    isRunning,
    onStart,
    onStop,
    initialValues
}) => {
    const [locationId, setLocationId] = React.useState(initialValues?.locationId || '');
    const [startDate, setStartDate] = React.useState(initialValues?.startDate || '');
    const [endDate, setEndDate] = React.useState(initialValues?.endDate || '');

    const today = new Date().toISOString().split('T')[0];

    const handleStart = () => {
        if (locationId && startDate && endDate) {
            onStart(locationId, startDate, endDate);
        }
    };

    return (
        <div className="bg-white p-6 rounded-3xl shadow-soft">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Monitor Settings
                </h3>
                <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${isRunning ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isRunning ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                    {isRunning ? 'Running' : 'Stopped'}
                </div>
            </div>

            {/* Form Stack */}
            <div className="flex flex-col gap-6 mb-6">
                {/* Location Select */}
                <div className="space-y-2">
                    <label className="text-[10px] font-medium text-gray-400">ENROLLMENT LOCATION</label>
                    <div className="relative group">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-gray-600" />
                        <select
                            value={locationId}
                            onChange={(e) => setLocationId(e.target.value)}
                            disabled={isRunning}
                            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 rounded-xl text-sm text-gray-700 border-none focus:ring-2 focus:ring-black/5 outline-none transition-all disabled:opacity-50 appearance-none"
                            style={{ backgroundImage: 'none' }}
                        >
                            <option value="">Select a location</option>
                            {locations.map(loc => (
                                <option key={loc.id} value={loc.id}>{loc.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Start Date */}
                <div className="space-y-2">
                    <label className="text-[10px] font-medium text-gray-400">START DATE</label>
                    <div className="relative group">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-gray-600" />
                        <input
                            type="date"
                            min={today}
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            disabled={isRunning}
                            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 rounded-xl text-sm text-gray-700 border-none focus:ring-2 focus:ring-black/5 outline-none transition-all disabled:opacity-50"
                        />
                    </div>
                </div>

                {/* End Date */}
                <div className="space-y-2">
                    <label className="text-[10px] font-medium text-gray-400">END DATE</label>
                    <div className="relative group">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-gray-600" />
                        <input
                            type="date"
                            min={startDate || today}
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            disabled={isRunning}
                            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 rounded-xl text-sm text-gray-700 border-none focus:ring-2 focus:ring-black/5 outline-none transition-all disabled:opacity-50"
                        />
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
                {!isRunning ? (
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleStart}
                        disabled={!locationId || !startDate || !endDate}
                        className="flex-1 bg-black text-white py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-black/10"
                    >
                        <Play className="w-4 h-4 fill-current" />
                        Start Monitoring
                    </motion.button>
                ) : (
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onStop}
                        className="flex-1 bg-white border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
                    >
                        <Square className="w-4 h-4 fill-current" />
                        Stop
                    </motion.button>
                )}
            </div>
        </div>
    );
};
