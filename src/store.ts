<<<<<<< ours
import { AppState, GroceryItem, Provider, OrderSession, Category } from './types';

const STORAGE_KEY = 'barcode-v1';

export const defaultProviders: Provider[] = [
  {
    id: 'p1',
    name: 'Abel & Cole',
    color: '#4a7c59',
    deliveryDays: [3], // Wednesday
    orderCutoffDays: 2,
    notes: 'Organic boxes, cut-off Monday',
  },
  {
    id: 'p2',
    name: 'Ocado',
    color: '#7c6a3a',
    deliveryDays: [1, 4], // Mon, Thu
    orderCutoffDays: 1,
    notes: 'Same-day slots available',
  },
  {
    id: 'p3',
    name: 'Local Farm Shop',
    color: '#7c4a3a',
    deliveryDays: [6], // Saturday
    orderCutoffDays: 3,
    notes: 'Collect or deliver Saturdays',
  },
];

export const sampleItems: GroceryItem[] = [
  {
    id: 'i1',
    name: 'Kale',
    category: 'vegetables',
    providerId: 'p1',
    quantity: '2 bunches',
    isOrganic: true,
    priority: 'essential',
    valueRating: 2,
    priceEstimate: 1.8,
    addedAt: new Date().toISOString(),
    ordered: false,
    recurring: true,
  },
  {
    id: 'i2',
    name: 'Free-range eggs',
    category: 'dairy-eggs',
    providerId: 'p1',
    quantity: '12 pack',
    isOrganic: true,
    priority: 'essential',
    valueRating: 2,
    priceEstimate: 4.2,
    addedAt: new Date().toISOString(),
    ordered: false,
    recurring: true,
  },
  {
    id: 'i3',
    name: 'Sourdough loaf',
    category: 'bread-bakery',
    providerId: 'p3',
    quantity: '1 loaf',
    isOrganic: false,
    priority: 'essential',
    valueRating: 1,
    priceEstimate: 5.5,
    addedAt: new Date().toISOString(),
    ordered: false,
    recurring: true,
  },
];

const defaultState: AppState = {
  providers: defaultProviders,
  items: sampleItems,
=======
import { AppState, Provider, Category } from './types';

const STORAGE_KEY = 'barcode-v1';

const defaultState: AppState = {
  providers: [],
  items: [],
>>>>>>> theirs
  sessions: [],
  activeView: 'list',
  activeProviderId: null,
};

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    return { ...defaultState, ...JSON.parse(raw) };
  } catch {
    return defaultState;
  }
}

export function saveState(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

<<<<<<< ours
=======
/**
 * Fetch a URL via Jina AI reader (r.jina.ai), which converts any page to
 * clean readable text — no CORS issues, no API key required.
 */
export async function scrapeUrl(url: string): Promise<string> {
  const jinaUrl = `https://r.jina.ai/${url}`;
  const res = await fetch(jinaUrl, {
    headers: { Accept: 'text/plain' },
  });
  if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
  const text = await res.text();
  // Trim to a sensible max to avoid oversized localStorage
  return text.slice(0, 120_000);
}

export interface PriceSuggestion {
  price: number;
  context: string; // snippet showing where the price was found
}

/**
 * Given a product name and a block of scraped text, return the best price match.
 * Looks for lines near the product name containing a price pattern (£/$/€).
 */
export function lookupPrice(itemName: string, scrapedText: string): PriceSuggestion | null {
  if (!itemName.trim() || !scrapedText) return null;

  const words = itemName.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  if (!words.length) return null;

  const lines = scrapedText.split('\n');
  const priceRe = /[£$€](\d+\.?\d{0,2})/g;

  let best: { score: number; price: number; context: string } | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    const score = words.filter(w => line.includes(w)).length;
    if (score === 0) continue;

    // Search in a window of ±3 lines for a price
    for (let j = Math.max(0, i - 3); j <= Math.min(lines.length - 1, i + 3); j++) {
      const nearby = lines[j];
      priceRe.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = priceRe.exec(nearby)) !== null) {
        const price = parseFloat(m[1]);
        if (price <= 0 || price > 500) continue;
        if (!best || score > best.score || (score === best.score && j === i)) {
          best = { score, price, context: lines[i].trim().slice(0, 80) };
        }
      }
    }
  }

  return best ? { price: best.price, context: best.context } : null;
}

>>>>>>> theirs
export const categoryLabels: Record<string, string> = {
  vegetables: 'Vegetables',
  fruits: 'Fruits',
  'dairy-eggs': 'Dairy & Eggs',
  'meat-fish': 'Meat & Fish',
  pantry: 'Pantry',
  'bread-bakery': 'Bread & Bakery',
  drinks: 'Drinks',
  household: 'Household',
  other: 'Other',
};

export const categoryEmoji: Record<string, string> = {
  vegetables: '🥬',
  fruits: '🍊',
  'dairy-eggs': '🥚',
  'meat-fish': '🐟',
  pantry: '🫙',
  'bread-bakery': '🍞',
  drinks: '🫖',
  household: '🧼',
  other: '📦',
};

export const allCategories: Category[] = [
  'vegetables',
  'fruits',
  'dairy-eggs',
  'meat-fish',
  'pantry',
  'bread-bakery',
  'drinks',
  'household',
  'other',
];

export function getNextDelivery(provider: Provider): Date | null {
  if (!provider.deliveryDays.length) return null;
  const today = new Date();
  const todayDow = today.getDay();
  // Find the nearest upcoming delivery day (including today)
  for (let i = 0; i <= 7; i++) {
    const dow = (todayDow + i) % 7;
    if (provider.deliveryDays.includes(dow)) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      return d;
    }
  }
  return null;
}

export function getOrderDeadline(provider: Provider): Date | null {
  const delivery = getNextDelivery(provider);
  if (!delivery) return null;
  const d = new Date(delivery);
  d.setDate(d.getDate() - provider.orderCutoffDays);
  return d;
}

export function formatDate(d: Date): string {
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}

export function isUrgent(provider: Provider): boolean {
  const deadline = getOrderDeadline(provider);
  if (!deadline) return false;
  const today = new Date();
  const diff = (deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
  return diff <= 1;
}
