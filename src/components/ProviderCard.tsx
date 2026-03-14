import { useState } from 'react';
import { ShoppingCart, AlertCircle, Clock, Trash2, ExternalLink, RefreshCw } from 'lucide-react';
import { Provider, GroceryItem } from '../types';
import {
  getNextDelivery,
  getOrderDeadline,
  formatDate,
  isUrgent,
} from '../store';

interface Props {
  provider: Provider;
  items: GroceryItem[];
  onOrderAll: (providerId: string) => void;
  onAddItem: (providerId: string) => void;
  onDelete: (providerId: string) => void;
  onRefreshScrape: (providerId: string) => Promise<void>;
}

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const today = new Date().getDay();

export default function ProviderCard({ provider, items, onOrderAll, onAddItem, onDelete, onRefreshScrape }: Props) {
  const [scraping, setScraping] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const pending = items.filter(i => !i.ordered);
  const nextDelivery = getNextDelivery(provider);
  const orderDeadline = getOrderDeadline(provider);
  const urgent = isUrgent(provider);

  async function handleRefresh() {
    if (!provider.url) return;
    setScraping(true);
    try {
      await onRefreshScrape(provider.id);
    } finally {
      setScraping(false);
    }
  }

  return (
    <div className={`provider-card ${urgent ? 'urgent' : ''}`}>
      <div className="provider-accent" style={{ background: provider.color }} />

      <div className="provider-header">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div className="provider-name">{provider.name}</div>
            {provider.url && (
              <a
                href={provider.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                style={{ color: 'var(--ink-muted)', display: 'flex', alignItems: 'center' }}
                title={provider.url}
              >
                <ExternalLink size={13} />
              </a>
            )}
          </div>
          {provider.notes && (
            <div className="caption" style={{ marginTop: '4px' }}>{provider.notes}</div>
          )}
          {provider.scrapedAt && (
            <div className="caption" style={{ marginTop: '2px', color: 'var(--moss)' }}>
              Prices fetched {new Date(provider.scrapedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
          <span
            className="badge"
            style={{
              background: provider.color + '18',
              color: provider.color,
              fontWeight: 600,
            }}
          >
            {pending.length} pending
          </span>
          {urgent && (
            <span className="badge badge-urgent" style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <AlertCircle size={10} /> Order soon!
            </span>
          )}
        </div>
      </div>

      <div className="provider-meta">
        {/* Delivery days */}
        <div className="provider-days">
          {DAY_LABELS.map((d, i) => (
            <div
              key={i}
              className={`day-dot ${provider.deliveryDays.includes(i) ? 'active' : ''}`}
              style={i === today && !provider.deliveryDays.includes(i) ? { borderColor: 'var(--ink-muted)' } : {}}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Delivery info */}
        {nextDelivery && (
          <div style={{ display: 'flex', gap: '16px', marginTop: '8px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Clock size={13} color="var(--ink-muted)" />
              <span className="caption">
                Next: <strong style={{ color: 'var(--ink)' }}>{formatDate(nextDelivery)}</strong>
              </span>
            </div>
            {orderDeadline && (
              <span className="caption" style={{ color: urgent ? 'var(--urgent)' : undefined }}>
                Order by: <strong style={{ color: urgent ? 'var(--urgent)' : 'var(--ink)' }}>{formatDate(orderDeadline)}</strong>
              </span>
            )}
          </div>
        )}

        {/* Action row */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          <button
            className="btn btn-ghost"
            style={{ flex: 1, fontSize: '0.8125rem', padding: '8px 10px' }}
            onClick={() => onAddItem(provider.id)}
          >
            + Add item
          </button>

          {provider.url && (
            <button
              className="btn btn-ghost"
              style={{ fontSize: '0.8125rem', padding: '8px 10px', gap: '5px' }}
              onClick={handleRefresh}
              disabled={scraping}
              title="Re-fetch live prices from website"
            >
              <RefreshCw size={13} style={{ animation: scraping ? 'spin 1s linear infinite' : undefined }} />
              {scraping ? 'Fetching…' : 'Prices'}
            </button>
          )}

          {pending.length > 0 && (
            <button
              className="btn"
              style={{
                flex: 2,
                fontSize: '0.8125rem',
                padding: '8px 10px',
                background: provider.color,
                color: 'white',
                borderRadius: 'var(--radius-pill)',
              }}
              onClick={() => onOrderAll(provider.id)}
            >
              <ShoppingCart size={14} />
              Mark {pending.length} ordered
            </button>
          )}
        </div>

        {/* Delete row */}
        <div style={{ marginTop: '8px', borderTop: '1px solid var(--paper-warm)', paddingTop: '8px' }}>
          {!confirmDelete ? (
            <button
              className="icon-btn danger"
              style={{ fontSize: '0.75rem', width: 'auto', padding: '4px 8px', gap: '4px', display: 'flex', alignItems: 'center', color: 'var(--ink-muted)' }}
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 size={12} /> Remove provider
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--urgent)' }}>
                Remove {provider.name} and all its items?
              </span>
              <button
                className="btn btn-danger"
                style={{ padding: '4px 12px', fontSize: '0.8125rem', borderRadius: 'var(--radius-pill)' }}
                onClick={() => onDelete(provider.id)}
              >
                Remove
              </button>
              <button
                className="btn btn-ghost"
                style={{ padding: '4px 12px', fontSize: '0.8125rem' }}
                onClick={() => setConfirmDelete(false)}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
