import { useState } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent, useReducedMotion } from 'framer-motion';
import { MessageCircle, Phone, X, Plus } from 'lucide-react';
import { useI18n } from '../i18n/context';
import { PHONE, waLink } from '../lib/paths';

/** Floating WhatsApp + call control, appears after scrolling past the hero. */
export default function StickyContact() {
  const { t } = useI18n();
  const [shown, setShown] = useState(false);
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, 'change', (y) => setShown(y > 600));

  return (
    <div className="fixed bottom-5 end-5 z-40">
      <AnimatePresence>
        {shown && (
          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.8, y: 10 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            className="flex flex-col items-end gap-3"
          >
            <AnimatePresence>
              {open && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="flex flex-col gap-2"
                >
                  <a
                    href={waLink(t.contact.whatsappMessage)}
                    target="_blank"
                    rel="noopener"
                    className="flex items-center gap-2 rounded-full bg-surface px-4 py-3 text-sm font-medium text-ink shadow-lg ring-1 ring-line transition-colors hover:text-copper"
                  >
                    <MessageCircle className="h-4 w-4 text-copper" /> {t.contact.whatsapp}
                  </a>
                  <a
                    href={`tel:${PHONE}`}
                    className="flex items-center gap-2 rounded-full bg-surface px-4 py-3 text-sm font-medium text-ink shadow-lg ring-1 ring-line transition-colors hover:text-copper"
                  >
                    <Phone className="h-4 w-4 text-copper" /> {t.contact.call}
                  </a>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? 'Close' : t.nav.contact}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-copper text-white shadow-xl transition-transform hover:scale-105 active:scale-95"
            >
              <motion.span animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.2 }}>
                {open ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
              </motion.span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
