import { AppState, Provider, Category } from './types';

const STORAGE_KEY = 'barcode-v1';

const defaultState: AppState = {
  providers: [],
  items: [],
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

export interface ParsedGroceryItem {
  name: string;
  quantity: string;
  priceEstimate?: number;
  category?: Category;
  isOrganic?: boolean;
}

/**
 * Parse OCR text from a receipt/grocery image and extract item lines.
 * Returns a list of potential grocery items found in the text.
 */
export function parseReceiptText(ocrText: string): ParsedGroceryItem[] {
  if (!ocrText.trim()) return [];

  const items: ParsedGroceryItem[] = [];
  const lines = ocrText.split('\n').filter(l => l.trim());
  const pricePattern = /[£$€](\d+\.?\d{0,2})|(\d+\.?\d{0,2})\s*(?:GBP|USD|EUR|£|$|€)/i;

  // Keywords for categorization
  const categories = {
    vegetables: ['broccoli', 'kale', 'spinach', 'carrot', 'potato', 'onion', 'lettuce', 'tomato', 'cucumber', 'pepper', 'cabbage', 'celery', 'bean', 'pea'],
    fruits: ['apple', 'banana', 'orange', 'grape', 'strawberry', 'blueberry', 'melon', 'mango', 'pineapple', 'lemon', 'lime', 'berry'],
    'dairy-eggs': ['milk', 'cheese', 'yogurt', 'butter', 'cream', 'eggs', 'egg', 'dairy'],
    'meat-fish': ['chicken', 'beef', 'pork', 'lamb', 'fish', 'salmon', 'tuna', 'steak', 'meat'],
    'bread-bakery': ['bread', 'loaf', 'bagel', 'roll', 'croissant', 'bun', 'cake', 'pastry'],
    pantry: ['rice', 'pasta', 'oil', 'flour', 'sugar', 'salt', 'spice', 'sauce', 'can', 'jar', 'cereal', 'nuts', 'coffee', 'tea'],
    drinks: ['juice', 'water', 'soda', 'cola', 'milk', 'coffee', 'tea', 'wine', 'beer', 'drink'],
  };

  const organicKeywords = ['organic', 'bio', 'natural', 'free-range', 'grass-fed', 'non-gmo'];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length < 3) continue;

    // Skip total/subtotal lines
    if (/total|subtotal|tax|discount|change|payment/i.test(trimmed)) continue;

    // Extract price if present
    let priceEstimate: number | undefined;
    const priceMatch = trimmed.match(pricePattern);
    if (priceMatch) {
      const priceStr = priceMatch[1] || priceMatch[2];
      priceEstimate = parseFloat(priceStr);
      if (priceEstimate <= 0 || priceEstimate > 500) priceEstimate = undefined;
    }

    // Extract item name (remove price and quantity from the line)
    let itemName = trimmed
      .replace(pricePattern, '')
      .replace(/\b\d+\s*(?:x|×)\s*\d+g\b|\b\d+\s*(?:pack|box|bunch|bunch|bottle|can|jar)\b/gi, '')
      .trim();

    if (itemName.length < 2) continue;

    // Detect quantity (e.g., "2x 500g", "1 bunch", "6 pack")
    const qtyMatch = trimmed.match(/\b(\d+)\s*(?:x|×)?\s*(\d+\s*(?:g|kg|ml|l|oz|lb|pack|box|bunch|bottle|can|jar))\b|(\d+)\s*(pack|box|bunch|bottle|can|jar)\b/i);
    const quantity = qtyMatch ? qtyMatch[0] : '1';

    // Detect category
    let category: Category | undefined;
    const lowerItem = itemName.toLowerCase();
    for (const [cat, keywords] of Object.entries(categories)) {
      if (keywords.some(kw => lowerItem.includes(kw))) {
        category = cat as Category;
        break;
      }
    }

    // Detect organic flag
    const isOrganic = organicKeywords.some(kw => lowerItem.includes(kw));

    items.push({
      name: itemName,
      quantity,
      priceEstimate,
      category,
      isOrganic,
    });
  }

  return items;
}

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
