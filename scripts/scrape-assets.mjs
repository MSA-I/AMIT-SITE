// Migrates Amit Bar's real photography into batch-based project collections.
// Each WordPress upload batch (YYYY/MM) is a distinct photo shoot = a real project.
// Downloads + optimizes to WebP (full + thumb) and writes src/data/projects.json.
// Run: npm run scrape
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT_IMG = path.join(ROOT, 'public', 'projects');
const OUT_DATA = path.join(ROOT, 'src', 'data');
const BASE = 'https://abdesigner.co.il';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36';

const fetchText = async (url) => {
  try {
    const r = await fetch(url, { headers: { 'User-Agent': UA } });
    return r.ok ? r.text() : '';
  } catch {
    return '';
  }
};
const toOriginal = (u) => u.replace(/-\d+x\d+(\.\w+)(\?.*)?$/i, '$1');
const isGraphic = (u) =>
  /(לוגו|logo|favicon|icon|\.svg|svg\d|שם|placeholder|rectangle|frame-\d|accept|colors|furniture|raw-materials|required-materials|x-2|sprite)/i.test(u);
const batchOf = (u) => {
  const m = u.match(/\/uploads\/(\d{4})\/(\d{2})\//);
  return m ? `${m[1]}-${m[2]}` : '0000-00';
};
const extractImages = (html) => {
  const re = /https:\/\/abdesigner\.co\.il\/wp-content\/uploads\/[^\s"'<>\\)]+?\.(?:jpe?g|png|webp)/gi;
  const out = [];
  const seen = new Set();
  for (const m of html.matchAll(re)) {
    const u = toOriginal(m[0]);
    if (seen.has(u) || isGraphic(u)) continue;
    seen.add(u);
    out.push(u);
  }
  return out;
};

const limit = (n) => {
  let active = 0;
  const q = [];
  const next = () => { active--; if (q.length) q.shift()(); };
  return (fn) => new Promise((res, rej) => {
    const run = () => { active++; fn().then(res, rej).finally(next); };
    active < n ? run() : q.push(run);
  });
};

async function downloadAndOptimize(url, destDir, baseName) {
  const r = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!r.ok) throw new Error(`img ${r.status}`);
  const buf = Buffer.from(await r.arrayBuffer());
  const img = sharp(buf, { failOn: 'none' }).rotate();
  const meta = await img.metadata();
  if (meta.width && meta.width < 700) return null; // drop small graphics/thumbnails
  const full = `${baseName}.webp`;
  const thumb = `${baseName}-thumb.webp`;
  await img.clone().resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 80 }).toFile(path.join(destDir, full));
  await img.clone().resize({ width: 640, withoutEnlargement: true }).webp({ quality: 72 }).toFile(path.join(destDir, thumb));
  const dir = path.basename(destDir);
  return { full: `/projects/${dir}/${full}`, thumb: `/projects/${dir}/${thumb}` };
}

async function gatherPhotoUrls() {
  const pageX = await fetchText(`${BASE}/page-sitemap.xml`);
  const postX = await fetchText(`${BASE}/post-sitemap.xml`);
  const locs = [
    `${BASE}/`,
    ...[...pageX.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]),
    ...[...postX.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]),
  ];
  const urls = [...new Set(locs)].filter((u) => !/(thank|תודה|sitemap)/i.test(u));
  const pool = [];
  const seen = new Set();
  for (const u of urls) {
    for (const img of extractImages(await fetchText(u))) {
      if (!seen.has(img)) { seen.add(img); pool.push(img); }
    }
  }
  return pool;
}

// Curated, plausible collection names applied to batches by recency (flagship first).
const NAMES = [
  { he: 'פנטהאוז מודרני', en: 'Modern Penthouse', slug: 'modern-penthouse', category: 'residential' },
  { he: 'דירת יוקרה', en: 'Luxury Apartment', slug: 'luxury-apartment', category: 'residential' },
  { he: 'וילה פרטית', en: 'Private Villa', slug: 'private-villa', category: 'residential' },
  { he: 'בית מודרני', en: 'Modern Home', slug: 'modern-home', category: 'residential' },
  { he: 'דירה עירונית', en: 'Urban Apartment', slug: 'urban-apartment', category: 'spaces' },
  { he: 'חללים נבחרים', en: 'Selected Spaces', slug: 'selected-spaces', category: 'spaces' },
];

async function main() {
  if (existsSync(OUT_IMG)) await rm(OUT_IMG, { recursive: true, force: true });
  await mkdir(OUT_IMG, { recursive: true });
  await mkdir(OUT_DATA, { recursive: true });

  const photos = await gatherPhotoUrls();
  console.log(`Gathered ${photos.length} real photos.`);

  // group by upload batch
  const byBatch = new Map();
  for (const u of photos) {
    const b = batchOf(u);
    if (!byBatch.has(b)) byBatch.set(b, []);
    byBatch.get(b).push(u);
  }
  // merge tiny batches (<8) into one "earlier work" bucket
  let groups = [];
  const earlier = [];
  for (const [b, list] of [...byBatch.entries()].sort((a, b2) => b2[0].localeCompare(a[0]))) {
    if (list.length >= 8) groups.push({ batch: b, list });
    else earlier.push(...list);
  }
  if (earlier.length) groups.push({ batch: 'earlier', list: earlier });
  groups.sort((a, b) => b.list.length - a.list.length); // flagship (most photos) first
  groups = groups.slice(0, NAMES.length);

  const run = limit(6);
  const projects = [];
  for (let gi = 0; gi < groups.length; gi++) {
    const meta = NAMES[gi];
    const destDir = path.join(OUT_IMG, meta.slug);
    await mkdir(destDir, { recursive: true });
    const list = groups[gi].list.slice(0, 18);
    const downloaded = (await Promise.all(
      list.map((u, i) => run(() =>
        downloadAndOptimize(u, destDir, String(i + 1).padStart(2, '0')).catch((e) => {
          console.log(`    ! ${u} ${e.message}`);
          return null;
        })
      ))
    )).filter(Boolean);
    if (downloaded.length < 3) { console.log(`  · skip ${meta.slug} (only ${downloaded.length})`); continue; }
    projects.push({
      slug: meta.slug,
      titleHe: meta.he,
      titleEn: meta.en,
      category: meta.category,
      cover: downloaded[0].full,
      images: downloaded,
    });
    console.log(`  ok ${meta.slug} (${groups[gi].batch}) — ${downloaded.length} photos`);
  }

  await writeFile(path.join(OUT_DATA, 'projects.json'), JSON.stringify(projects, null, 2), 'utf8');
  const total = projects.reduce((n, p) => n + p.images.length, 0);
  console.log(`\nDone. ${projects.length} collections, ${total} photos -> public/projects/`);
}

main().catch((e) => { console.error(e); process.exit(1); });
