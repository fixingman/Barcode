import { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import { GroceryItem, Provider, Priority, ValueRating, Category } from '../types';
import { generateId, allCategories, categoryLabels, categoryEmoji, lookupPrice } from '../store';

interface Props {
  providers: Provider[];
  onAdd: (item: GroceryItem) => void;
  onClose: () => void;
  defaultProviderId?: string;
}

export default function AddItemSheet({ providers, onAdd, onClose, defaultProviderId }: Props) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('vegetables');
  const [providerId, setProviderId] = useState(defaultProviderId ?? (providers[0]?.id ?? ''));
  const [quantity, setQuantity] = useState('');
  const [isOrganic, setIsOrganic] = useState(true);
  const [priority, setPriority] = useState<Priority>('essential');
  const [valueRating, setValueRating] = useState<ValueRating>(2);
  const [priceEstimate, setPriceEstimate] = useState('');
  const [notes, setNotes] = useState('');
  const [recurring, setRecurring] = useState(false);

  const [priceSuggestion, setPriceSuggestion] = useState<{ price: number; context: string } | null>(null);
  const [lookingUp, setLookingUp] = useState(false);

  const selectedProvider = providers.find(p => p.id === providerId);

  // Auto-lookup price when name changes (debounced) if provider has scraped data
  useEffect(() => {
    if (!name.trim() || name.length < 3) { setPriceSuggestion(null); return; }
    if (!selectedProvider?.scrapedText) { setPriceSuggestion(null); return; }

    const t = setTimeout(() => {
      setLookingUp(true);
      const result = lookupPrice(name, selectedProvider.scrapedText!);
      setPriceSuggestion(result);
      setLookingUp(false);
    }, 400);
    return () => clearTimeout(t);
  }, [name, selectedProvider?.scrapedText]);

  function applyPriceSuggestion() {
    if (priceSuggestion) setPriceEstimate(priceSuggestion.price.toFixed(2));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const item: GroceryItem = {
      id: generateId(),
      name: name.trim(),
      category,
      providerId,
      quantity: quantity.trim() || '1',
      isOrganic,
      priority,
      valueRating,
      priceEstimate: priceEstimate !== '' ? parseFloat(priceEstimate) : undefined,
      notes: notes.trim() || undefined,
      addedAt: new Date().toISOString(),
      ordered: false,
      recurring,
    };
    onAdd(item);
    onClose();
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" onClick={e => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 className="sheet-title" style={{ marginBottom: 0 }}>Add item</h2>
          <button className="icon-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Name */}
          <div className="form-group">
            <label className="form-label">Item name *</label>
            <div style={{ position: 'relative' }}>
              <input
                className="form-input"
                placeholder="e.g. Tuscan kale"
                value={name}
                onChange={e => setName(e.target.value)}
                autoFocus
                required
                style={{ paddingRight: lookingUp ? '36px' : undefined }}
              />
              {lookingUp && (
                <Search
                  size={14}
                  style={{
                    position: 'absolute', right: '12px', top: '50%',
                    transform: 'translateY(-50%)', color: 'var(--ink-muted)',
                    animation: 'pulse 1s ease-in-out infinite',
                  }}
                />
              )}
            </div>

            {/* Price suggestion pill */}
            {priceSuggestion && !lookingUp && (
              <div
                style={{
                  marginTop: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 10px',
                  background: 'var(--wheat-light)',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                }}
                onClick={applyPriceSuggestion}
                title="Click to use this price"
              >
                <span style={{ fontSize: '0.8125rem', color: 'var(--clay-deep)' }}>
                  💰 Found <strong>£{priceSuggestion.price.toFixed(2)}</strong> on {selectedProvider?.name}
                </span>
                <span className="caption" style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  — {priceSuggestion.context}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--clay)', fontWeight: 500, flexShrink: 0 }}>Use</span>
              </div>
            )}
          </div>

          {/* Category + Provider row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-select" value={category} onChange={e => setCategory(e.target.value as Category)}>
                {allCategories.map(c => (
                  <option key={c} value={c}>{categoryEmoji[c]} {categoryLabels[c]}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Provider</label>
              <select className="form-select" value={providerId} onChange={e => setProviderId(e.target.value)}>
                {providers.map(p => (
                  <option key={p.id} value={p.id}>{p.name}{p.scrapedText ? ' ✓' : ''}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Hint when no provider data */}
          {selectedProvider && !selectedProvider.scrapedText && (
            <div className="caption" style={{ marginTop: '-8px', marginBottom: '12px', color: 'var(--ink-muted)' }}>
              No price data for {selectedProvider.name} yet — fetch their site in Providers to enable auto-prices.
            </div>
          )}

          {/* Quantity + Price row */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Quantity</label>
              <input
                className="form-input"
                placeholder="e.g. 2 bunches"
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Est. price</label>
              <input
                className="form-input"
                type="number"
                placeholder="£0.00"
                min="0"
                step="0.01"
                value={priceEstimate}
                onChange={e => setPriceEstimate(e.target.value)}
              />
            </div>
          </div>

          {/* Organic toggle */}
          <div className="form-group">
            <label className="form-label">Quality</label>
            <div className="chip-group">
              <button type="button" className={`chip ${isOrganic ? 'active-green' : ''}`} onClick={() => setIsOrganic(true)}>
                🌱 Organic
              </button>
              <button type="button" className={`chip ${!isOrganic ? 'active' : ''}`} onClick={() => setIsOrganic(false)}>
                Conventional
              </button>
            </div>
          </div>

          {/* Priority */}
          <div className="form-group">
            <label className="form-label">Priority</label>
            <div className="chip-group">
              {(['essential', 'nice-to-have', 'splurge'] as Priority[]).map(p => (
                <button
                  key={p}
                  type="button"
                  className={`chip ${priority === p ? 'active' : ''}`}
                  onClick={() => setPriority(p)}
                >
                  {p === 'essential' ? 'Essential' : p === 'nice-to-have' ? 'Nice to have' : 'Splurge'}
                </button>
              ))}
            </div>
          </div>

          {/* Value rating */}
          <div className="form-group">
            <label className="form-label">Value for money</label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {([1, 2, 3] as ValueRating[]).map(v => (
                <button
                  key={v}
                  type="button"
                  className={`value-star ${valueRating >= v ? 'active' : ''}`}
                  onClick={() => setValueRating(v)}
                  title={v === 1 ? 'Pricey but worth it' : v === 2 ? 'Fair price' : 'Great value'}
                >
                  {v === 1 ? '💸' : v === 2 ? '⚖️' : '💚'}
                </button>
              ))}
              <span style={{ fontSize: '0.75rem', color: 'var(--ink-muted)', marginLeft: '4px' }}>
                {valueRating === 1 ? 'Splurge worthy' : valueRating === 2 ? 'Fair price' : 'Great value'}
              </span>
            </div>
          </div>

          {/* Recurring */}
          <div className="form-group">
            <label className="form-label">Ordering cadence</label>
            <div className="chip-group">
              <button type="button" className={`chip ${recurring ? 'active' : ''}`} onClick={() => setRecurring(true)}>
                🔄 Weekly staple
              </button>
              <button type="button" className={`chip ${!recurring ? 'active' : ''}`} onClick={() => setRecurring(false)}>
                One-time
              </button>
            </div>
          </div>

          {/* Notes */}
          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea
              className="form-textarea"
              placeholder="Any specific notes…"
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: '8px' }}>
            Add to list
          </button>
        </form>
      </div>
    </div>
  );
}
