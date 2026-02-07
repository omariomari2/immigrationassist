export interface UserProfile {
    name: string;
    location?: string;
    visaType: string; // e.g., "H-1B", "F-1", "O-1"
}

export interface NewsItem {
    title: string;
    url: string;
    priority: "HIGH" | "MEDIUM" | "LOW";
    locationTags?: string[]; // e.g., ["NY", "CA", "New York"]
}
