import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { EmployerData } from './types';

interface TrendChartProps {
    employer: EmployerData;
}

export const TrendChart: React.FC<TrendChartProps> = ({ employer }) => {
    const data = useMemo(() => {
        const yearlyData = employer.yearlyHistory.map(y => ({
            year: y.year.toString(),
            rate: Math.round((y.approvals / (y.approvals + y.denials)) * 100 * 10) / 10 || 0,
            approvals: y.approvals,
            denials: y.denials
        }));

        if (yearlyData.length === 0) return [];

        const maxRate = Math.max(...yearlyData.map(d => d.rate), 50);

        return yearlyData.map(d => ({
            ...d,
            height: (d.rate / maxRate) * 100,
            isHigh: d.rate >= 90
        }));
    }, [employer.yearlyHistory]);

    if (data.length === 0) {
        return (
            <div className="bg-gray-50 rounded-3xl p-6 text-center text-sm text-gray-500">
                Historical data not available
            </div>
        );
    }

    const avgRate = data.reduce((sum, d) => sum + d.rate, 0) / data.length;

    return (
        <div className="w-full h-[280px] bg-white p-6 pb-2 rounded-3xl shadow-soft relative overflow-hidden">
            <div className="absolute top-6 left-6 right-6 flex justify-between items-start z-20">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Historical Approval Rates
                </h3>
                <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right">
                    {employer.name}
                </h3>
            </div>

            <div className="absolute top-12 left-6 text-[10px] text-gray-500 leading-tight z-10 transition-opacity duration-300">
                Average Rate<br />
                <span className="font-semibold text-gray-900 text-lg">
                    {avgRate.toFixed(1)}%
                </span>
            </div>

            <div className="h-[160px] w-full flex items-end justify-between gap-[3px] pt-12 relative z-10 mt-4">
                {data.map((d, i) => (
                    <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${d.height}%` }}
                        transition={{ duration: 0.5, delay: i * 0.02, ease: "easeOut" }}
                        className={`w-full rounded-t-sm hover:opacity-80 transition-opacity cursor-pointer relative group ${d.isHigh ? 'bg-black' : 'bg-gray-300'
                            }`}
                    >
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-black text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                            {d.year}: {d.rate.toFixed(1)}%
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="relative h-6 mt-4 w-full flex justify-between">
                {data.map((d, i) => (
                    <span
                        key={i}
                        className="text-[9px] text-gray-400 font-medium text-center flex-1"
                    >
                        {d.year}
                    </span>
                ))}
            </div>

            <div className="absolute bottom-10 left-0 right-0 h-10 bg-gradient-to-t from-gray-50/50 to-transparent pointer-events-none"></div>
        </div>
    );
};
