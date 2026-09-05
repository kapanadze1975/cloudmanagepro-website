import fs from 'fs/promises';
import {existsSync, createReadStream} from 'fs';
import path from 'path';
import crypto from 'crypto';
import matter from 'gray-matter';
import {marked} from 'marked';
import mustache from 'mustache';

const ROOT = process.cwd();
const BUILD_DIR = path.join(ROOT, 'build');
const REPORT_DIR = path.join(ROOT, '.build-reports');
const CONTENT_DIR = path.join(ROOT, 'content', 'articles');
const TEMPLATE_PATH = path.join(ROOT, 'templates', 'article.html');

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

function generateHeadingId(text){
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g,'').trim().replace(/\s+/g,'-');
}

async function build(){
  // 1. clean/create build/
  await rmrf(BUILD_DIR);
  await ensureDir(BUILD_DIR);
  await ensureDir(REPORT_DIR);

  // 2. copy only allowlist items
  await copyAllowed();

  // 3. load template
  if(!existsSync(TEMPLATE_PATH)){
    throw new Error('Template not found: '+TEMPLATE_PATH);
  }
  const template = await fs.readFile(TEMPLATE_PATH,'utf8');

  // 4. process markdown files
  const manifest = [];
  const files = await fs.readdir(CONTENT_DIR).catch(()=>[]);
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

    // Disallow raw HTML in markdown body
    if(detectRawHtml(content)){
      throw new Error(`Raw HTML detected in Markdown body of ${f}; raw HTML is disallowed in Phase 1`);
    }

    // Convert Markdown to HTML
    const renderer = new marked.Renderer();
    const headings = [];
    renderer.heading = function(text, level, raw, slugger){
      if(level === 2 || level === 3){
        const id = generateHeadingId(text);
        headings.push({ level, text, id });
        return `<h${level} id="${id}">${text}</h${level}>`;
      }
      return `<h${level}>${text}</h${level}>`;
    };
    const htmlBody = marked(content, { renderer });

    // Build TOC from headings
    const toc = headings.map(h => ({ href:`#${h.id}`, text: h.text, level: h.level }));

    // Render references from metadata
    const references = data.references || [];

    // Prepare template view
    const view = {
      title: data.title,
      seo_title: data.seo_title,
      description: data.meta_description || data.description,
      canonical: data.canonical,
      og_title: data.seo_title,
      hero_kicker: data.hero.kicker,
      hero_dek: data.hero.dek,
      hero_screen_label: data.hero.screen_label,
      hero_cloud_label: data.hero.cloud_label,
      hero_verified: data.verified_date ? `Last verified: ${data.verified_date}` : '',
      article_body: htmlBody,
      toc: toc,
      references: references,
      category: data.category,
      platform: data.platform,
      level: data.level,
      author: data.author
    };

    const outHtml = mustache.render(template, view);

    // Write to build/articles/<slug>/index.html
    const outDir = path.join(BUILD_DIR,'articles',data.slug);
    await ensureDir(outDir);
    const outPath = path.join(outDir,'index.html');
    await fs.writeFile(outPath, outHtml, 'utf8');

    // Add to manifest
    const checksum = sha256(outHtml);
    manifest.push({ source: srcPath, generated: outPath, canonical: data.canonical, sha256: checksum });
  }

  // Write manifest in .build-reports/ (not in build/)
  const manifestPath = path.join(REPORT_DIR,'manifest.json');
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');

  console.log('Build complete. Generated', manifest.length, 'articles.');
}

if(process.argv[1] === new URL(import.meta.url).pathname){
  build().catch(err=>{ console.error(err); process.exit(1); });
}
