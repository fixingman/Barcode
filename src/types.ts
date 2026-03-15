export type Priority = 'essential' | 'nice-to-have' | 'splurge';

export type ValueRating = 1 | 2 | 3; // 1 = splurge worth it, 2 = fair, 3 = bargain

export interface Provider {
  id: string;
  name: string;
  color: string; // tailwind-like accent
  deliveryDays: number[]; // 0=Sun, 1=Mon ... 6=Sat
  orderCutoffDays: number; // days before delivery to place order
  url?: string;
  notes?: string;
  // cached scraped content from the provider's website
  scrapedText?: string;
  scrapedAt?: string; // ISO date of last fetch
}

export interface GroceryItem {
  id: string;
  name: string;
  category: Category;
  providerId: string;
  quantity: string; // e.g. "2x 500g", "1 bunch"
  isOrganic: boolean;
  priority: Priority;
  valueRating: ValueRating;
  priceEstimate?: number; // per unit
  notes?: string;
  addedAt: string; // ISO date
  ordered: boolean;
  orderedAt?: string; // ISO date
  recurring: boolean; // always reorder
}

export interface Product {
  id: string; // e.g. "prod_kale_123"
  name: string; // e.g. "Kale"
  category: Category;
  notes?: string; // e.g. "Preferably organic"
  createdAt: string; // ISO date
}

export interface ProductVariant {
  id: string; // e.g. "var_kale_organic_tesco"
  productId: string; // Reference to Product
  providerId: string; // Which provider
  isOrganic: boolean; // Variant: organic vs conventional
  priceEstimate?: number; // Latest scraped price
  priceUpdatedAt?: string; // ISO date of last price lookup
  notes?: string; // e.g. "500g bunch"
}

export type Category =
  | 'vegetables'
  | 'fruits'
  | 'dairy-eggs'
  | 'meat-fish'
  | 'pantry'
  | 'bread-bakery'
  | 'drinks'
  | 'household'
  | 'other';

export interface OrderSession {
  id: string;
  createdAt: string;
  providerId: string;
  itemIds: string[];
  status: 'draft' | 'placed' | 'delivered';
  notes?: string;
}

export type CurrencyCode = 'GBP' | 'USD' | 'EUR' | 'AUD' | 'CAD' | 'NZD' | 'SEK' | 'NOK' | 'DKK' | 'CHF';

export interface AppState {
  providers: Provider[];
  items: GroceryItem[];
  products: Product[];
  productVariants: ProductVariant[];
  sessions: OrderSession[];
  activeView: View;
  activeProviderId: string | null;
  currency: CurrencyCode;
  country: string; // ISO 3166-1 alpha-2 code (e.g., 'GB', 'US', 'SE')
  locale: 'en' | 'sv' | 'no' | 'da'; // UI language
}

export type View = 'list' | 'providers' | 'products' | 'history';
