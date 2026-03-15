# Barcode Features & Architecture

## 📋 Features Overview

### List Management
- **Add Items**: Add grocery items with category, quantity, price, organic status, priority
- **Categories**: 10+ categories (vegetables, fruits, dairy, meat, pantry, etc.)
- **Organize**: View items by category or provider
- **Mark Ordered**: Track which items you've ordered
- **Recurring Items**: Mark items as weekly for easy reset
- **Price Tracking**: Store estimated prices for comparison

### Provider Management
- **Add Providers**: Add grocery stores/markets with URLs
- **Delivery Schedule**: Configure which days each provider delivers
- **Order Deadlines**: Set cutoff times (e.g., order by 5 PM for next-day delivery)
- **Web Scraping**: Auto-fetch provider websites for real-time prices via Jina AI
- **Delete Providers**: Remove providers you don't use
- **Price Lookup**: Auto-find prices from scraped content

### Product Catalog (New!)
- **Create Products**: Build a library of recurring items
- **Price Comparison**: See prices across all providers for each product
- **Organic Status**: Track organic vs conventional variants
- **Smart Add**: Auto-add item at cheapest provider
- **Bulk Update**: Refresh prices from all providers
- **Best Deal**: Visual highlight of cheapest option

### Receipt Scanning
- **Upload Images**: Photograph receipts or grocery ads
- **OCR Recognition**: Auto-extract items using Tesseract.js
- **Multi-Language**: Recognize items in English, Swedish, Norwegian, Danish
- **Auto-Categorize**: Sort items into categories automatically
- **Organic Detection**: Identify organic products
- **Price Extraction**: Pull prices from receipt text
- **Bulk Import**: Add multiple items at once

### Localization
- **4 Languages**: English, Swedish (Svenska), Norwegian (Norsk), Danish (Dansk)
- **23 Countries**: Auto-detect via IP geolocation
- **10 Currencies**: GBP, USD, EUR, SEK, NOK, DKK, CHF, etc.
- **Locale Formatting**: Proper number formatting (e.g., "123,50 kr" for Swedish)
- **Category Labels**: Localized category names
- **UI Labels**: All text translated

### Offline Support
- **Service Worker**: Caches all assets for offline access
- **Cache Strategies**:
  - Cache-first for HTML, CSS, JS (always use local copy if available)
  - Stale-while-revalidate for images (use cache but update in background)
- **Full Functionality**: App works completely offline
- **Data Persistence**: All data in localStorage (never lost)
- **Sync**: Auto-updates when reconnected

### Auto-Update
- **Hourly Check**: Service worker checks for updates every hour
- **Background Download**: New version downloads without prompting
- **Next Launch**: User gets new version on app restart
- **No Downtime**: Users don't need to manually update
- **Notification**: Console message when update available (can add UI notification)

### Settings
- **Language**: Choose English, Swedish, Norwegian, or Danish
- **Country**: Select 23 countries (auto-sets currency)
- **Currency**: Choose from 10 currencies with proper formatting
- **Persistence**: Settings saved to localStorage
- **Auto-Detect**: Uses IP geolocation to suggest country/currency

---

## 🏗️ Architecture

### Technology Stack

```
Frontend Layer:
├─ React 18.2    (UI components)
├─ TypeScript 5  (Type safety)
└─ CSS Grid      (Layout)

Build & Dev:
├─ Vite 5        (Fast bundler)
├─ esbuild       (TypeScript compilation)
└─ Rollup        (Production bundling)

PWA & Offline:
├─ Service Worker (Caching & offline)
├─ Web Manifest   (App metadata)
└─ localStorage   (Data persistence)

Data & Utilities:
├─ Tesseract.js   (OCR - receipt scanning)
├─ Jina AI Reader (Web scraping - prices)
├─ Lucide Icons   (1000+ icon library)
└─ Intl API       (Localization)

Hosting:
├─ Vercel        (Recommended)
├─ GitHub Pages  (Alternative)
└─ Netlify       (Alternative)
```

### State Management

```
App Component (src/App.tsx)
├─ state: AppState (in memory + localStorage)
├─ handlers: CRUD operations
└─ views: List | Providers | Products | History
```

**AppState Structure:**
```typescript
{
  providers: Provider[]           // Grocery stores
  items: GroceryItem[]           // Grocery list
  products: Product[]            // Product catalog (NEW)
  productVariants: ProductVariant[] // Price variants (NEW)
  sessions: OrderSession[]       // Order history
  activeView: View               // Current tab
  activeProviderId: string | null
  currency: CurrencyCode
  country: string
  locale: Locale
}
```

### File Structure

```
src/
├─ types.ts              (All TypeScript interfaces)
├─ store.ts              (State helpers, i18n, utilities)
├─ index.css             (Design system - 800 lines)
├─ App.tsx               (Main component - 660 lines)
├─ main.tsx              (Entry point + PWA registration)
├─ service-worker.ts     (Offline & caching logic)
│
└─ components/
   ├─ AddItemSheet.tsx           (Add grocery item modal)
   ├─ AddProviderSheet.tsx       (Add provider modal)
   ├─ ItemRow.tsx                (Single item in list)
   ├─ ProviderCard.tsx           (Provider display)
   ├─ SettingsSheet.tsx          (Localization settings)
   ├─ UploadReceiptSheet.tsx     (Receipt OCR scanner)
   ├─ ProductsTab.tsx            (Product catalog view)
   ├─ ProductFormSheet.tsx       (Create product modal)
   └─ ProductDetailView.tsx      (Price comparison table)

public/
├─ index.html            (With PWA meta tags)
├─ manifest.json         (App metadata)
└─ icons/                (App icons - optional)
   ├─ icon-192x192.png
   ├─ icon-512x512.png
   ├─ icon-180x180.png
   └─ favicon-32x32.png

build config:
├─ vite.config.ts        (Vite + service worker config)
├─ tsconfig.json         (TypeScript strict mode)
└─ package.json          (Dependencies + scripts)
```

### Data Flow

```
User Action (e.g., add item)
       ↓
Component Handler (e.g., AddItemSheet)
       ↓
App Handler (addItem)
       ↓
State Update (mutate)
       ↓
localStorage Save (auto)
       ↓
Component Re-render
       ↓
Display Update
```

### PWA Architecture

```
Browser
├─ App HTML/CSS/JS
├─ React Components
│
├─ Service Worker (background)
│  ├─ Install: Cache essential files
│  ├─ Fetch: Intercept requests
│  │  ├─ HTML/CSS/JS: cache-first
│  │  └─ Images: stale-while-revalidate
│  └─ Activate: Clean old caches
│
└─ localStorage
   ├─ Providers
   ├─ Items
   ├─ Products
   ├─ Sessions
   └─ Settings
```

### Caching Strategy

**Cache-First (HTML, CSS, JS):**
1. Request comes in
2. Check cache → found? Return immediately
3. If not in cache → fetch from network
4. Store in cache
5. Return response

**Stale-While-Revalidate (Images):**
1. Request comes in
2. Return cached version immediately
3. In background, fetch fresh version
4. Update cache for next time
5. User sees latest on next visit

### Update Flow

```
Hour 1:
├─ Service Worker wakes up (hourly check)
├─ Checks for new service-worker.js
├─ If found, downloads new version
└─ Waits for user to close app

Hour 2+:
├─ User closes app (Cmd+Q or close window)
├─ Service Worker activates new version
├─ Next app open uses new version
└─ User sees latest features

User Experience:
├─ No "update available" dialog
├─ No manual update button
├─ Just "app is better" on next open
├─ Completely transparent
└─ Zero user friction
```

---

## 🎯 Component Responsibilities

### Pages/Views
- **App.tsx**: Main orchestration, state, routing
- **ProductsTab.tsx**: Grid view of all products
- **AddItemSheet.tsx**: Modal to add item to list
- **AddProviderSheet.tsx**: Modal to add provider

### Modals/Sheets
- **SettingsSheet.tsx**: Language, country, currency
- **UploadReceiptSheet.tsx**: Receipt OCR scanner
- **ProductFormSheet.tsx**: Create/edit product
- **ProductDetailView.tsx**: Price comparison table

### Cards/Rows
- **ItemRow.tsx**: Single grocery item row
- **ProviderCard.tsx**: Single provider card

---

## 🔄 Key Workflows

### Add Grocery Item
1. User clicks "Add Item" button
2. AddItemSheet modal opens
3. User fills: name, category, quantity, price, organic, priority
4. Clicks "Add"
5. Item stored in state & localStorage
6. List re-renders with new item
7. Service worker caches update

### Compare Product Prices
1. User navigates to Products tab
2. ProductsTab loads products from state
3. User clicks a product
4. ProductDetailView renders
5. Shows table: Provider | Conventional | Organic
6. User clicks "Add to List"
7. smartAddProduct() auto-picks cheapest
8. Creates GroceryItem at that provider
9. Back to List view

### Upload Receipt
1. User clicks "Upload Receipt" button
2. UploadReceiptSheet opens
3. User selects image file
4. Tesseract.js performs OCR (browser-side)
5. parseReceiptText() extracts items
6. Multi-language keywords identify categories
7. User sees checkboxes with extracted items
8. User selects which to add
9. Creates multiple GroceryItems
10. Back to List view

### Deploy & Update
1. Developer changes code
2. Runs `npm run release:minor`
3. Version bumps in package.json
4. App rebuilds with new version
5. Commits and pushes to GitHub
6. Vercel auto-deploys
7. Service worker detects change
8. Downloads new version in background
9. Next time user opens app → new version!

---

## 📊 Metrics

- **Bundle Size**: ~224 KB (gzipped: 70 KB)
- **Load Time**: < 2 seconds on 4G
- **Offline**: Full functionality without internet
- **Update Check**: Every hour (user doesn't notice)
- **Storage**: localStorage (no server)
- **Languages**: 4 (English, Swedish, Norwegian, Danish)
- **Countries**: 23
- **Currencies**: 10

---

## 🔐 Security Model

```
Data Location:
├─ All data: localStorage on user's device
├─ Never sent: To any server
├─ Encrypted?: No (device trust model)
└─ Accessible: Only to user's browser

Network Requests:
├─ Scraping: Jina API (free, legal)
├─ Geolocation: ipapi.co (privacy-friendly)
├─ Fonts: Google Fonts (standard)
└─ Libraries: NPM packages (open source)

Permissions:
├─ Camera: Only when user uploads receipt
├─ Storage: localStorage only
├─ Location: IP-based only (user country)
└─ Network: Read-only (no authentication)
```

---

## 🚀 Performance Optimizations

1. **Code Splitting**: Vite auto-splits code
2. **Tree Shaking**: Removes unused code
3. **CSS Variables**: Single definition per color
4. **Service Worker Caching**: Instant page loads
5. **Lazy Loading**: Images loaded on demand
6. **Minification**: All code minified for production
7. **Gzip Compression**: 70 KB total size

---

## 🎨 Design System

**Colors** (CSS Variables):
- `--moss`: #4a7c59 (primary)
- `--clay`: #a6713c (accent)
- `--wheat`: #f4e4c1 (light background)
- `--sage`: #b8c5a3 (secondary)
- `--ink`: #1a1410 (text)

**Typography**:
- Headings: DM Serif Display (elegant)
- Body: DM Sans (readable)
- Fallback: System fonts

**Texture**:
- SVG grain overlay
- Paper background
- Wabi-sabi aesthetic

---

## ✨ What Makes This Special

1. **Zero Backend**: Everything client-side
2. **Zero Costs**: Free hosting, free AI
3. **Zero Configuration**: Deploy and forget
4. **Works Offline**: Full functionality without internet
5. **Auto-Updates**: Users never manually update
6. **Accessible**: Works on Mac, iPad, iPhone
7. **Fast**: 70 KB gzipped
8. **Open**: No tracking, no analytics
9. **Sustainable**: Wabi-sabi design, minimal code
10. **User-Focused**: All data stays local

---

This is a modern web app that respects privacy, minimizes dependencies, and delivers a delightful user experience.

**Now deploy it!** 🚀
