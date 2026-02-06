export interface Location {
    id: number;
    name: string;
    shortName: string;
    tzData: string;
}

export interface Slot {
    active: number;
    duration: number;
    remote: boolean;
    timestamp: string; // ISO string
}

export interface SlotResponse {
    locationId: string;
    startDate: string;
    endDate: string;
    total: number;
    slots: Slot[];
}
