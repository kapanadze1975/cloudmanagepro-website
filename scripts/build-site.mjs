import fs from 'fs/promises';
import {existsSync, createReadStream} from 'fs';
import path from 'path';
import { fileURLToPath } from 'node:url';
import crypto from 'crypto';
import matter from 'gray-matter';
import {marked} from 'marked';
import mustache from 'mustache';

const ROOT = process.cwd();
const BUILD_DIR = path.join(ROOT, 'build');
const REPORT_DIR = path.join(ROOT, '.build-reports');
const CONTENT_DIR = path.join(ROOT, 'content', 'articles');
const TEMPLATE_PATH = path.join(ROOT, 'templates', 'article.html');
const HUB_TEMPLATE_PATH = path.join(ROOT, 'templates', 'articles-index.html');
const HUB_CONFIG_PATH = path.join(ROOT, 'config', 'articles-hub.json');
const LEGACY_HUB_SOURCE = path.join(ROOT, 'articles', 'index.html');

// Public allowlist (explicit)
const ALLOWLIST = [
  'index.html',
  'styles.css',
  'script.js',
  'assets',
  'articles',
  'sitemap.xml',
  'staticwebapp.config.json'
];

async function rmrf(p){
  try{ await fs.rm(p, { recursive: true, force: true }); }catch(e){}
}

async function ensureDir(p){
  await fs.mkdir(p, { recursive: true });
}

async function copyAllowed(){
  for(const item of ALLOWLIST){
    const src = path.join(ROOT, item);
    if(!existsSync(src)) continue;
    const dest = path.join(BUILD_DIR, item);
    const stat = await fs.stat(src).catch(()=>null);
    if(!stat) continue;
    if(stat.isDirectory()){
      await copyDir(src, dest);
    } else {
      await ensureDir(path.dirname(dest));
      await fs.copyFile(src, dest);
    }
  }
}

async function copyDir(src, dest){
  await ensureDir(dest);
  const entries = await fs.readdir(src, { withFileTypes: true });
  for(const entry of entries){
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if(entry.isDirectory()){
      await copyDir(s,d);
    } else if(entry.isFile()){
      await fs.copyFile(s,d);
    }
  }
}

function sha256(content){
  return crypto.createHash('sha256').update(content,'utf8').digest('hex');
}

function detectRawHtml(markdown){
  // simple detection of raw HTML tags at line start
  const pattern = /<[^>]+>/m;
  return pattern.test(markdown);
}

function generateBaseId(text){
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g,'').trim().replace(/\s+/g,'-');
}

function mapCategoryToken(cat){
  if(!cat) return 'other';
  const c = String(cat).toLowerCase();
  if(c.includes('intune')) return 'intune';
  if(c.includes('azure')) return 'azure';
  if(c.includes('entra')) return 'entra';
  if(c.includes('microsoft 365') || c === 'm365' || c.includes('m365')) return 'm365';
  if(c.includes('workspace')) return 'workspace';
  if(c.includes('citrix')) return 'citrix';
  if(c.includes('network')) return 'networking';
  if(c.includes('security') || c.includes('cyber')) return 'security';
  if(c.includes('ai')) return 'ai';
  return c.replace(/[^a-z0-9]+/g,'-');
}

async function build(){
  // 1. clean/create build/
  await rmrf(BUILD_DIR);
  await ensureDir(BUILD_DIR);
  await ensureDir(REPORT_DIR);

  // 2. copy only allowlist items
  await copyAllowed();

  // 3. load article template
  if(!existsSync(TEMPLATE_PATH)){
    throw new Error('Template not found: '+TEMPLATE_PATH);
  }
  const template = await fs.readFile(TEMPLATE_PATH,'utf8');

  // 4. process markdown files into article pages
  const manifest = [];
  const files = await fs.readdir(CONTENT_DIR).catch(()=>[]);
  const articlesMeta = [];
  for(const f of files){
    if(!f.endsWith('.md')) continue;
    const srcPath = path.join(CONTENT_DIR,f);
    const srcText = await fs.readFile(srcPath,'utf8');
    const { data, content } = matter(srcText);

    // Validate required metadata
    const required = ['title','seo_title','slug','description','canonical','category','platform','level','author','verified_date','hero','references'];
    for(const r of required){
      if(typeof data[r] === 'undefined'){
        throw new Error(`Missing required metadata '${r}' in ${f}`);
      }
    }

    if(detectRawHtml(content)){
      throw new Error(`Raw HTML detected in Markdown body of ${f}; raw HTML is disallowed in Phase 1`);
    }

    // Convert Markdown to HTML with deterministic heading IDs
    const headings = [];
    const idCounts = Object.create(null);
    const renderer = new marked.Renderer();
    renderer.heading = function(text, level, raw, slugger){
      if(level === 2 || level === 3){
        let base = generateBaseId(text);
        if(!base) base = 'section';
        const count = (idCounts[base] || 0) + 1;
        idCounts[base] = count;
        const id = count === 1 ? base : `${base}-${count}`;
        headings.push({ level, text, id });
        return `<h${level} id="${id}">${text}</h${level}>`;
      }
      return `<h${level}>${text}</h${level}>`;
    };
    const htmlBody = marked(content, { renderer });

    // Build TOC HTML
    function buildTocHtml(headings){
      let html = '<ul class="toc">\n';
      for(const h of headings){
        const cls = h.level === 3 ? ' class="toc-sub"' : '';
        html += `  <li${cls}><a href="#${h.id}">${escapeHtml(h.text)}</a></li>\n`;
      }
      html += '</ul>\n';
      return html;
    }
    const toc_html = buildTocHtml(headings);

    // Render references
    const refs = data.references || [];
    function buildReferencesHtml(refs){
      let html = '<ul class="references">\n';
      for(const r of refs){
        if(typeof r === 'string'){
          const url = r; html += `  <li><a href="${escapeHtml(url)}">${escapeHtml(url)}</a></li>\n`;
        } else if(r && typeof r === 'object'){
          if(typeof r.url !== 'string' || !r.url.trim()){
            throw new Error(`Invalid reference object (missing url) in ${f}: ${JSON.stringify(r)}`);
          }
          const url = r.url; const label = (typeof r.label === 'string' && r.label.trim())? r.label : r.url;
          html += `  <li><a href="${escapeHtml(url)}">${escapeHtml(label)}</a></li>\n`;
        } else {
          throw new Error(`Invalid reference entry in ${f}: must be string or object`);
        }
      }
      html += '</ul>\n'; return html;
    }
    const references_html = buildReferencesHtml(refs);

    // JSON-LD
    const jsonLdObj = { '@context': 'https://schema.org', '@type': 'TechArticle', headline: data.title, description: data.description, author: { '@type': 'Organization', name: data.author }, dateModified: data.verified_date, mainEntityOfPage: data.canonical };
    const jsonld = `<script type="application/ld+json">\n${JSON.stringify(jsonLdObj, null, 2)}\n</script>`;

    const view = { title: data.title, seo_title: data.seo_title, description: data.meta_description || data.description, canonical: data.canonical, category: data.category, platform: data.platform, level: data.level, author: data.author, verified_date: data.verified_date, hero: { kicker: data.hero.kicker, dek: data.hero.dek, screen_label: data.hero.screen_label, cloud_label: data.hero.cloud_label }, article_html: htmlBody, toc_html: toc_html, references_html: references_html, jsonld: jsonld };

    const outHtml = mustache.render(template, view);
    const outDir = path.join(BUILD_DIR,'articles',data.slug);
    await ensureDir(outDir);
    const outPath = path.join(outDir,'index.html');
    await fs.writeFile(outPath, outHtml, 'utf8');

    manifest.push({ source: srcPath, generated: outPath, canonical: data.canonical, sha256: sha256(outHtml) });

    // Collect metadata for hub
    articlesMeta.push({
      title: data.title,
      slug: data.slug,
      description: data.description,
      canonical: data.canonical,
      category: data.category,
      platform: data.platform,
      level: data.level,
      tags: data.tags || [],
      verified_date: data.verified_date
    });
  }

  // Generate hub/index.html from template + config + articlesMeta
  let hubTemplate = '';
  if(existsSync(HUB_TEMPLATE_PATH)){
    hubTemplate = await fs.readFile(HUB_TEMPLATE_PATH,'utf8');
  } else {
    throw new Error('Hub template missing: '+HUB_TEMPLATE_PATH);
  }
  const hubConfig = existsSync(HUB_CONFIG_PATH) ? JSON.parse(await fs.readFile(HUB_CONFIG_PATH,'utf8')) : { featured_slug: null, categories: [], coming_soon: [] };

  // Build featured_html from featured_slug
  function buildFeaturedHtml(featuredMeta){
    if(!featuredMeta) return '';
    // replicate existing featured markup (simplified, using same classes)
    return `<article class="featured searchable" data-category="${mapCategoryToken(featuredMeta.category)}" data-search="${escapeHtml((featuredMeta.title+' '+featuredMeta.slug+' '+(featuredMeta.tags||[]).join(' ')).toLowerCase())}">\n<div class="featured-copy">\n  <div class="feature-top"><span class="feature-label">FEATURED</span><span>${escapeHtml(featuredMeta.category)}</span></div>\n  <h2>${escapeHtml(featuredMeta.title)}</h2>\n  <p>${escapeHtml(featuredMeta.description)}</p>\n  <div class="feature-meta"><span>Technical guide</span><span>•</span><span>${escapeHtml(featuredMeta.level)}</span></div>\n  <a class="feature-cta" href="/articles/${escapeHtml(featuredMeta.slug)}/">Read article →</a>\n</div>\n<div class="feature-visual" aria-hidden="true">\n  <div class="feature-laptop"><div class="feature-screen"><span class="check">✓</span><span>Verified</span></div></div>\n</div>\n</article>`;
  }

  // Build article cards
  function buildArticleCard(meta){
    const catToken = mapCategoryToken(meta.category);
    const dataSearch = escapeHtml((meta.title+' '+meta.slug+' '+meta.tags.join(' ')+' '+meta.description).toLowerCase());
    return `<article class="article-card searchable" data-category="${catToken}" data-search="${dataSearch}">\n  <div class="card-art"><img src="/assets/icon-cloud.svg" alt="" /></div>\n  <div><span class="card-category">${escapeHtml(meta.category)}</span><h3>${escapeHtml(meta.title)}</h3><p>${escapeHtml(meta.description)}</p></div>\n  <div class="card-meta"><a class="feature-cta" href="/articles/${escapeHtml(meta.slug)}/">Read article →</a> · ${escapeHtml(meta.platform)}</div>\n</article>`;
  }

  // Find featured article meta
  const featuredMeta = articlesMeta.find(a=>a.slug===hubConfig.featured_slug) || articlesMeta[0] || null;
  const featured_html = buildFeaturedHtml(featuredMeta);

  // Build cards: include published articles (all) BUT exclude featured
  let article_cards_html = '';
  for(const m of articlesMeta){
    if(featuredMeta && m.slug === featuredMeta.slug) continue; // exclude featured from normal grid
    article_cards_html += buildArticleCard(m)+'\n\n';
  }

  // Build sidebar_html preserving existing sidebar from legacy hub if available
  let sidebar_html = '';
  if(existsSync(LEGACY_HUB_SOURCE)){
    const legacy = await fs.readFile(LEGACY_HUB_SOURCE,'utf8');
    // extract <aside class="sidebar">...</aside>
    const start = legacy.indexOf('<aside class="sidebar">');
    const end = legacy.indexOf('</aside>', start);
    if(start !== -1 && end !== -1){
      sidebar_html = legacy.substring(start, end+8);
    }
  }

  // header/footer: extract from legacy hub
  let header_html = '';
  let footer_html = '';
  if(existsSync(LEGACY_HUB_SOURCE)){
    const legacy = await fs.readFile(LEGACY_HUB_SOURCE,'utf8');
    const headerEnd = legacy.indexOf('<main>');
    if(headerEnd !== -1) header_html = legacy.substring(0, headerEnd);
    const footerStart = legacy.indexOf('<footer');
    if(footerStart !== -1) footer_html = legacy.substring(footerStart);
  }

  const hubView = { header_html, featured_html, article_cards_html, sidebar_html, footer_html, categories: hubConfig.categories };
  const hubOut = mustache.render(hubTemplate, hubView);
  const hubOutPath = path.join(BUILD_DIR,'articles','index.html');
  await ensureDir(path.dirname(hubOutPath));
  await fs.writeFile(hubOutPath, hubOut, 'utf8');

  // Write manifest
  const manifestPath = path.join(REPORT_DIR,'manifest.json');
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');

  console.log('Build complete. Generated', manifest.length, 'articles and hub.');
}

function escapeHtml(s){
  return String(s)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#39;');
}

const currentFile = fileURLToPath(import.meta.url);
if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(currentFile)
) {
  build().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
