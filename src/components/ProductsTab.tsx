import { Plus } from 'lucide-react';
import { AppState, Product } from '../types';
import { categoryEmoji, getCheapestVariant, getPricesByProduct, formatPrice, CurrencyCode } from '../store';

interface Props {
  products: Product[];
  state: AppState;
  currency: CurrencyCode;
  onAddProduct: () => void;
  onProductClick: (productId: string) => void;
}

export default function ProductsTab({
  products,
  state,
  currency,
  onAddProduct,
  onProductClick,
}: Props) {
  if (products.length === 0) {
    return (
      <div className="empty">
        <div className="empty-icon">📦</div>
        <div className="empty-text">No products yet. Create a product to start comparing prices across providers.</div>
        <button className="btn btn-ghost" onClick={onAddProduct}>
          Create first product
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Products Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        {products.map(product => {
          const cheapest = getCheapestVariant(state, product.id);
          const pricesByProvider = getPricesByProduct(state, product.id);
          const variantCount = Object.keys(pricesByProvider).length;

          return (
            <button
              key={product.id}
              onClick={() => onProductClick(product.id)}
              style={{
                padding: '16px',
                border: '1px solid var(--paper-deep)',
                borderRadius: 'var(--radius-md)',
                background: 'var(--paper)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow = 'var(--shadow-sm)';
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
              }}
            >
              {/* Product header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '12px' }}>
                <span style={{ fontSize: '1.5rem' }}>{categoryEmoji[product.category]}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--ink)' }}>
                    {product.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--ink-muted)', marginTop: '2px' }}>
                    {variantCount} {variantCount === 1 ? 'provider' : 'providers'}
                  </div>
                </div>
              </div>

              {/* Price info */}
              {cheapest ? (
                <div style={{ padding: '8px', background: 'var(--wheat-light)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--clay)', textTransform: 'uppercase', fontWeight: 500, marginBottom: '4px' }}>
                    Best price
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--clay-deep)' }}>
                    {formatPrice(cheapest.priceEstimate ?? 0, currency)}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--clay-muted)', marginTop: '4px' }}>
                    {cheapest.isOrganic ? '🌱 Organic' : 'Conventional'}
                  </div>
                </div>
              ) : (
                <div style={{ padding: '8px', background: 'var(--paper-deep)', borderRadius: 'var(--radius-sm)', color: 'var(--ink-muted)', fontSize: '0.8rem' }}>
                  No prices yet
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Add Product Button */}
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <button className="btn btn-ghost" onClick={onAddProduct}>
          <Plus size={16} />
          Add product
        </button>
      </div>
    </div>
  );
}
