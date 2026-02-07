import { Location, SlotResponse } from './types';

const API_BASE = 'http://localhost:4000/api';

export async function fetchLocations(): Promise<Location[]> {
    try {
        const response = await fetch(`${API_BASE}/locations`);
        if (!response.ok) {
            throw new Error('Failed to fetch locations');
        }
        const data = await response.json();
        return data.locations || [];
    } catch (error) {
        console.error('Error fetching locations:', error);
        return [];
    }
}

export async function fetchSlots(locationId: string, startDate: string, endDate: string): Promise<SlotResponse | null> {
    const params = new URLSearchParams({
        locationId,
        startDate,
        endDate,
    });

    try {
        const response = await fetch(`${API_BASE}/slots?${params.toString()}`);
        if (!response.ok) {
            throw new Error('Failed to fetch slots');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching slots:', error);
        return null;
    }
}

export async function sendNotification(
    type: 'email' | 'sms',
    contact: string,
    userId?: string
): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
        const response = await fetch(`${API_BASE}/notify-extension`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ type, contact, userId }),
        });

        if (!response.ok) {
            throw new Error('Failed to send notification');
        }

        return await response.json();
    } catch (error) {
        console.error('Error sending notification:', error);
        return { success: false, error: 'Failed to send notification' };
    }
}
