import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'node:url';
import jsdom from 'jsdom';

const { JSDOM } = jsdom;
const ROOT = process.cwd();
const BUILD_DIR = path.join(ROOT,'build');
const REPORT_DIR = path.join(ROOT,'.build-reports');
const MANIFEST_PATH = path.join(REPORT_DIR,'manifest.json');
const HUB_CONFIG = path.join(ROOT,'config','articles-hub.json');

const PLACEHOLDERS = [
  '(remaining content unchanged)',
  'remaining content unchanged',
  'PLACEHOLDER',
  'INSERT HERE',
  'omitted for brevity',
  'rest unchanged'
];

function fail(msg){
  return { ok:false, message: msg };
}
function pass(){ return { ok:true }; }

async function validate(){
  const report = { files: [], errors: [] };

  if(!existsSync(BUILD_DIR)){
    throw new Error('build/ directory not found. Run build first.');
  }

  const hubPath = path.join(BUILD_DIR,'articles','index.html');
  const sitemapPath = path.join(BUILD_DIR,'sitemap.xml');
  if(!existsSync(hubPath)){
    report.errors.push('build/articles/index.html missing from build/');
  }
  if(!existsSync(sitemapPath)){
    report.errors.push('sitemap.xml missing from build/');
  }

  if(!existsSync(MANIFEST_PATH)){
    throw new Error('.build-reports/manifest.json not found. Run build first to produce manifest.');
  }
  const manifestText = await fs.readFile(MANIFEST_PATH,'utf8');
  let manifest = [];
  try{ manifest = JSON.parse(manifestText); }catch(e){ throw new Error('Invalid JSON in .build-reports/manifest.json'); }

  // load hub config for coming_soon validation
  let hubConfig = { coming_soon: [] };
  if(existsSync(HUB_CONFIG)){
    try{ hubConfig = JSON.parse(await fs.readFile(HUB_CONFIG,'utf8')); }catch(e){}
  }

  const generatedSlugs = new Set();
  for(const entry of manifest){
    if(!entry || !entry.generated) continue;
    const genPath = path.resolve(entry.generated);
    const rel = path.relative(BUILD_DIR, genPath);
    const parts = rel.split(path.sep);
    if(parts.length >= 3 && parts[0] === 'articles'){
      const slug = parts[1];
      generatedSlugs.add(slug);
    }
  }

  // Validate generated articles
  for(const slug of generatedSlugs){
    const articlePath = path.join(BUILD_DIR,'articles',slug,'index.html');
    if(!existsSync(articlePath)){
      report.errors.push(`${articlePath}: generated article missing from build output`);
      continue;
    }
    const html = await fs.readFile(articlePath,'utf8');
    const dom = new JSDOM(html);
    const doc = dom.window.document;

    const h1s = doc.querySelectorAll('h1');
    if(h1s.length !== 1) report.errors.push(`${articlePath}: expected 1 H1, found ${h1s.length}`);
    const title = doc.querySelector('title'); if(!title) report.errors.push(`${articlePath}: missing <title>`);
    const canonical = doc.querySelector('link[rel="canonical"]')?.getAttribute('href'); if(!canonical) report.errors.push(`${articlePath}: missing canonical link`);
    const jsonld = doc.querySelectorAll('script[type="application/ld+json"]');
    if(jsonld.length === 0) report.errors.push(`${articlePath}: missing JSON-LD`);
    else{
      try{ const data = JSON.parse(jsonld[0].textContent); const headline = data.headline || ''; const h1text = h1s.length? h1s[0].textContent.trim() : ''; if(headline && h1text && headline.indexOf(h1text) === -1){ report.errors.push(`${articlePath}: JSON-LD headline does not match H1`); } }catch(e){ report.errors.push(`${articlePath}: JSON-LD parse error`); }
    }
    const tocLinks = Array.from(doc.querySelectorAll('.toc a')).map(a=>a.getAttribute('href'));
    for(const href of tocLinks){ if(!href || !href.startsWith('#')) continue; const id = href.substring(1); if(!doc.getElementById(id)) report.errors.push(`${articlePath}: TOC anchor ${href} not found`); }
    const refList = doc.querySelectorAll('.references li a'); if(refList.length === 0) report.errors.push(`${articlePath}: no references rendered`);
    for(const ph of PLACEHOLDERS){ if(html.indexOf(ph) !== -1) report.errors.push(`${articlePath}: contains forbidden placeholder '${ph}'`); }
    if(!doc.querySelector('footer.footer')) report.errors.push(`${articlePath}: footer element missing`);
    if(!html.includes('</body>')) report.errors.push(`${articlePath}: missing </body>`);
    if(!html.includes('</html>')) report.errors.push(`${articlePath}: missing </html>`);
    report.files.push({ path: articlePath, checks: 'performed' });
  }

  // Validate generated hub
  if(existsSync(path.join(BUILD_DIR,'articles','index.html'))){
    const hubHtml = await fs.readFile(path.join(BUILD_DIR,'articles','index.html'),'utf8');
    const dom = new JSDOM(hubHtml); const doc = dom.window.document;
    // 1. exactly one featured within main column
    const featured = doc.querySelectorAll('.main-column article.featured');
    if(featured.length !== 1) report.errors.push(`build/articles/index.html: expected 1 featured article in main column, found ${featured.length}`);
    // 2. every generated article appears in hub exactly once (count only within main column to avoid counting sidebar/navigation links)
    const main = doc.querySelector('.main-column') || doc;
    for(const slug of generatedSlugs){
      const selector = `a[href="/articles/${slug}/"]`;
      const links = main.querySelectorAll(selector);
      if(links.length === 0) report.errors.push(`build/articles/index.html: missing link to /articles/${slug}/`);
      if(links.length > 1) report.errors.push(`build/articles/index.html: duplicate links to /articles/${slug}/ found in main column (${links.length})`);
    }
    // 3. coming soon cards present in main grid and count matches config
    const comingCards = Array.from(main.querySelectorAll('.article-card')).filter(el=>!!el.querySelector('.soon'));
    const expectedComing = (hubConfig.coming_soon && hubConfig.coming_soon.length) || 0;
    if(comingCards.length !== expectedComing) report.errors.push(`build/articles/index.html: expected ${expectedComing} Coming soon cards in main grid, found ${comingCards.length}`);
    // 3b. verify each coming soon title present
    const comingTitles = comingCards.map(c=>{ const h = c.querySelector('h3'); return h? h.textContent.trim(): ''; });
    const missingTitles = [];
    for(const cs of (hubConfig.coming_soon||[])){
      if(!comingTitles.includes(cs.title)) missingTitles.push(cs.title);
    }
    if(missingTitles.length) report.errors.push(`build/articles/index.html: missing Coming soon titles: ${missingTitles.join('; ')}`);

    // 4. category buttons exist (scoped to categoryButtons container)
    const catContainer = doc.querySelector('#categoryButtons');
    const catBtns = catContainer ? catContainer.querySelectorAll('.category-btn') : doc.querySelectorAll('.category-btn');
    if(catBtns.length === 0) report.errors.push('build/articles/index.html: category buttons missing');

    // 5. search input present and search JS exists
    const searchInput = doc.getElementById('articleSearch');
    if(!searchInput) report.errors.push('build/articles/index.html: search input #articleSearch missing');
    const hasApplyFilters = hubHtml.indexOf('function applyFilters') !== -1 || hubHtml.indexOf('applyFilters(') !== -1;
    if(!hasApplyFilters) report.errors.push('build/articles/index.html: search/filter JS not present');

    // 6. no ai.azure.com links
    if(hubHtml.indexOf('ai.azure.com') !== -1) report.errors.push('build/articles/index.html: contains ai.azure.com links');
    // 7. placeholders
    for(const ph of PLACEHOLDERS){ if(hubHtml.indexOf(ph) !== -1) report.errors.push(`build/articles/index.html: contains forbidden placeholder '${ph}'`); }
  }

  // Basic static checks
  const requiredAssets = ['index.html','styles.css','script.js'];
  for(const ra of requiredAssets){ if(!existsSync(path.join(BUILD_DIR,ra))) report.errors.push(`Required static file ${ra} missing from build/`); }

  // Write report
  await fs.mkdir(REPORT_DIR, { recursive: true });
  const reportPath = path.join(REPORT_DIR,'validation-report.json');
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf8');

  if(report.errors.length) { console.error('Validation failed with errors:\n', report.errors.join('\n')); process.exit(2); }
  console.log('Validation passed.');
}

const currentFile = fileURLToPath(import.meta.url);
if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(currentFile)
) {
  validate().catch(err => { console.error(err); process.exit(1); });
}
