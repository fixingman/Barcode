import { AppState, Provider, Category, Product, ProductVariant } from './types';

const STORAGE_KEY = 'barcode-v1';

// Extended currency type
export type CurrencyCode = 'GBP' | 'USD' | 'EUR' | 'AUD' | 'CAD' | 'NZD' | 'SEK' | 'NOK' | 'DKK' | 'CHF';

// Map country codes to currencies
const countryToCurrency: Record<string, CurrencyCode> = {
  // Anglophone
  GB: 'GBP', US: 'USD', CA: 'CAD', AU: 'AUD', NZ: 'NZD',
  // Euro
  DE: 'EUR', FR: 'EUR', IT: 'EUR', ES: 'EUR', BE: 'EUR', NL: 'EUR', AT: 'EUR',
  IE: 'EUR', FI: 'EUR', GR: 'EUR', PT: 'EUR', LU: 'EUR', MT: 'EUR', CY: 'EUR',
  // Scandinavia
  SE: 'SEK', NO: 'NOK', DK: 'DKK',
  // Switzerland
  CH: 'CHF',
};

export const currencySymbols: Record<CurrencyCode, string> = {
  GBP: '£',
  USD: '$',
  EUR: '€',
  AUD: 'A$',
  CAD: 'C$',
  NZD: 'NZ$',
  SEK: 'kr',
  NOK: 'kr',
  DKK: 'kr',
  CHF: 'CHF',
};

// Locale codes for Intl formatting
export const currencyLocales: Record<CurrencyCode, string> = {
  GBP: 'en-GB',
  USD: 'en-US',
  EUR: 'de-DE',
  AUD: 'en-AU',
  CAD: 'en-CA',
  NZD: 'en-NZ',
  SEK: 'sv-SE',
  NOK: 'nb-NO',
  DKK: 'da-DK',
  CHF: 'de-CH',
};

export const countryNames: Record<string, string> = {
  // Anglophone
  GB: 'United Kingdom', US: 'United States', CA: 'Canada', AU: 'Australia', NZ: 'New Zealand',
  // Euro
  DE: 'Germany', FR: 'France', IT: 'Italy', ES: 'Spain', BE: 'Belgium', NL: 'Netherlands',
  AT: 'Austria', IE: 'Ireland', FI: 'Finland', GR: 'Greece', PT: 'Portugal', LU: 'Luxembourg',
  MT: 'Malta', CY: 'Cyprus',
  // Scandinavia
  SE: 'Sweden', NO: 'Norway', DK: 'Denmark',
  // Switzerland
  CH: 'Switzerland',
};

async function detectCountry(): Promise<string> {
  try {
    // Use ipapi.co (free, no key needed, returns JSON with country_code)
    const res = await fetch('https://ipapi.co/json/', { mode: 'cors' });
    if (!res.ok) throw new Error('IP lookup failed');
    const data = await res.json();
    return (data.country_code || 'GB').toUpperCase();
  } catch {
    // Fallback to GB (UK)
    return 'GB';
  }
}

function getDefaultState(): AppState {
  const country = localStorage.getItem('barcode-country') || 'GB';
  const currency = countryToCurrency[country] || 'GBP';
  const locale = getLocaleFromCountry(country);
  return {
    providers: [],
    items: [],
    products: [],
    productVariants: [],
    sessions: [],
    activeView: 'list',
    activeProviderId: null,
    currency,
    country,
    locale,
  };
}

const defaultState: AppState = getDefaultState();

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const state = JSON.parse(raw);
    return { ...defaultState, ...state };
  } catch {
    return defaultState;
  }
}

export async function detectAndSetCountry(): Promise<string> {
  const country = await detectCountry();
  localStorage.setItem('barcode-country', country);
  return country;
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

  // Keywords for categorization (English + Swedish + Norwegian + Danish)
  const categories = {
    vegetables: [
      // English
      'broccoli', 'kale', 'spinach', 'carrot', 'potato', 'onion', 'lettuce', 'tomato', 'cucumber', 'pepper', 'cabbage', 'celery', 'bean', 'pea',
      // Swedish
      'broccoli', 'grönkål', 'spenat', 'morot', 'potatis', 'lök', 'sallad', 'tomat', 'gurka', 'paprika', 'kål', 'selleri', 'böna', 'ärta', 'grönsaker',
      // Norwegian
      'brokkoli', 'grønnkål', 'spinat', 'gulrot', 'potet', 'løk', 'salat', 'tomat', 'agurk', 'paprika', 'kål', 'selleri', 'bønne', 'erter', 'grønnsaker',
      // Danish
      'broccoli', 'grønkål', 'spinat', 'gulerod', 'kartoffel', 'løg', 'salat', 'tomat', 'agurk', 'peberfrugt', 'kål', 'selleri', 'bønne', 'ært', 'grøntsager',
    ],
    fruits: [
      // English
      'apple', 'banana', 'orange', 'grape', 'strawberry', 'blueberry', 'melon', 'mango', 'pineapple', 'lemon', 'lime', 'berry',
      // Swedish
      'äpple', 'banan', 'apelsin', 'druvor', 'jordgubbar', 'blåbär', 'melon', 'mango', 'ananas', 'citron', 'lime', 'frukt',
      // Norwegian
      'eple', 'banan', 'appelsin', 'druer', 'jordbær', 'blåbær', 'melon', 'mango', 'ananas', 'sitron', 'lime', 'frukt',
      // Danish
      'æble', 'banan', 'appelsin', 'druer', 'jordbær', 'blåbær', 'melon', 'mango', 'ananas', 'citron', 'lime', 'frugt',
    ],
    'dairy-eggs': [
      // English
      'milk', 'cheese', 'yogurt', 'butter', 'cream', 'eggs', 'egg', 'dairy',
      // Swedish
      'mjölk', 'ost', 'yoghurt', 'smör', 'grädde', 'ägg', 'mejeriprodukter',
      // Norwegian
      'melk', 'ost', 'yogurt', 'smør', 'fløte', 'egg', 'melkeprodukt',
      // Danish
      'mælk', 'ost', 'yoghurt', 'smør', 'fløde', 'æg', 'mejeriprodukter',
    ],
    'meat-fish': [
      // English
      'chicken', 'beef', 'pork', 'lamb', 'fish', 'salmon', 'tuna', 'steak', 'meat',
      // Swedish
      'kyckling', 'nötkött', 'fläsk', 'lamm', 'fisk', 'lax', 'tonfisk', 'biff', 'kött',
      // Norwegian
      'kylling', 'storfekjøtt', 'svinekjøtt', 'lam', 'fisk', 'laks', 'tun', 'biff', 'kjøtt',
      // Danish
      'kylling', 'oksekød', 'svinekød', 'lam', 'fisk', 'laks', 'tun', 'bøf', 'kød',
    ],
    'bread-bakery': [
      // English
      'bread', 'loaf', 'bagel', 'roll', 'croissant', 'bun', 'cake', 'pastry',
      // Swedish
      'bröd', 'limpa', 'bagel', 'fralla', 'croissant', 'bullar', 'tårta', 'bakverk',
      // Norwegian
      'brød', 'loff', 'bagel', 'bolle', 'croissant', 'bløtkake', 'kake', 'bakevarer',
      // Danish
      'brød', 'limpet', 'bagel', 'rundstykker', 'croissant', 'boller', 'kage', 'bagevarer',
    ],
    pantry: [
      // English
      'rice', 'pasta', 'oil', 'flour', 'sugar', 'salt', 'spice', 'sauce', 'can', 'jar', 'cereal', 'nuts', 'coffee', 'tea',
      // Swedish
      'ris', 'pasta', 'olja', 'mjöl', 'socker', 'salt', 'krydda', 'sås', 'burk', 'kryddor', 'kaffe', 'te', 'flingor',
      // Norwegian
      'ris', 'pasta', 'olje', 'mel', 'sukker', 'salt', 'krydder', 'saus', 'boks', 'krydderi', 'kaffe', 'te', 'frokostblanding',
      // Danish
      'ris', 'pasta', 'olie', 'mel', 'sukker', 'salt', 'krydder', 'sovs', 'dåse', 'krydderi', 'kaffe', 'te', 'morgenmad',
    ],
    drinks: [
      // English
      'juice', 'water', 'soda', 'cola', 'milk', 'coffee', 'tea', 'wine', 'beer', 'drink',
      // Swedish
      'juice', 'vatten', 'läsk', 'cola', 'mjölk', 'kaffe', 'te', 'vin', 'öl', 'dryck',
      // Norwegian
      'juice', 'vann', 'brus', 'cola', 'melk', 'kaffe', 'te', 'vin', 'øl', 'drikk',
      // Danish
      'saft', 'vand', 'lemonade', 'cola', 'mælk', 'kaffe', 'te', 'vin', 'øl', 'drik',
    ],
  };

  const organicKeywords = [
    // English
    'organic', 'bio', 'natural', 'free-range', 'grass-fed', 'non-gmo',
    // Swedish
    'ekologisk', 'biologisk', 'naturlig', 'frilandskyckling', 'gräsfodrad', 'utan-gmo',
    // Norwegian
    'økologisk', 'biologisk', 'naturlig', 'frilands', 'gressfôret', 'gmo-fritt',
    // Danish
    'økologisk', 'biologisk', 'naturlig', 'friland', 'græsfodret', 'gmo-frit',
  ];

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

// Localization system: English, Swedish, Norwegian, Danish, German, French
export const i18n = {
  en: {
    categories: {
      vegetables: 'Vegetables',
      fruits: 'Fruits',
      'dairy-eggs': 'Dairy & Eggs',
      'meat-fish': 'Meat & Fish',
      pantry: 'Pantry',
      'bread-bakery': 'Bread & Bakery',
      drinks: 'Drinks',
      household: 'Household',
      other: 'Other',
    },
    ui: {
      addItem: 'Add item',
      scan: 'Scan',
      addProvider: 'Add provider',
      list: 'List',
      providers: 'Providers',
      history: 'History',
      pending: 'pending',
      essential: 'Essential',
      niceToHave: 'Nice to have',
      splurge: 'Splurge',
      organic: '🌱 Organic',
      conventional: 'Conventional',
      weekly: '🔄 Weekly staple',
      oneTime: 'One-time',
      ordered: 'Ordered',
      notOrdered: 'Not ordered',
      items: 'Items',
      organicCount: 'Organic',
      estTotal: 'Est. total',
      allProviders: 'All providers',
      orderDeadline: 'Order deadline approaching',
      emptyList: 'Your list is empty. Add items to start planning your orders.',
      addFirstItem: 'Add first item',
      showOrdered: 'Show',
      hideOrdered: 'Hide ordered',
      orderedItems: 'ordered items',
      resetWeekly: '🔄 Reset weekly staples',
      emptyProviders: 'No providers yet. Add your grocery stores.',
      addProvider2: 'Add provider',
      emptyHistory: 'Nothing ordered yet. Complete some items to see history here.',
      totalOrdered: 'Ordered',
      spent: 'Spent',
    },
  },
  sv: {
    categories: {
      vegetables: 'Grönsaker',
      fruits: 'Frukter',
      'dairy-eggs': 'Mejeri & Ägg',
      'meat-fish': 'Kött & Fisk',
      pantry: 'Skafferi',
      'bread-bakery': 'Bröd & Bakverk',
      drinks: 'Drycker',
      household: 'Hushåll',
      other: 'Övrigt',
    },
    ui: {
      addItem: 'Lägg till vara',
      scan: 'Skanna',
      addProvider: 'Lägg till butik',
      list: 'Lista',
      providers: 'Butiker',
      history: 'Historik',
      pending: 'väntar',
      essential: 'Väsentlig',
      niceToHave: 'Snäll att ha',
      splurge: 'Lyxvara',
      organic: '🌱 Ekologisk',
      conventional: 'Konventionell',
      weekly: '🔄 Veckovara',
      oneTime: 'Engångsvara',
      ordered: 'Beställd',
      notOrdered: 'Inte beställd',
      items: 'Varor',
      organicCount: 'Ekologisk',
      estTotal: 'Upps. totalt',
      allProviders: 'Alla butiker',
      orderDeadline: 'Beställningsfrist närmar sig',
      emptyList: 'Din lista är tom. Lägg till varor för att börja planera dina beställningar.',
      addFirstItem: 'Lägg till första vara',
      showOrdered: 'Visa',
      hideOrdered: 'Dölj beställda',
      orderedItems: 'beställda varor',
      resetWeekly: '🔄 Återställ veckovara',
      emptyProviders: 'Inga butiker än. Lägg till dina livsmedelsbutiker.',
      addProvider2: 'Lägg till butik',
      emptyHistory: 'Ingenting beställt än. Slutför några varor för att se historik här.',
      totalOrdered: 'Beställd',
      spent: 'Spenderad',
    },
  },
  no: {
    categories: {
      vegetables: 'Grønnsaker',
      fruits: 'Frukt',
      'dairy-eggs': 'Meieri & Egg',
      'meat-fish': 'Kjøtt & Fisk',
      pantry: 'Pantry',
      'bread-bakery': 'Brød & Bakeri',
      drinks: 'Drikker',
      household: 'Husholdning',
      other: 'Annet',
    },
    ui: {
      addItem: 'Legg til vare',
      scan: 'Skann',
      addProvider: 'Legg til butikk',
      list: 'Liste',
      providers: 'Butikker',
      history: 'Historie',
      pending: 'ventende',
      essential: 'Essensielt',
      niceToHave: 'Fint å ha',
      splurge: 'Luksus',
      organic: '🌱 Økologisk',
      conventional: 'Konvensjonelt',
      weekly: '🔄 Ukentlig vare',
      oneTime: 'Engangs',
      ordered: 'Bestilt',
      notOrdered: 'Ikke bestilt',
      items: 'Varer',
      organicCount: 'Økologisk',
      estTotal: 'Est. totalt',
      allProviders: 'Alle butikker',
      orderDeadline: 'Bestillingsfristen nærmer seg',
      emptyList: 'Listen din er tom. Legg til varer for å begynne å planlegge bestillingene dine.',
      addFirstItem: 'Legg til første vare',
      showOrdered: 'Vis',
      hideOrdered: 'Skjul bestilt',
      orderedItems: 'bestilte varer',
      resetWeekly: '🔄 Tilbakestill ukentlige varer',
      emptyProviders: 'Ingen butikker ennå. Legg til dagligvarebutikkene dine.',
      addProvider2: 'Legg til butikk',
      emptyHistory: 'Ingenting bestilt ennå. Fullfør noen varer for å se historikken her.',
      totalOrdered: 'Bestilt',
      spent: 'Brukt',
    },
  },
  da: {
    categories: {
      vegetables: 'Grøntsager',
      fruits: 'Frugt',
      'dairy-eggs': 'Mejeriprodukter & Æg',
      'meat-fish': 'Kød & Fisk',
      pantry: 'Skabent',
      'bread-bakery': 'Brød & Bageri',
      drinks: 'Drikkevarer',
      household: 'Husholdning',
      other: 'Øvrigt',
    },
    ui: {
      addItem: 'Tilføj vare',
      scan: 'Scan',
      addProvider: 'Tilføj butik',
      list: 'Liste',
      providers: 'Butikker',
      history: 'Historie',
      pending: 'afventende',
      essential: 'Væsentlig',
      niceToHave: 'Rart at have',
      splurge: 'Luksus',
      organic: '🌱 Økologisk',
      conventional: 'Konventionel',
      weekly: '🔄 Ugentlig vare',
      oneTime: 'Engangs',
      ordered: 'Bestilt',
      notOrdered: 'Ikke bestilt',
      items: 'Varer',
      organicCount: 'Økologisk',
      estTotal: 'Est. i alt',
      allProviders: 'Alle butikker',
      orderDeadline: 'Ordrefristen nærmer sig',
      emptyList: 'Din liste er tom. Tilføj varer for at begynde at planlægge dine ordrer.',
      addFirstItem: 'Tilføj første vare',
      showOrdered: 'Vis',
      hideOrdered: 'Skjul bestilt',
      orderedItems: 'bestilte varer',
      resetWeekly: '🔄 Nulstil ugentlige varer',
      emptyProviders: 'Ingen butikker endnu. Tilføj dine dagligvarebutikker.',
      addProvider2: 'Tilføj butik',
      emptyHistory: 'Intet bestilt endnu. Gennemfør nogle varer for at se historikken her.',
      totalOrdered: 'Bestilt',
      spent: 'Brugt',
    },
  },
} as const;

export type Locale = keyof typeof i18n;

export function getLocaleFromCountry(country: string): Locale {
  if (country === 'SE') return 'sv';
  if (country === 'NO') return 'no';
  if (country === 'DK') return 'da';
  return 'en'; // Default to English
}

export function getCategoryLabels(locale: Locale): Record<string, string> {
  return i18n[locale]?.categories || i18n.en.categories;
}

export function getUILabel(locale: Locale, key: keyof typeof i18n.en.ui): string {
  return i18n[locale]?.ui[key] || i18n.en.ui[key];
}

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

// Format price according to locale and currency
export function formatPrice(amount: number, currency: CurrencyCode): string {
  const locale = currencyLocales[currency];
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

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
  // Find the nearest upcoming delivery day (starting from tomorrow, never today)
  for (let i = 1; i <= 7; i++) {
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

// ── Product Helpers ────────────────────────────────────────────────────────

/**
 * Get all variants of a product
 */
export function getProductVariants(state: AppState, productId: string): ProductVariant[] {
  return state.productVariants.filter(v => v.productId === productId);
}

/**
 * Get product by ID
 */
export function getProduct(state: AppState, productId: string): Product | undefined {
  return state.products.find(p => p.id === productId);
}

/**
 * Get the cheapest variant of a product (across all providers and organic status)
 */
export function getCheapestVariant(state: AppState, productId: string): ProductVariant | null {
  const variants = getProductVariants(state, productId);
  if (!variants.length) return null;

  return variants.reduce((best, current) => {
    const bestPrice = best.priceEstimate ?? Infinity;
    const currentPrice = current.priceEstimate ?? Infinity;
    return currentPrice < bestPrice ? current : best;
  });
}

/**
 * Get cheapest variant for a specific organic preference
 */
export function getCheapestVariantForType(
  state: AppState,
  productId: string,
  preferOrganic: boolean
): ProductVariant | null {
  const variants = getProductVariants(state, productId);
  const filtered = preferOrganic
    ? variants.filter(v => v.isOrganic)
    : variants;

  if (!filtered.length) return null;

  return filtered.reduce((best, current) => {
    const bestPrice = best.priceEstimate ?? Infinity;
    const currentPrice = current.priceEstimate ?? Infinity;
    return currentPrice < bestPrice ? current : best;
  });
}

/**
 * Get all variants grouped by provider and organic status
 * Returns: { providerId: { organic: price, conventional: price } }
 */
export function getPricesByProduct(
  state: AppState,
  productId: string
): Record<string, { organic?: number; conventional?: number }> {
  const variants = getProductVariants(state, productId);
  const result: Record<string, { organic?: number; conventional?: number }> = {};

  for (const variant of variants) {
    if (!result[variant.providerId]) {
      result[variant.providerId] = {};
    }
    const key = variant.isOrganic ? 'organic' : 'conventional';
    result[variant.providerId][key] = variant.priceEstimate;
  }

  return result;
}
