import { useI18n } from '../i18n/context';
import { LangLink } from './ui';

/**
 * FixedFrame - the fixed chrome frame (z 40, mix-blend-difference) that paints
 * the AMIT wordmark top-start and the flipped "interior design / BAR(R)" mark
 * bottom-end over every section. Pure markup; all styling lives in the scaffold
 * CSS (.frame, .frame-logo, .frame-mark in src/index.css).
 *
 * IRON RULE: FixedFrame must have NO ancestor carrying transform / filter /
 * opacity < 1 / will-change - any of those creates a containing block that
 * breaks position:fixed and kills mix-blend-difference. It mounts in Layout as
 * a direct sibling of <main>, OUTSIDE the Framer AnimatePresence wrapper.
 *
 * Direction: the corners mirror with the page (logo top-start, mark
 * bottom-end), so dir="ltr" must stay OFF the positioned elements - logical
 * insets resolve against the element's OWN direction, and dir="ltr" there
 * would pin both corners physically left/right and collide with the MenuPill
 * (top-end) in Hebrew. The Latin wordmark text is bidi-guarded by inner
 * dir="ltr" spans instead ("®" would otherwise swap sides in RTL).
 */
export default function FixedFrame() {
  const { t } = useI18n();
  return (
    // role="banner": the frame IS the persistent site header; without a
    // landmark the logo link fails axe's region rule (content outside landmarks)
    <div className="frame" role="banner">
      <LangLink to="/" className="frame-logo" aria-label={t.frame.homeAria} data-frame-logo>
        <span dir="ltr">AMIT</span>
      </LangLink>
      <span className="frame-mark" aria-hidden data-frame-mark>
        <span className="fm-sub">interior design</span>
        <span className="fm-flip">
          <span dir="ltr">BAR&reg;</span>
        </span>
      </span>
    </div>
  );
}
