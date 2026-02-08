const express = require('express');
const cors = require('cors');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());

// TTP API Base URL
const TTP_API = 'https://ttp.cbp.dhs.gov/schedulerapi';

// GET /api/locations
// Fetches locations from TTP API and wraps them for the frontend
app.get('/api/locations', async (req, res) => {
    try {
        console.log('Fetching locations from TTP...');
        const response = await fetch(`${TTP_API}/locations/?temporary=false&inviteOnly=false&operational=true&serviceName=Global%20Entry`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'en-US,en;q=0.9',
                'Referer': 'https://ttp.cbp.dhs.gov/',
                'Origin': 'https://ttp.cbp.dhs.gov'
            }
        });
        if (!response.ok) {
            throw new Error(`TTP API Error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        const locations = (data || []).map((loc) => ({
            id: loc.id,
            name: loc.name,
            shortName: loc.shortName,
            tzData: loc.tzData,
        }));
        locations.sort((a, b) => a.name.localeCompare(b.name));
        // Frontend expects { locations: [...] }
        res.json({ locations });
    } catch (error) {
        console.error('Error in /api/locations:', error);
        res.status(500).json({ error: 'Failed to fetch locations', details: error.message });
    }
});

// GET /api/slots
// Fetches slots for a specific location
app.get('/api/slots', async (req, res) => {
    const { locationId, startDate, endDate } = req.query;

    if (!locationId || !startDate || !endDate) {
        return res.status(400).json({ error: 'Missing locationId, startDate, or endDate' });
    }

    try {
        console.log(`Fetching slots for location ${locationId}...`);
        // Match extension endpoint + payload shape
        const url = `${TTP_API}/locations/${locationId}/slots?startTimestamp=${startDate}T00:00:00&endTimestamp=${endDate}T00:00:00`;
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'en-US,en;q=0.9',
                'Referer': 'https://ttp.cbp.dhs.gov/',
                'Origin': 'https://ttp.cbp.dhs.gov'
            }
        });
        if (!response.ok) {
            throw new Error(`TTP API Error: ${response.statusText}`);
        }
        const data = await response.json();
        const slots = (data || []).filter((slot) => slot.active > 0);
        res.json({ slots });
    } catch (error) {
        console.error('Error in /api/slots:', error);
        res.status(500).json({ error: 'Failed to fetch slots', details: error.message });
    }
});

// POST /api/notify-extension
// Mock endpoint for notifications
app.post('/api/notify-extension', (req, res) => {
    const { type, contact } = req.body;
    console.log(`Notification request: ${type} to ${contact}`);
    // In a real app, this would send an SMS or Email
    res.json({ success: true, message: `Mock notification sent to ${contact}` });
});

app.listen(PORT, () => {
    console.log(`Global Entry API Server running on port ${PORT}`);
});
