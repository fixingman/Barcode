import { useState, useEffect, useMemo } from 'react';
<<<<<<< ours
import { Plus, ListChecks, Store, History } from 'lucide-react';
import { AppState, GroceryItem, Provider, View, Category } from './types';
import {
  loadState, saveState, categoryLabels, categoryEmoji, allCategories,
  getNextDelivery, formatDate, isUrgent,
=======
import { Plus } from 'lucide-react';
import { AppState, GroceryItem, Provider, View, Category } from './types';
import {
  loadState, saveState, categoryLabels, categoryEmoji, allCategories,
  getNextDelivery, formatDate, isUrgent, scrapeUrl,
>>>>>>> theirs
} from './store';
import AddItemSheet from './components/AddItemSheet';
import AddProviderSheet from './components/AddProviderSheet';
import ItemRow from './components/ItemRow';
import ProviderCard from './components/ProviderCard';

export default function App() {
  const [state, setState] = useState<AppState>(loadState);
  const [showAddItem, setShowAddItem] = useState(false);
  const [showAddProvider, setShowAddProvider] = useState(false);
  const [prefillProviderId, setPrefillProviderId] = useState<string | undefined>();
  const [filterCategory, setFilterCategory] = useState<Category | 'all'>('all');
  const [filterProvider, setFilterProvider] = useState<string>('all');
  const [showOrdered, setShowOrdered] = useState(false);

  useEffect(() => { saveState(state); }, [state]);

  function mutate(updater: (s: AppState) => AppState) {
    setState(prev => updater(prev));
  }

  // ── Items view logic ──────────────────────────────────────────────
  const filteredItems = useMemo(() => {
    return state.items.filter(item => {
      if (!showOrdered && item.ordered) return false;
      if (filterCategory !== 'all' && item.category !== filterCategory) return false;
      if (filterProvider !== 'all' && item.providerId !== filterProvider) return false;
      return true;
    });
  }, [state.items, filterCategory, filterProvider, showOrdered]);

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

  function addProvider(p: Provider) {
    mutate(s => ({ ...s, providers: [...s.providers, p] }));
  }

<<<<<<< ours
=======
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

>>>>>>> theirs
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

  return (
    <div className="app">
      {/* ── Header ── */}
      <header className="app-header">
        <div className="app-logo">
          <span className="app-logo-name brush-accent">Barcode</span>
          <span className="app-logo-tag">grocery</span>
        </div>
        {totalPending > 0 && (
          <span className="badge badge-organic" style={{ fontSize: '0.75rem' }}>
            {totalPending} pending
          </span>
        )}
      </header>

      {/* ── Nav ── */}
      <nav className="nav-tabs">
        <button className={`nav-tab ${view === 'list' ? 'active' : ''}`} onClick={() => setView('list')}>
          List
        </button>
        <button className={`nav-tab ${view === 'providers' ? 'active' : ''}`} onClick={() => setView('providers')}>
          Providers
        </button>
        <button className={`nav-tab ${view === 'history' ? 'active' : ''}`} onClick={() => setView('history')}>
          History
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
                    Order deadline approaching
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
                <span className="summary-stat-label">Items</span>
              </div>
              <div className="summary-divider" />
              <div className="summary-stat">
                <span className="summary-stat-value">{totalOrganic}</span>
                <span className="summary-stat-label">Organic</span>
              </div>
              <div className="summary-divider" />
              <div className="summary-stat">
                <span className="summary-stat-value" style={{ fontSize: '1.1rem' }}>
                  {estimatedTotal > 0 ? `£${estimatedTotal.toFixed(0)}` : '—'}
                </span>
                <span className="summary-stat-label">Est. total</span>
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
                All providers
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
                Your list is empty. Add items to start planning your orders.
              </div>
              <button className="btn btn-ghost" onClick={() => openAddItem()}>
                Add first item
              </button>
            </div>
          )}

          {/* Grouped by category */}
          {allCategories.map(cat => {
            const catItems = groupedByCategory[cat];
            if (!catItems?.length) return null;
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
                {showOrdered ? 'Hide ordered' : `Show ${state.items.filter(i => i.ordered).length} ordered items`}
              </button>

              {showOrdered && (
                <div>
                  <div className="section-label" style={{ marginTop: '12px' }}>Ordered</div>
                  <div className="item-list">
                    {orderedItems.map(item => (
                      <ItemRow
                        key={item.id}
                        item={item}
                        provider={state.providers.find(p => p.id === item.providerId)}
                        onToggle={toggleItem}
                        onDelete={deleteItem}
                        showProvider
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
                🔄 Reset weekly staples
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
              <div className="empty-text">No providers yet. Add your grocery stores.</div>
              <button className="btn btn-ghost" onClick={() => setShowAddProvider(true)}>
                Add provider
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
<<<<<<< ours
=======
                  onDelete={deleteProvider}
                  onRefreshScrape={refreshProviderScrape}
>>>>>>> theirs
                />
              ))}
            </div>
          )}

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
              <div className="empty-text">Nothing ordered yet. Complete some items to see history here.</div>
            </div>
          ) : (
            <div>
              <div className="summary-bar" style={{ marginBottom: '20px' }}>
                <div className="summary-stat">
                  <span className="summary-stat-value">{state.items.filter(i => i.ordered).length}</span>
                  <span className="summary-stat-label">Ordered</span>
                </div>
                <div className="summary-divider" />
                <div className="summary-stat">
                  <span className="summary-stat-value">
                    £{state.items.filter(i => i.ordered && i.priceEstimate).reduce((s, i) => s + (i.priceEstimate ?? 0), 0).toFixed(0)}
                  </span>
                  <span className="summary-stat-label">Spent</span>
                </div>
                <div className="summary-divider" />
                <div className="summary-stat">
                  <span className="summary-stat-value">
                    {state.items.filter(i => i.ordered && i.isOrganic).length}
                  </span>
                  <span className="summary-stat-label">Organic</span>
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
      <button
        className="fab"
        onClick={() => view === 'providers' ? setShowAddProvider(true) : openAddItem()}
      >
        <Plus size={18} />
        {view === 'providers' ? 'Add provider' : 'Add item'}
      </button>

      {/* ── Sheets ── */}
      {showAddItem && (
        <AddItemSheet
          providers={state.providers}
          onAdd={addItem}
          onClose={() => setShowAddItem(false)}
          defaultProviderId={prefillProviderId}
        />
      )}

      {showAddProvider && (
        <AddProviderSheet
          onAdd={addProvider}
          onClose={() => setShowAddProvider(false)}
        />
      )}
    </div>
  );
}
