import React, { useState, useEffect } from 'react';
import { TrendChart } from '../projects/h1b-analytics/TrendChart';
import { fetchEmployerById, loadEmployerSummary } from '../projects/h1b-analytics/utils';
import { EmployerData } from '../projects/h1b-analytics/types';

export const ProfileTrendChart = () => {
    const [employer, setEmployer] = useState<EmployerData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isActive = true;

        const loadData = async () => {
            try {
                // Default to fetching the top employer to show some data
                const summary = await loadEmployerSummary();
                const first = summary.topEmployers?.[0];

                if (first) {
                    const data = await fetchEmployerById(first.id);
                    if (isActive) setEmployer(data);
                }
            } catch (error) {
                console.error('[ProfileTrendChart] Failed to load data', error);
            } finally {
                if (isActive) setLoading(false);
            }
        };

        loadData();

        return () => {
            isActive = false;
        };
    }, []);

    if (loading) {
        return (
            <div className="w-full h-[280px] bg-white rounded-3xl shadow-soft flex items-center justify-center">
                <div className="animate-pulse w-8 h-8 rounded-full bg-gray-200"></div>
            </div>
        );
    }

    if (!employer) {
        return null;
    }

    return (
        <div className="w-full">
            <TrendChart employer={employer} />
        </div>
    );
};
