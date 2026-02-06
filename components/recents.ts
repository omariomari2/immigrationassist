export interface RecentItem {
  id: string;
  title: string;
  description: string;
  address?: string;
  city?: string;
  state?: string;
  phone?: string;
  website?: string;
  rating?: number;
  coordinates?: [number, number];
  locationQuery?: string;
  source?: string;
  timestamp: string;
}

const STORAGE_KEY = 'quantro_recent_actions';
export const RECENTS_EVENT = 'quantro_recents_updated';
export const MAX_RECENTS = 5;

const createId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const getRecents = (): RecentItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Failed to parse recent actions', error);
    return [];
  }
};

export const saveRecents = (items: RecentItem[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_RECENTS)));
  window.dispatchEvent(new CustomEvent(RECENTS_EVENT));
};

export const logRecent = (
  item: Omit<RecentItem, 'id' | 'timestamp'> & { id?: string; timestamp?: string }
) => {
  if (typeof window === 'undefined') return;
  const existing = getRecents();
  const normalized: RecentItem = {
    ...item,
    id: item.id || createId(),
    timestamp: item.timestamp || new Date().toISOString()
  };
  const dedupeKey = `${normalized.title}|${normalized.description}`;
  const pruned = existing.filter(
    (recent) => `${recent.title}|${recent.description}` !== dedupeKey
  );
  saveRecents([normalized, ...pruned].slice(0, MAX_RECENTS));
};
