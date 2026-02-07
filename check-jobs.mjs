const SIMPLIFY_JOBS_URL = 'https://raw.githubusercontent.com/SimplifyJobs/Summer2025-Internships/dev/.github/scripts/listings.json';

const response = await fetch(SIMPLIFY_JOBS_URL);
const data = await response.json();

const now = Date.now();
const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);
const oneMonthAgo = now - (30 * 24 * 60 * 60 * 1000);

const activeJobs = data.filter(x => x.active);

const recentlyPosted = activeJobs.filter(x => x.date_posted * 1000 > oneWeekAgo);
const recentlyUpdated = activeJobs.filter(x => x.date_updated * 1000 > oneWeekAgo);
const postedLastMonth = activeJobs.filter(x => x.date_posted * 1000 > oneMonthAgo);

console.log('Total Active:', activeJobs.length);
console.log('Posted in last week:', recentlyPosted.length);
console.log('Posted in last month:', postedLastMonth.length);
console.log('Updated in last week:', recentlyUpdated.length);

console.log('\n--- Sample Active Job (recent) ---');
if (recentlyUpdated.length > 0) {
    const sample = recentlyUpdated[0];
    console.log('Company:', sample.company_name);
    console.log('Title:', sample.title);
    console.log('URL:', sample.url);
    console.log('Posted:', new Date(sample.date_posted * 1000).toISOString());
    console.log('Updated:', new Date(sample.date_updated * 1000).toISOString());
}

console.log('\n--- Sample Old Job ---');
const oldJobs = activeJobs.filter(x => x.date_posted * 1000 < oneMonthAgo);
if (oldJobs.length > 0) {
    const sample = oldJobs[0];
    console.log('Company:', sample.company_name);
    console.log('Title:', sample.title);
    console.log('Posted:', new Date(sample.date_posted * 1000).toISOString());
    console.log('Days old:', Math.floor((now - sample.date_posted * 1000) / (1000 * 60 * 60 * 24)));
}
