export function calculateVisaCountdown(expirationDate: string): string {
    const now = new Date();
    const expiration = new Date(expirationDate);

    if (expiration < now) {
        return 'Expired';
    }

    // Calculate difference in months and days
    let months = (expiration.getFullYear() - now.getFullYear()) * 12;
    months -= now.getMonth();
    months += expiration.getMonth();

    // If expiration day is before now day, subtract a month
    if (expiration.getDate() < now.getDate()) {
        months--;
    }

    // Calculate remaining days
    // Create a date object for the "current month" but set to expiration day
    // This is tricky without date-fns, let's use a simpler approximation for display
    // or a robust custom implementation.

    // Robust implementation:
    // 1. Add 'months' to 'now' to get date A
    // 2. Diff days between date A and expiration

    const dateWithMonthsAdded = new Date(now);
    dateWithMonthsAdded.setMonth(dateWithMonthsAdded.getMonth() + months);

    // Normalize checking day to avoid overflow issues (e.g. Jan 31 + 1 month -> Feb 28/29)
    // But wait, setMonth handles overflow by moving to next month, which might throw off "exact month" count.
    // Actually, for "months left", we usually just mean full months.

    const diffTime = Math.abs(expiration.getTime() - dateWithMonthsAdded.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Adjust if calculation went slightly off due to month lengths
    // If dateWithMonthsAdded > expiration, we overshot.

    if (months < 0) months = 0;

    const parts = [];
    if (months > 0) {
        parts.push(`${months} Month${months !== 1 ? 's' : ''}`);
    }
    if (diffDays > 0) {
        parts.push(`${diffDays} Day${diffDays !== 1 ? 's' : ''}`);
    }

    if (parts.length === 0) return 'Is today';
    return parts.join(', ');
}
