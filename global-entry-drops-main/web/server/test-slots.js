// TTP API Base URL
const TTP_API = 'https://ttp.cbp.dhs.gov/schedulerapi';

async function testSlots() {
    const fetch = (await import('node-fetch')).default;

    // Use a known location ID (e.g., SFO: 5446 or similar, usually 5005 is widely used for testing or just query locations first)
    // Let's assume we need to pick a valid location ID.
    // First, let's fetch locations to get a valid ID.

    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://ttp.cbp.dhs.gov/',
        'Origin': 'https://ttp.cbp.dhs.gov'
    };

    console.log("1. Fetching locations to find a valid ID...");
    try {
        const locResponse = await fetch(`${TTP_API}/locations/?temporary=false&inviteOnly=false&operational=true&serviceName=Global%20Entry`, { headers });
        if (!locResponse.ok) throw new Error(`Locs Failed: ${locResponse.status}`);
        const locs = await locResponse.json();
        const targetLoc = locs.find(l => l.name.includes("San Francisco")) || locs[0];

        if (!targetLoc) {
            console.error("No locations found!");
            return;
        }

        console.log(`Targeting Location: ${targetLoc.name} (ID: ${targetLoc.id})`);

        // Test 1: Fetch Slots WITHOUT Headers (Expect Failure)
        console.log("\n2. Testing Slots WITHOUT Headers...");
        const url = `${TTP_API}/slots?orderBy=soonest&limit=1&locationId=${targetLoc.id}&minimum=1`;
        const resInit = await fetch(url);
        console.log(`   Status: ${resInit.status} ${resInit.statusText}`);
        if (!resInit.ok) console.log("   (Expected Failure confirmed)");
        else console.log("   (Unexpected Success?)");

        // Test 2: Fetch Slots WITH Headers (Expect Success)
        console.log("\n3. Testing Slots WITH Headers...");
        const resFixed = await fetch(url, { headers });
        console.log(`   Status: ${resFixed.status} ${resFixed.statusText}`);
        if (resFixed.ok) {
            const data = await resFixed.json();
            console.log(`   Success! Found ${data.length} slots.`);
            if (data.length > 0) console.log(`   Sample: ${JSON.stringify(data[0])}`);
        } else {
            console.log("   Failed even with headers.");
        }

    } catch (e) {
        console.error("Test failed:", e);
    }
}

testSlots();
