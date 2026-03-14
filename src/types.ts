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

export interface AppState {
  providers: Provider[];
  items: GroceryItem[];
  sessions: OrderSession[];
  activeView: View;
  activeProviderId: string | null;
}

export type View = 'inbox' | 'list' | 'providers' | 'history';
