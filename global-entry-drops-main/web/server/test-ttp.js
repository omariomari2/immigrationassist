// TTP API Base URL
const TTP_API = 'https://ttp.cbp.dhs.gov/schedulerapi';

async function testFetch() {
    const fetch = (await import('node-fetch')).default;
    console.log("Testing TTP API connection...");
    try {
        const response = await fetch(`${TTP_API}/locations/?temporary=false&inviteOnly=false&operational=true&serviceName=Global%20Entry`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'en-US,en;q=0.9',
                'Referer': 'https://ttp.cbp.dhs.gov/',
                'Origin': 'https://ttp.cbp.dhs.gov'
            }
        });

        console.log(`Status: ${response.status} ${response.statusText}`);
        if (!response.ok) {
            const body = await response.text();
            console.log("Error Body:", body.substring(0, 500));
        } else {
            const data = await response.json();
            console.log(`Success! Found ${data.length} locations.`);
        }
    } catch (e) {
        console.error("Fetch failed:", e.message);
    }
}

testFetch();
