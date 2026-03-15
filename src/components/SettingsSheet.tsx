import { X } from 'lucide-react';
import { CurrencyCode } from '../types';
import { currencySymbols, countryNames, getLocaleFromCountry } from '../store';

interface Props {
  currency: CurrencyCode;
  country: string;
  locale: 'en' | 'sv' | 'no' | 'da';
  onCurrencyChange: (c: CurrencyCode) => void;
  onCountryChange: (c: string) => void;
  onLocaleChange: (l: 'en' | 'sv' | 'no' | 'da') => void;
  onClose: () => void;
}

const countryToCurrencyMap: Record<string, CurrencyCode> = {
  GB: 'GBP', US: 'USD', CA: 'CAD', AU: 'AUD', NZ: 'NZD',
  DE: 'EUR', FR: 'EUR', IT: 'EUR', ES: 'EUR', BE: 'EUR', NL: 'EUR', AT: 'EUR',
  IE: 'EUR', FI: 'EUR', GR: 'EUR', PT: 'EUR', LU: 'EUR', MT: 'EUR', CY: 'EUR',
  SE: 'SEK', NO: 'NOK', DK: 'DKK', CH: 'CHF',
};

const countries = ['GB', 'US', 'CA', 'AU', 'NZ', 'DE', 'FR', 'IT', 'ES', 'BE', 'NL', 'AT', 'IE', 'FI', 'GR', 'PT', 'LU', 'MT', 'CY', 'SE', 'NO', 'DK', 'CH'];
const currencies: CurrencyCode[] = ['GBP', 'USD', 'EUR', 'AUD', 'CAD', 'NZD', 'SEK', 'NOK', 'DKK', 'CHF'];
const locales: Array<'en' | 'sv' | 'no' | 'da'> = ['en', 'sv', 'no', 'da'];
const localeNames: Record<'en' | 'sv' | 'no' | 'da', string> = {
  en: 'English',
  sv: 'Svenska',
  no: 'Norsk',
  da: 'Dansk',
};

export default function SettingsSheet({ currency, country, locale, onCurrencyChange, onCountryChange, onLocaleChange, onClose }: Props) {
  function handleCountryChange(c: string) {
    onCountryChange(c);
    // Auto-set currency based on country
    const defaultCurr = countryToCurrencyMap[c];
    if (defaultCurr) onCurrencyChange(defaultCurr);
    // Auto-set locale
    onLocaleChange(getLocaleFromCountry(c));
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" onClick={e => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 className="sheet-title" style={{ marginBottom: 0 }}>Settings</h2>
          <button className="icon-btn" onClick={onClose}><X size={18} /></button>
        </div>

        {/* Language */}
        <div className="form-group">
          <label className="form-label">🌐 Language / Språk / Språk</label>
          <div className="chip-group">
            {locales.map(l => (
              <button
                key={l}
                type="button"
                className={`chip ${locale === l ? 'active' : ''}`}
                onClick={() => onLocaleChange(l)}
              >
                {localeNames[l]}
              </button>
            ))}
          </div>
        </div>

        {/* Country */}
        <div className="form-group">
          <label className="form-label">📍 Country</label>
          <select
            className="form-select"
            value={country}
            onChange={e => handleCountryChange(e.target.value)}
          >
            {countries.map(c => (
              <option key={c} value={c}>
                {countryNames[c] || c}
              </option>
            ))}
          </select>
          <div className="caption" style={{ marginTop: '6px', color: 'var(--ink-muted)' }}>
            Auto-detected from your IP. Changes language & currency automatically.
          </div>
        </div>

        {/* Currency */}
        <div className="form-group">
          <label className="form-label">💱 Currency</label>
          <div className="chip-group">
            {currencies.map(curr => (
              <button
                key={curr}
                type="button"
                className={`chip ${currency === curr ? 'active' : ''}`}
                onClick={() => onCurrencyChange(curr)}
              >
                {currencySymbols[curr]} {curr}
              </button>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div
          style={{
            marginTop: '24px',
            padding: '12px',
            background: 'var(--paper-warm)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--paper-deep)',
          }}
        >
          <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--ink)' }}>
            Prices in {currencySymbols[currency]} ({currency})
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--ink-muted)', marginTop: '4px' }}>
            Location: {countryNames[country] || country} • UI: {localeNames[locale]}
          </div>
        </div>

        <button
          className="btn btn-ghost"
          style={{ marginTop: '20px', width: '100%' }}
          onClick={onClose}
        >
          Done
        </button>
      </div>
    </div>
  );
}
