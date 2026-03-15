import { Check, Trash2 } from 'lucide-react';
import { GroceryItem, Provider, CurrencyCode } from '../types';
import { categoryEmoji, formatPrice } from '../store';

interface Props {
  item: GroceryItem;
  provider?: Provider;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  showProvider?: boolean;
  currency: CurrencyCode;
}

const priorityLabel = {
  'essential': 'Essential',
  'nice-to-have': 'Nice',
  'splurge': 'Splurge',
};

const priorityClass = {
  'essential': 'badge-priority-essential',
  'nice-to-have': 'badge-priority-nice',
  'splurge': 'badge-priority-splurge',
};

export default function ItemRow({ item, provider, onToggle, onDelete, showProvider = false, currency }: Props) {
  return (
    <div className={`item-row ${item.ordered ? 'ordered' : ''}`}>
      <button
        className={`item-check ${item.ordered ? 'checked' : ''}`}
        onClick={() => onToggle(item.id)}
        aria-label={item.ordered ? 'Mark not ordered' : 'Mark ordered'}
      >
        {item.ordered && <Check size={11} strokeWidth={2.5} />}
      </button>

      <div className="item-content" onClick={() => onToggle(item.id)}>
        <div className="item-name" style={{ textDecoration: item.ordered ? 'line-through' : undefined }}>
          {item.name}
        </div>
        <div className="item-qty">{item.quantity}</div>
        <div className="item-meta">
          <span className="badge badge-category">
            {categoryEmoji[item.category]}
          </span>
          {item.isOrganic && (
            <span className="badge badge-organic">🌱 organic</span>
          )}
          <span className={`badge ${priorityClass[item.priority]}`}>
            {priorityLabel[item.priority]}
          </span>
          {item.recurring && (
            <span className="badge badge-category" title="Weekly staple">
              🔄
            </span>
          )}
          {showProvider && provider && (
            <span
              className="badge"
              style={{
                background: provider.color + '22',
                color: provider.color,
              }}
            >
              {provider.name}
            </span>
          )}
          {item.priceEstimate != null && (
            <span className="caption">{formatPrice(item.priceEstimate, currency)}</span>
          )}
        </div>
      </div>

      <div className="item-actions">
        <button
          className="icon-btn danger"
          onClick={() => onDelete(item.id)}
          aria-label="Delete item"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}
