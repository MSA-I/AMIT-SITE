/**
 * BarWordmark — the giant morphing footer wordmark "BAR®".
 * ---------------------------------------------------------------------------
 * TYPE: drawn to read as the brand's own logotype — a high-contrast modern
 *   DIDONE (Bodoni/Didot family, the same voice as the AB monogram in
 *   /brand/ab-logo-ink.png and the Cormorant AMIT/BAR in the FixedFrame):
 *   heavy vertical stems (~52u) against hairline curve joins (~12-18u), thin
 *   flat serifs, bowls drawn with cubic Beziers whose wall swells from a
 *   hairline at the stem to a thick belly at the horizontal extreme (classic
 *   didone stress), and an A with a hairline left diagonal, a thick right
 *   diagonal and flared bracket feet.
 *
 * TECHNIQUE (ported, not copied, from the normalisboring reference footer):
 *   The letters that STRETCH are the straight vertical members ONLY — the B
 *   and R stems (with their serif feet) and the R leg. The rounded bowls are
 *   STATIC and stay put at the top (a didone bowl cannot stretch: the old
 *   "lower-bowl loop" pieces read as disconnected floating bars mid-morph,
 *   user-verified). The stems paint UNDER the bowls and the bowls' outer
 *   subpaths anchor 12u INSIDE the shafts, so the junction never seams. Every
 *   stretching piece is authored as TWO paths that share the SAME id-stem but
 *   differ by suffix:
 *       #<piece>_i  — the INITIAL (resting) shape. Visible. Drawn.
 *       #<piece>_f  — the FINAL (stretched-down) shape. Invisible data holder
 *                     (class "wm-final", opacity 0). Never painted.
 *   Footer.tsx (NOT this file) wires a scrubbed GSAP MorphSVGPlugin timeline
 *   that tweens each _i path's `d` toward its _f partner as the footer scrolls,
 *   so the stems and leg appear to be pulled downward while the bowls float.
 *   The pairs it needs are exported below as WORDMARK_MORPHS.
 *
 * THE ONE RULE FOR EDITING THE MORPH PATHS (read before touching them):
 *   Author every _f path by COPYING its _i path string verbatim and editing
 *   ONLY the coordinate NUMBERS (almost always just the downward Y values, and
 *   for the R leg the outward X of its foot). Keep the command letters, the
 *   command COUNT, and the point ORDER byte-for-byte identical between the
 *   pair. MorphSVG then interpolates point-to-point with zero re-mapping — a
 *   pure, artifact-free stretch. Change a command, add/remove a point, or
 *   reorder, and the morph will scramble. All morph paths use only absolute
 *   M / L / Z. Keep it that way. (The curved bowls are never morphed, so they
 *   are free to use C commands.)
 *
 * COMPOSITION: viewBox 1440 x 1200. The letter band lives in y 40..380 (cap
 *   height 340, waist ~206). At rest everything sits in that top strip; the
 *   lower ~2/3 (y 380..1200) is intentionally empty — a featured-project card
 *   overlaps there via negative margin. When morphed, the stretching stems
 *   reach y~1140 and the R leg's foot travels down + outward.
 * ---------------------------------------------------------------------------
 */

// --- MORPH PAIRS (Footer.tsx wires these) --------------------------------
// Each entry is [initial selector, final selector]. Only the STRAIGHT members
// stretch - the B and R stems (serif I-beams) and the R diagonal leg - while
// every rounded bowl floats in place (exactly the reference's move). The old
// "lower-bowl loop" pieces were removed: mid-morph they read as disconnected
// floating bars (user-verified visual break), a didone bowl cannot stretch.
// The A and the ® registered mark are fully static.
export const WORDMARK_MORPHS: [string, string][] = [
  ['#B_i_left', '#B_f_left'],
  ['#R_i_left', '#R_f_left'],
  ['#R_i_leg', '#R_f_leg'],
];

// --- B ---------------------------------------------------------------------
// Heavy left stem (x60..112) carrying the two didone bowls at its right edge.
// Left stem drawn as an I-beam: thick shaft + thin flat serifs top & bottom.
// rest bottom y365/380 -> final y1125/1140 (only the six bottom Y's change).
const B_I_LEFT =
  'M 38 40 L 134 40 L 134 55 L 112 55 L 112 365 L 134 365 L 134 380 L 38 380 L 38 365 L 60 365 L 60 55 L 38 55 Z';
const B_F_LEFT =
  'M 38 40 L 134 40 L 134 55 L 112 55 L 112 1125 L 134 1125 L 134 1140 L 38 1140 L 38 1125 L 60 1125 L 60 55 L 38 55 Z';
// upper bowl — static didone curve (outer + counter, evenodd): hairline where
// it joins the stem at top and waist, swelling to a thick belly on the right.
// Outer subpath anchors at x100 (INSIDE the x60..112 shaft) so bowl and stem
// overlap by 12u - kills the antialiasing seam at the junction; the counter
// stays at x112 so the inner wall keeps its drawn weight.
const B_UPPER =
  'M 100 40 C 252 40 356 58 390 112 C 414 152 396 186 330 200 C 262 210 182 206 100 206 Z' +
  'M 112 58 C 214 58 296 74 322 114 C 340 142 328 166 288 178 C 236 192 176 190 112 190 Z';
// lower bowl — static full round didone bowl (outer + counter, evenodd),
// larger than the upper and reaching further right.
const B_LOWER =
  'M 100 206 C 268 206 388 226 424 292 C 446 334 426 368 356 378 C 268 388 182 382 100 380 Z' +
  'M 112 228 C 232 228 330 244 356 292 C 374 324 360 350 316 360 C 250 372 178 368 112 366 Z';

// --- A (fully static, didone) ----------------------------------------------
// One evenodd path: outer envelope with a hairline left diagonal, a thick
// right diagonal and concave flared bracket feet; a counter carves the apex
// triangle; a leg-gap carves the open notch between the feet. The solid band
// between the two carved regions IS the thin crossbar.
const A_STATIC =
  'M 452 380 C 482 378 506 366 520 344 L 690 40 L 704 40 L 872 344 C 888 366 910 378 940 380 Z ' +
  'M 662 132 L 742 268 L 578 268 Z ' +
  'M 574 292 L 762 292 L 812 380 L 566 380 Z';

// --- R ---------------------------------------------------------------------
// Same construction as B: heavy left stem (x955..1007) with serif feet + a
// didone upper bowl, plus a tapered diagonal leg.
const R_I_LEFT =
  'M 933 40 L 1029 40 L 1029 55 L 1007 55 L 1007 365 L 1029 365 L 1029 380 L 933 380 L 933 365 L 955 365 L 955 55 L 933 55 Z';
const R_F_LEFT =
  'M 933 40 L 1029 40 L 1029 55 L 1007 55 L 1007 1125 L 1029 1125 L 1029 1140 L 933 1140 L 933 1125 L 955 1125 L 955 55 L 933 55 Z';
// bowl — static didone curve (outer + counter, evenodd), hairline-joined.
// Outer anchors at x995 (inside the x955..1007 shaft): same seam-killing
// overlap as the B bowls; counter keeps x1007.
const R_BOWL =
  'M 995 40 C 1150 40 1250 60 1284 112 C 1310 152 1292 188 1230 206 C 1160 216 1080 212 995 212 Z' +
  'M 1007 58 C 1120 58 1200 74 1226 114 C 1246 144 1234 168 1192 182 C 1130 196 1070 194 1007 194 Z';
// diagonal leg — springs from under the bowl; the foot travels down + outward
// (only the two foot points change: X out to ~1420/1356, Y down to 1140).
const R_I_LEG = 'M 1112 206 L 1184 206 L 1322 380 L 1258 380 Z';
const R_F_LEG = 'M 1112 206 L 1184 206 L 1420 1140 L 1356 1140 Z';

// --- ® registered mark (fully static) --------------------------------------
// Small R built from slab pieces (stem + "⊐" bowl + leg) inside a thin stroked
// ring; the counter reads as negative space, top-right after the R.
const REG_R =
  'M 1380 53 L 1386 53 L 1386 83 L 1380 83 Z ' +
  'M 1386 53 L 1402 53 L 1402 70 L 1386 70 L 1386 64 L 1396 64 L 1396 59 L 1386 59 Z ' +
  'M 1390 70 L 1396 70 L 1402 83 L 1396 83 Z';

export default function BarWordmark({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 1440 1200"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      style={{ width: '100%', height: 'auto', display: 'block' }}
    >
      {/* ---- B ---- */}
      <path id="B_i_left" d={B_I_LEFT} />
      <path d={B_UPPER} fillRule="evenodd" />
      <path d={B_LOWER} fillRule="evenodd" />

      {/* ---- A (static) ---- */}
      <path d={A_STATIC} fillRule="evenodd" />

      {/* ---- R ---- */}
      <path id="R_i_left" d={R_I_LEFT} />
      <path d={R_BOWL} fillRule="evenodd" />
      <path id="R_i_leg" d={R_I_LEG} />

      {/* ---- ® registered mark (static) ---- */}
      <circle cx="1392" cy="68" r="24" fill="none" stroke="currentColor" strokeWidth="5" />
      <path d={REG_R} fillRule="evenodd" />

      {/* ---- final (stretched) shapes: invisible morph targets ---- */}
      <g className="wm-final" style={{ opacity: 0 }}>
        <path id="B_f_left" d={B_F_LEFT} />
        <path id="R_f_left" d={R_F_LEFT} />
        <path id="R_f_leg" d={R_F_LEG} />
      </g>
    </svg>
  );
}
