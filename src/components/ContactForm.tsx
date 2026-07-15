import { useState } from 'react';
import { Check } from 'lucide-react';
import { useI18n } from '../i18n/context';
import { waLink, EMAIL } from '../lib/paths';
import { btnSolid } from './ui';

const field =
  'w-full border-b border-ink/20 bg-transparent py-3 text-ink placeholder:text-ink-soft/60 focus:border-sage focus:outline-none transition-colors';
const label = 'mb-1.5 block u-label text-ink-soft';

export default function ContactForm() {
  const { t } = useI18n();
  const f = t.contact.form;
  const [data, setData] = useState({ name: '', phone: '', email: '', type: f.projectOptions[0], message: '' });
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState('');

  const set = (k: keyof typeof data) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setData((d) => ({ ...d, [k]: e.target.value }));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.name.trim() || !data.phone.trim()) {
      setErr(t.contact.form.error);
      return;
    }
    setErr('');
    // Lead capture without a backend: hand off to WhatsApp with the details prefilled.
    // ponytail: mailto/WhatsApp handoff; swap for a Formspree/Vercel function later if needed.
    const msg = `${t.contact.whatsappMessage}\n\n${f.name}: ${data.name}\n${f.phone}: ${data.phone}\n${f.email}: ${data.email}\n${f.projectType}: ${data.type}\n${f.message}: ${data.message}`;
    window.open(waLink(msg), '_blank', 'noopener');
    setSent(true);
  };

  if (sent) {
    return (
      <div className="flex flex-col items-start gap-4 border border-line bg-paper p-8">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-sage/15 text-sage">
          <Check className="h-6 w-6" />
        </span>
        <p className="text-lg text-ink">{f.success}</p>
        <a href={`mailto:${EMAIL}`} className="text-sm text-sage hover:underline">
          {EMAIL}
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      <div>
        <label className={label} htmlFor="cf-name">{f.name}</label>
        <input id="cf-name" className={field} value={data.name} onChange={set('name')} dir="auto" required autoComplete="name" />
      </div>
      <div>
        <label className={label} htmlFor="cf-phone">{f.phone}</label>
        <input id="cf-phone" type="tel" className={field} value={data.phone} onChange={set('phone')} dir="auto" required autoComplete="tel" />
      </div>
      <div>
        <label className={label} htmlFor="cf-email">{f.email}</label>
        <input id="cf-email" type="email" className={field} value={data.email} onChange={set('email')} dir="auto" autoComplete="email" />
      </div>
      <div>
        <label className={label} htmlFor="cf-type">{f.projectType}</label>
        <select id="cf-type" className={field} value={data.type} onChange={set('type')}>
          {f.projectOptions.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      </div>
      <div className="sm:col-span-2">
        <label className={label} htmlFor="cf-msg">{f.message}</label>
        <textarea id="cf-msg" rows={4} className={field + ' resize-none'} value={data.message} onChange={set('message')} dir="auto" />
      </div>
      {err && <p className="text-sm text-sage sm:col-span-2">{err}</p>}
      <div className="sm:col-span-2">
        <button type="submit" className={btnSolid}>{f.submit}</button>
      </div>
    </form>
  );
}
