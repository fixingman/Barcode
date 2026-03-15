import { useState, useEffect, useMemo } from 'react';
import { Plus, Settings } from 'lucide-react';
import { AppState, GroceryItem, Provider, View, Category, CurrencyCode, Product } from './types';
import {
  loadState, saveState, categoryEmoji, allCategories,
  isUrgent, scrapeUrl, detectAndSetCountry, currencySymbols,
  getCategoryLabels, getUILabel, formatPrice, getLocaleFromCountry, Locale, generateId,
  getProductVariants, getCheapestVariantForType, lookupPrice,
} from './store';
import AddItemSheet from './components/AddItemSheet';
import AddProviderSheet from './components/AddProviderSheet';
import UploadReceiptSheet from './components/UploadReceiptSheet';
import SettingsSheet from './components/SettingsSheet';
import ItemRow from './components/ItemRow';
import ProviderCard from './components/ProviderCard';
import ProductsTab from './components/ProductsTab';
import ProductFormSheet from './components/ProductFormSheet';
import ProductDetailView from './components/ProductDetailView';

export default function App() {
  const [state, setState] = useState<AppState>(loadState);
  const [showAddItem, setShowAddItem] = useState(false);
  const [showAddProvider, setShowAddProvider] = useState(false);
  const [showUploadReceipt, setShowUploadReceipt] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [prefillProviderId, setPrefillProviderId] = useState<string | undefined>();
  const [filterProvider, setFilterProvider] = useState<string>('all');
  const [showOrdered, setShowOrdered] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  // Auto-detect country on first load
  useEffect(() => {
    const stored = localStorage.getItem('barcode-country');
    if (!stored) {
      detectAndSetCountry().catch(() => {});
    }
  }, []);

  useEffect(() => { saveState(state); }, [state]);

  function mutate(updater: (s: AppState) => AppState) {
    setState(prev => updater(prev));
  }

  // ── Items view logic ──────────────────────────────────────────────
  const filteredItems = useMemo(() => {
    return state.items.filter(item => {
      if (!showOrdered && item.ordered) return false;
      if (filterProvider !== 'all' && item.providerId !== filterProvider) return false;
      return true;
    });
  }, [state.items, filterProvider, showOrdered]);

  const pendingItems = filteredItems.filter(i => !i.ordered);
  const orderedItems = filteredItems.filter(i => i.ordered);

  // Group by category
  const groupedByCategory = useMemo(() => {
    const groups: Partial<Record<Category, GroceryItem[]>> = {};
    for (const item of pendingItems) {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category]!.push(item);
    }
    return groups;
  }, [pendingItems]);

  // ── Urgent providers ─────────────────────────────────────────────
  const urgentProviders = state.providers.filter(p =>
    isUrgent(p) && state.items.some(i => i.providerId === p.id && !i.ordered)
  );

  // ── Stats ─────────────────────────────────────────────────────────
  const totalPending = state.items.filter(i => !i.ordered).length;
  const totalOrganic = state.items.filter(i => !i.ordered && i.isOrganic).length;
  const estimatedTotal = state.items
    .filter(i => !i.ordered && i.priceEstimate != null)
    .reduce((sum, i) => sum + (i.priceEstimate ?? 0), 0);

  // ── Handlers ─────────────────────────────────────────────────────
  function addItem(item: GroceryItem) {
    mutate(s => ({ ...s, items: [...s.items, item] }));
  }

  function addItems(items: GroceryItem[]) {
    mutate(s => ({ ...s, items: [...s.items, ...items] }));
  }

  function addProvider(p: Provider) {
    mutate(s => ({ ...s, providers: [...s.providers, p] }));
  }

  function deleteProvider(id: string) {
    mutate(s => ({
      ...s,
      providers: s.providers.filter(p => p.id !== id),
      items: s.items.filter(i => i.providerId !== id),
    }));
    if (filterProvider === id) setFilterProvider('all');
  }

  async function refreshProviderScrape(id: string) {
    const provider = state.providers.find(p => p.id === id);
    if (!provider?.url) return;
    const text = await scrapeUrl(provider.url);
    mutate(s => ({
      ...s,
      providers: s.providers.map(p =>
        p.id === id ? { ...p, scrapedText: text, scrapedAt: new Date().toISOString() } : p
      ),
    }));
  }

  function toggleItem(id: string) {
    mutate(s => ({
      ...s,
      items: s.items.map(i =>
        i.id === id
          ? { ...i, ordered: !i.ordered, orderedAt: !i.ordered ? new Date().toISOString() : undefined }
          : i
      ),
    }));
  }

  function deleteItem(id: string) {
    mutate(s => ({ ...s, items: s.items.filter(i => i.id !== id) }));
  }

  function markAllOrdered(providerId: string) {
    mutate(s => ({
      ...s,
      items: s.items.map(i =>
        i.providerId === providerId && !i.ordered
          ? { ...i, ordered: true, orderedAt: new Date().toISOString() }
          : i
      ),
    }));
  }

  function openAddItem(providerId?: string) {
    setPrefillProviderId(providerId);
    setShowAddItem(true);
  }

  function resetOrderedItems() {
    mutate(s => ({
      ...s,
      items: s.items.map(i => i.recurring ? { ...i, ordered: false, orderedAt: undefined } : i),
    }));
  }

  const view = state.activeView;
  function setView(v: View) {
    mutate(s => ({ ...s, activeView: v }));
  }

  function setCurrency(c: CurrencyCode) {
    mutate(s => ({ ...s, currency: c }));
  }

  function setCountry(c: string) {
    localStorage.setItem('barcode-country', c);
    const newLocale = getLocaleFromCountry(c);
    mutate(s => ({ ...s, country: c, locale: newLocale }));
  }

  function setLocale(l: Locale) {
    mutate(s => ({ ...s, locale: l }));
  }

  // ── Product Handlers ─────────────────────────────────────────────────────
  function addProduct(product: Product) {
    mutate(s => ({ ...s, products: [...s.products, product] }));
  }

  function updateProductPrice(variantId: string, price: number) {
    mutate(s => ({
      ...s,
      productVariants: s.productVariants.map(v =>
        v.id === variantId ? { ...v, priceEstimate: price, priceUpdatedAt: new Date().toISOString() } : v
      ),
    }));
  }

  async function updateProductPrices(productId: string) {
    const product = state.products.find(p => p.id === productId);
    if (!product) return;

    const variants = getProductVariants(state, productId);

    for (const variant of variants) {
      const provider = state.providers.find(p => p.id === variant.providerId);
      if (!provider?.scrapedText) continue;

      const match = lookupPrice(product.name, provider.scrapedText);
      if (match) {
        updateProductPrice(variant.id, match.price);
      }
    }
  }

  function smartAddProduct(productId: string, preferOrganic: boolean) {
    const product = state.products.find(p => p.id === productId);
    if (!product) return;

    const cheapest = getCheapestVariantForType(state, productId, preferOrganic);
    if (!cheapest) return;

    const provider = state.providers.find(p => p.id === cheapest.providerId);
    if (!provider) return;

    const item: GroceryItem = {
      id: generateId(),
      name: product.name,
      category: product.category,
      providerId: cheapest.providerId,
      quantity: cheapest.notes || '1',
      isOrganic: cheapest.isOrganic,
      priority: 'essential',
      valueRating: 2,
      priceEstimate: cheapest.priceEstimate,
      addedAt: new Date().toISOString(),
      ordered: false,
      recurring: true,
    };

    addItem(item);
    setSelectedProductId(null);
  }

  return (
    <div className="app">
      {/* ── Header ── */}
      <header className="app-header">
        <div className="app-logo">
          <span className="app-logo-name brush-accent">Barcode</span>
          <span className="app-logo-tag">grocery</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {totalPending > 0 && (
            <span className="badge badge-organic" style={{ fontSize: '0.75rem' }}>
              {totalPending} {getUILabel(state.locale, 'pending')}
            </span>
          )}
          <span style={{ fontSize: '0.75rem', color: 'var(--ink-muted)', fontWeight: 500 }}>
            {currencySymbols[state.currency]}
          </span>
          <span style={{ fontSize: '0.625rem', color: 'var(--ink-muted)', padding: '2px 6px', background: 'var(--paper-deep)', borderRadius: '3px' }}>
            v{__APP_VERSION__}
          </span>
          <button className="icon-btn" onClick={() => setShowSettings(true)} title="Settings">
            <Settings size={16} />
          </button>
        </div>
      </header>

      {/* ── Nav ── */}
      <nav className="nav-tabs">
        <button className={`nav-tab ${view === 'list' ? 'active' : ''}`} onClick={() => setView('list')}>
          {getUILabel(state.locale, 'list')}
        </button>
        <button className={`nav-tab ${view === 'providers' ? 'active' : ''}`} onClick={() => setView('providers')}>
          {getUILabel(state.locale, 'providers')}
        </button>
        <button className={`nav-tab ${view === 'products' ? 'active' : ''}`} onClick={() => setView('products')}>
          Products
        </button>
        <button className={`nav-tab ${view === 'history' ? 'active' : ''}`} onClick={() => setView('history')}>
          {getUILabel(state.locale, 'history')}
        </button>
      </nav>

      {/* ════════════════════════════════════════════
          VIEW: LIST
      ════════════════════════════════════════════ */}
      {view === 'list' && (
        <div>
          {/* Urgent banner */}
          {urgentProviders.length > 0 && (
            <div
              className="card"
              style={{
                borderColor: 'var(--urgent)',
                background: 'var(--urgent-bg)',
                marginBottom: '16px',
                padding: '12px 16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1rem' }}>⚡</span>
                <div>
                  <div style={{ fontWeight: 500, color: 'var(--urgent)', fontSize: '0.875rem' }}>
                    {getUILabel(state.locale, 'orderDeadline')}
                  </div>
                  <div className="caption">
                    {urgentProviders.map(p => p.name).join(', ')}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Summary */}
          {totalPending > 0 && (
            <div className="summary-bar">
              <div className="summary-stat">
                <span className="summary-stat-value">{totalPending}</span>
                <span className="summary-stat-label">{getUILabel(state.locale, 'items')}</span>
              </div>
              <div className="summary-divider" />
              <div className="summary-stat">
                <span className="summary-stat-value">{totalOrganic}</span>
                <span className="summary-stat-label">{getUILabel(state.locale, 'organicCount')}</span>
              </div>
              <div className="summary-divider" />
              <div className="summary-stat">
                <span className="summary-stat-value" style={{ fontSize: '1.1rem' }}>
                  {estimatedTotal > 0 ? formatPrice(estimatedTotal, state.currency) : '—'}
                </span>
                <span className="summary-stat-label">{getUILabel(state.locale, 'estTotal')}</span>
              </div>
            </div>
          )}

          {/* Filters */}
          <div style={{ marginBottom: '16px' }}>
            <div className="chip-group" style={{ overflowX: 'auto', flexWrap: 'nowrap', paddingBottom: '4px' }}>
              <button
                className={`chip ${filterProvider === 'all' ? 'active' : ''}`}
                onClick={() => setFilterProvider('all')}
                style={{ flexShrink: 0 }}
              >
                {getUILabel(state.locale, 'allProviders')}
              </button>
              {state.providers.map(p => (
                <button
                  key={p.id}
                  className={`chip ${filterProvider === p.id ? 'active' : ''}`}
                  onClick={() => setFilterProvider(p.id)}
                  style={{ flexShrink: 0 }}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Empty state */}
          {pendingItems.length === 0 && !showOrdered && (
            <div className="empty">
              <div className="empty-icon">🌿</div>
              <div className="empty-text">
                {getUILabel(state.locale, 'emptyList')}
              </div>
              <button className="btn btn-ghost" onClick={() => openAddItem()}>
                {getUILabel(state.locale, 'addFirstItem')}
              </button>
            </div>
          )}

          {/* Grouped by category */}
          {allCategories.map(cat => {
            const catItems = groupedByCategory[cat];
            if (!catItems?.length) return null;
            const categoryLabels = getCategoryLabels(state.locale);
            return (
              <div key={cat}>
                <div className="section-label">
                  {categoryEmoji[cat]} {categoryLabels[cat]}
                </div>
                <div className="item-list">
                  {catItems.map(item => (
                    <ItemRow
                      key={item.id}
                      item={item}
                      provider={state.providers.find(p => p.id === item.providerId)}
                      onToggle={toggleItem}
                      onDelete={deleteItem}
                      showProvider={filterProvider === 'all'}
                      currency={state.currency}
                    />
                  ))}
                </div>
              </div>
            );
          })}

          {/* Ordered items toggle */}
          {state.items.some(i => i.ordered) && (
            <div style={{ marginTop: '24px' }}>
              <button
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px dashed var(--paper-deep)',
                  color: 'var(--ink-muted)',
                  fontSize: '0.875rem',
                  background: 'transparent',
                  cursor: 'pointer',
                }}
                onClick={() => setShowOrdered(!showOrdered)}
              >
                {showOrdered ? getUILabel(state.locale, 'hideOrdered') : `${getUILabel(state.locale, 'showOrdered')} ${state.items.filter(i => i.ordered).length} ${getUILabel(state.locale, 'orderedItems')}`}
              </button>

              {showOrdered && (
                <div>
                  <div className="section-label" style={{ marginTop: '12px' }}>{getUILabel(state.locale, 'ordered')}</div>
                  <div className="item-list">
                    {orderedItems.map(item => (
                      <ItemRow
                        key={item.id}
                        item={item}
                        provider={state.providers.find(p => p.id === item.providerId)}
                        onToggle={toggleItem}
                        onDelete={deleteItem}
                        showProvider
                        currency={state.currency}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Reset recurring */}
          {state.items.some(i => i.recurring && i.ordered) && (
            <div style={{ marginTop: '16px', textAlign: 'center' }}>
              <button
                className="btn btn-ghost"
                style={{ fontSize: '0.8125rem' }}
                onClick={resetOrderedItems}
              >
                {getUILabel(state.locale, 'resetWeekly')}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════
          VIEW: PROVIDERS
      ════════════════════════════════════════════ */}
      {view === 'providers' && (
        <div>
          {state.providers.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">🏪</div>
              <div className="empty-text">{getUILabel(state.locale, 'emptyProviders')}</div>
              <button className="btn btn-ghost" onClick={() => setShowAddProvider(true)}>
                {getUILabel(state.locale, 'addProvider2')}
              </button>
            </div>
          ) : (
            <div className="provider-list">
              {state.providers.map(p => (
                <ProviderCard
                  key={p.id}
                  provider={p}
                  items={state.items.filter(i => i.providerId === p.id)}
                  onOrderAll={markAllOrdered}
                  onAddItem={id => openAddItem(id)}
                  onDelete={deleteProvider}
                  onRefreshScrape={refreshProviderScrape}
                />
              ))}
            </div>
          )}

          <div style={{ marginBottom: '80px' }} />
        </div>
      )}

      {/* ════════════════════════════════════════════
          VIEW: PRODUCTS
      ════════════════════════════════════════════ */}
      {view === 'products' && (
        <div>
          <ProductsTab
            products={state.products}
            state={state}
            currency={state.currency}
            onAddProduct={() => setShowAddProduct(true)}
            onProductClick={setSelectedProductId}
          />
          <div style={{ marginBottom: '80px' }} />
        </div>
      )}

      {/* ════════════════════════════════════════════
          VIEW: HISTORY
      ════════════════════════════════════════════ */}
      {view === 'history' && (
        <div>
          {state.items.filter(i => i.ordered).length === 0 ? (
            <div className="empty">
              <div className="empty-icon">📋</div>
              <div className="empty-text">{getUILabel(state.locale, 'emptyHistory')}</div>
            </div>
          ) : (
            <div>
              <div className="summary-bar" style={{ marginBottom: '20px' }}>
                <div className="summary-stat">
                  <span className="summary-stat-value">{state.items.filter(i => i.ordered).length}</span>
                  <span className="summary-stat-label">{getUILabel(state.locale, 'totalOrdered')}</span>
                </div>
                <div className="summary-divider" />
                <div className="summary-stat">
                  <span className="summary-stat-value">
                    {formatPrice(state.items.filter(i => i.ordered && i.priceEstimate).reduce((s, i) => s + (i.priceEstimate ?? 0), 0), state.currency)}
                  </span>
                  <span className="summary-stat-label">{getUILabel(state.locale, 'spent')}</span>
                </div>
                <div className="summary-divider" />
                <div className="summary-stat">
                  <span className="summary-stat-value">
                    {state.items.filter(i => i.ordered && i.isOrganic).length}
                  </span>
                  <span className="summary-stat-label">{getUILabel(state.locale, 'organicCount')}</span>
                </div>
              </div>

              {state.providers.map(p => {
                const orderedForProvider = state.items.filter(i => i.providerId === p.id && i.ordered);
                if (!orderedForProvider.length) return null;
                return (
                  <div key={p.id}>
                    <div className="section-label">
                      <span style={{ color: p.color }}>●</span> {p.name}
                    </div>
                    <div className="item-list">
                      {orderedForProvider.map(item => (
                        <ItemRow
                          key={item.id}
                          item={item}
                          onToggle={toggleItem}
                          onDelete={deleteItem}
                          currency={state.currency}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div style={{ marginBottom: '80px' }} />
        </div>
      )}

      {/* ── FAB ── */}
      {view === 'list' && (
        <div style={{ position: 'fixed', bottom: 'var(--space-8)', right: '50%', transform: 'translateX(50%)', maxWidth: 'calc(560px - var(--space-8))', width: 'calc(100% - var(--space-8))', display: 'flex', gap: '8px', zIndex: 20 }}>
          <button
            className="fab"
            style={{ flex: 1, margin: 0 }}
            onClick={() => openAddItem()}
          >
            <Plus size={16} />
            Add item
          </button>
          <button
            className="fab"
            style={{ flex: 1, margin: 0 }}
            onClick={() => setShowUploadReceipt(true)}
            title="Scan receipt photo"
          >
            📸 Scan
          </button>
        </div>
      )}
      {view !== 'list' && (
        <button
          className="fab"
          onClick={() => view === 'providers' ? setShowAddProvider(true) : null}
        >
          <Plus size={18} />
          {view === 'providers' ? 'Add provider' : 'Add item'}
        </button>
      )}

      {/* ── Sheets ── */}
      {showAddItem && (
        <AddItemSheet
          providers={state.providers}
          onAdd={addItem}
          onClose={() => setShowAddItem(false)}
          defaultProviderId={prefillProviderId}
          locale={state.locale}
        />
      )}

      {showAddProvider && (
        <AddProviderSheet
          onAdd={addProvider}
          onClose={() => setShowAddProvider(false)}
        />
      )}

      {showUploadReceipt && state.providers.length > 0 && (
        <UploadReceiptSheet
          providerId={state.providers[0].id}
          onItemsExtracted={addItems}
          onClose={() => setShowUploadReceipt(false)}
        />
      )}

      {showSettings && (
        <SettingsSheet
          currency={state.currency}
          country={state.country}
          locale={state.locale}
          onCurrencyChange={setCurrency}
          onCountryChange={setCountry}
          onLocaleChange={setLocale}
          onClose={() => setShowSettings(false)}
        />
      )}

      {showAddProduct && (
        <ProductFormSheet
          onAdd={addProduct}
          onClose={() => setShowAddProduct(false)}
          locale={state.locale}
        />
      )}

      {selectedProductId && state.products.find(p => p.id === selectedProductId) && (
        <ProductDetailView
          product={state.products.find(p => p.id === selectedProductId) as Product}
          state={state}
          currency={state.currency}
          onAddToList={smartAddProduct}
          onUpdatePrices={updateProductPrices}
          onClose={() => setSelectedProductId(null)}
        />
      )}
    </div>
  );
}
