import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { Building2, ThumbsUp, ThumbsDown, FileCheck, Calendar, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { EmployerData } from './types';
import { globalAverageApprovalRate, getApprovalLevel, getApprovalStyles } from './utils';

interface H1BStatsChartProps {
    employer: EmployerData;
}

export function H1BStatsChart({ employer }: H1BStatsChartProps) {
    const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');

    const stats = selectedYear === 'all'
        ? {
            year: 'all' as const,
            cases: employer.totalCases,
            approvals: employer.totalApprovals,
            denials: employer.totalDenials,
            approvalRate: employer.approvalRate,
            denialRate: employer.denialRate,
        }
        : (() => {
            const yearData = employer.yearlyHistory.find(y => y.year === selectedYear);
            if (!yearData) {
                return { year: selectedYear, cases: 0, approvals: 0, denials: 0, approvalRate: 0, denialRate: 0 };
            }
            const total = yearData.approvals + yearData.denials;
            return {
                year: selectedYear,
                cases: total,
                approvals: yearData.approvals,
                denials: yearData.denials,
                approvalRate: total > 0 ? (yearData.approvals / total) * 100 : 0,
                denialRate: total > 0 ? (yearData.denials / total) * 100 : 0,
            };
        })();

    const approvalLevel = getApprovalLevel(stats.approvalRate);
    const styles = getApprovalStyles(approvalLevel);

    const data = [
        { name: employer.name, rate: stats.approvalRate, type: 'employer' },
        { name: 'Industry Avg', rate: globalAverageApprovalRate, type: 'average' },
    ];

    // Colors adapted for Quantro
    const barColor = '#1F2937'; // gray-800
    const avgColor = '#E5E7EB'; // gray-200

    // Available years
    const availableYears = employer.yearlyHistory
        .filter(y => y.approvals > 0 || y.denials > 0)
        .map(y => y.year)
        .sort((a, b) => b - a);

    const yearRangeLabel = availableYears.length
        ? `${Math.min(...availableYears)}-${Math.max(...availableYears)}`
        : 'All years';

    return (
        <div className="bg-white rounded-3xl shadow-soft p-6">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                        Approval Statistics
                    </h3>
                    <h2 className="text-xl font-medium text-gray-900">{employer.name}</h2>
                </div>

                <div className="relative group">
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                        className="appearance-none bg-gray-50 border border-transparent pl-3 pr-8 py-1.5 rounded-lg text-xs font-medium text-gray-600 focus:outline-none cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                        <option value="all">{yearRangeLabel}</option>
                        {availableYears.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                    <ChevronDown className="w-3 h-3 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-4 bg-gray-50 rounded-2xl flex flex-col justify-between h-32">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Approval Rate</div>
                    <div>
                        <div className="text-4xl font-semibold text-gray-900 tracking-tight">
                            {stats.approvalRate.toFixed(1)}<span className="text-gray-400 text-2xl">%</span>
                        </div>
                        <div className={`text-xs font-medium mt-1 ${styles.text}`}>
                            {styles.label} Track Record
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-2">
                    <div className="px-4 py-2 bg-white border border-gray-100 rounded-xl flex justify-between items-center shadow-sm">
                        <span className="text-xs text-gray-500">Total Cases</span>
                        <span className="text-sm font-semibold text-gray-900">{stats.cases.toLocaleString()}</span>
                    </div>
                    <div className="px-4 py-2 bg-green-50/50 border border-green-100 rounded-xl flex justify-between items-center shadow-sm">
                        <span className="text-xs text-green-700">Approved</span>
                        <span className="text-sm font-semibold text-green-900">{stats.approvals.toLocaleString()}</span>
                    </div>
                    <div className="px-4 py-2 bg-red-50/50 border border-red-100 rounded-xl flex justify-between items-center shadow-sm">
                        <span className="text-xs text-red-700">Denied</span>
                        <span className="text-sm font-semibold text-red-900">{stats.denials.toLocaleString()}</span>
                    </div>
                </div>
            </div>


        </div>
    );
}
