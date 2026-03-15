import { useState } from 'react';
import { X, RefreshCw } from 'lucide-react';
import { AppState, Provider, Product } from '../types';
import { getProductVariants, getPricesByProduct, formatPrice, CurrencyCode, categoryEmoji } from '../store';

interface Props {
  product: Product;
  state: AppState;
  currency: CurrencyCode;
  onAddToList: (productId: string, preferOrganic: boolean, providerId: string) => void;
  onUpdatePrices: (productId: string) => void;
  onClose: () => void;
}

export default function ProductDetailView({
  product,
  state,
  currency,
  onAddToList,
  onUpdatePrices,
  onClose,
}: Props) {
  const [preferOrganic, setPreferOrganic] = useState(true);
  const [updating, setUpdating] = useState(false);

  const variants = getProductVariants(state, product.id);
  const pricesByProvider = getPricesByProduct(state, product.id);

  // Get all providers that have variants for this product
  const providersWithVariants = Array.from(new Set(variants.map(v => v.providerId)))
    .map(id => state.providers.find(p => p.id === id))
    .filter((p): p is Provider => p !== undefined);

  // Find best price for user's preference
  const preferredVariants = variants.filter(v => v.isOrganic === preferOrganic);
  const cheapest = preferredVariants.length > 0
    ? preferredVariants.reduce((best, current) => {
        const bestPrice = best.priceEstimate ?? Infinity;
        const currentPrice = current.priceEstimate ?? Infinity;
        return currentPrice < bestPrice ? current : best;
      })
    : null;

  const cheapestProvider = cheapest
    ? state.providers.find(p => p.id === cheapest.providerId)
    : null;

  async function handleUpdatePrices() {
    setUpdating(true);
    await onUpdatePrices(product.id);
    setUpdating(false);
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" onClick={e => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h2 className="sheet-title" style={{ marginBottom: '4px', marginTop: 0 }}>
              {categoryEmoji[product.category]} {product.name}
            </h2>
            {product.notes && (
              <div style={{ fontSize: '0.8125rem', color: 'var(--ink-muted)' }}>
                {product.notes}
              </div>
            )}
          </div>
          <button className="icon-btn" onClick={onClose}><X size={18} /></button>
        </div>

        {/* Organic preference toggle */}
        <div style={{ marginBottom: '20px' }}>
          <div className="form-label" style={{ marginBottom: '8px' }}>Preference</div>
          <div className="chip-group">
            <button
              type="button"
              className={`chip ${preferOrganic ? 'active-green' : ''}`}
              onClick={() => setPreferOrganic(true)}
            >
              🌱 Organic
            </button>
            <button
              type="button"
              className={`chip ${!preferOrganic ? 'active' : ''}`}
              onClick={() => setPreferOrganic(false)}
            >
              Conventional
            </button>
          </div>
        </div>

        {/* Price comparison table */}
        {providersWithVariants.length > 0 ? (
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '12px', color: 'var(--ink)' }}>
              Price comparison
            </div>
            <div style={{ overflowX: 'auto', marginBottom: '12px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--paper-deep)' }}>
                    <th style={{ textAlign: 'left', padding: '8px 0', color: 'var(--ink-muted)', fontWeight: 500 }}>Provider</th>
                    <th style={{ textAlign: 'right', padding: '8px 0', color: 'var(--ink-muted)', fontWeight: 500 }}>Conventional</th>
                    <th style={{ textAlign: 'right', padding: '8px 0', color: 'var(--ink-muted)', fontWeight: 500 }}>Organic</th>
                  </tr>
                </thead>
                <tbody>
                  {providersWithVariants.map(provider => {
                    const prices = pricesByProvider[provider.id];
                    const convPrice = prices?.conventional;
                    const orgPrice = prices?.organic;
                    const isChepest = cheapest?.providerId === provider.id;

                    return (
                      <tr
                        key={provider.id}
                        style={{
                          borderBottom: '1px solid var(--paper-light)',
                          background: isChepest ? 'var(--wheat-light)' : undefined,
                        }}
                      >
                        <td style={{ padding: '12px 0', color: provider.color }}>
                          ● {provider.name}
                        </td>
                        <td style={{ textAlign: 'right', padding: '12px 0', color: 'var(--ink)', fontWeight: convPrice === cheapest?.priceEstimate && !preferOrganic ? 600 : undefined }}>
                          {convPrice ? formatPrice(convPrice, currency) : '—'}
                        </td>
                        <td style={{ textAlign: 'right', padding: '12px 0', color: 'var(--ink)', fontWeight: orgPrice === cheapest?.priceEstimate && preferOrganic ? 600 : undefined }}>
                          {orgPrice ? formatPrice(orgPrice, currency) : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Cheapest recommendation */}
            {cheapest && cheapestProvider && (
              <div
                style={{
                  padding: '12px',
                  background: 'var(--moss-light)',
                  border: '1px solid var(--moss)',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: '16px',
                }}
              >
                <div style={{ fontSize: '0.75rem', color: 'var(--moss-deep)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>
                  Best deal
                </div>
                <div style={{ color: 'var(--moss-deep)', fontWeight: 600 }}>
                  {formatPrice(cheapest.priceEstimate ?? 0, currency)} at {cheapestProvider.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--moss)', marginTop: '4px' }}>
                  {cheapest.isOrganic ? '🌱 Organic' : 'Conventional'}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div
            style={{
              padding: '16px',
              background: 'var(--paper-deep)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--ink-muted)',
              fontSize: '0.8125rem',
              marginBottom: '16px',
              textAlign: 'center',
            }}
          >
            No variants added yet. Create variants for each provider.
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
          {cheapest && cheapestProvider && (
            <button
              className="btn btn-primary"
              onClick={() => onAddToList(product.id, preferOrganic, cheapest.providerId)}
            >
              Add to {cheapestProvider.name} list
            </button>
          )}
          <button
            className="btn btn-ghost"
            onClick={handleUpdatePrices}
            disabled={updating}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <RefreshCw size={14} style={{ animation: updating ? 'spin 1s linear infinite' : undefined }} />
            {updating ? 'Updating...' : 'Update prices'}
          </button>
        </div>

        <style>{`
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        `}</style>
      </div>
    </div>
  );
}
