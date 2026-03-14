import { ShoppingCart, AlertCircle, Clock } from 'lucide-react';
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
}

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const today = new Date().getDay();

export default function ProviderCard({ provider, items, onOrderAll, onAddItem }: Props) {
  const pending = items.filter(i => !i.ordered);
  const nextDelivery = getNextDelivery(provider);
  const orderDeadline = getOrderDeadline(provider);
  const urgent = isUrgent(provider);

  return (
    <div className={`provider-card ${urgent ? 'urgent' : ''}`}>
      <div className="provider-accent" style={{ background: provider.color }} />

      <div className="provider-header">
        <div>
          <div className="provider-name">{provider.name}</div>
          {provider.notes && (
            <div className="caption" style={{ marginTop: '4px' }}>{provider.notes}</div>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
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
              className={`day-dot ${provider.deliveryDays.includes(i) ? 'active' : ''} ${i === today ? 'today' : ''}`}
              style={i === today && !provider.deliveryDays.includes(i) ? { borderColor: 'var(--ink-muted)' } : {}}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Delivery info */}
        {nextDelivery && (
          <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Clock size={13} color="var(--ink-muted)" />
              <span className="caption">
                Next delivery: <strong style={{ color: 'var(--ink)' }}>{formatDate(nextDelivery)}</strong>
              </span>
            </div>
            {orderDeadline && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span className="caption" style={{ color: urgent ? 'var(--urgent)' : undefined }}>
                  Order by: <strong style={{ color: urgent ? 'var(--urgent)' : 'var(--ink)' }}>{formatDate(orderDeadline)}</strong>
                </span>
              </div>
            )}
          </div>
        )}

        {/* Action row */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          <button
            className="btn btn-ghost"
            style={{ flex: 1, fontSize: '0.8125rem', padding: '8px 12px' }}
            onClick={() => onAddItem(provider.id)}
          >
            + Add item
          </button>
          {pending.length > 0 && (
            <button
              className="btn"
              style={{
                flex: 2,
                fontSize: '0.8125rem',
                padding: '8px 12px',
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
      </div>
    </div>
  );
}
