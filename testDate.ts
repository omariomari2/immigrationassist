import { calculateVisaCountdown } from './utils/dateUtils.ts';

const now = new Date();
const nextMonth = new Date(now);
nextMonth.setMonth(now.getMonth() + 1);
nextMonth.setDate(now.getDate() + 5);

console.log("Next month + 5 days:", calculateVisaCountdown(nextMonth.toISOString()));

const twoMonths = new Date(now);
twoMonths.setMonth(now.getMonth() + 2);
console.log("2 months:", calculateVisaCountdown(twoMonths.toISOString()));

const past = new Date(now);
past.setDate(now.getDate() - 1);
console.log("Past:", calculateVisaCountdown(past.toISOString()));
