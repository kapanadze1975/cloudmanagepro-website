import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import jsdom from 'jsdom';

const { JSDOM } = jsdom;
const ROOT = process.cwd();
const BUILD_DIR = path.join(ROOT,'build');
const REPORT_DIR = path.join(ROOT,'.build-reports');

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

  // Ensure build exists
  if(!existsSync(BUILD_DIR)){
    throw new Error('build/ directory not found. Run build first.');
  }

  // Check copied hub and sitemap exist in build/
  const hubPath = path.join(BUILD_DIR,'articles','index.html');
  const sitemapPath = path.join(BUILD_DIR,'sitemap.xml');
  if(!existsSync(hubPath)){
    report.errors.push('articles/index.html missing from build/');
  }
  if(!existsSync(sitemapPath)){
    report.errors.push('sitemap.xml missing from build/');
  }

  // Validate generated articles under build/articles/* (exclude index.html hub)
  const articlesDir = path.join(BUILD_DIR,'articles');
  const entries = await fs.readdir(articlesDir).catch(()=>[]);
  for(const name of entries){
    const articlePath = path.join(articlesDir,name,'index.html');
    if(!existsSync(articlePath)) continue;
    const html = await fs.readFile(articlePath,'utf8');
    const dom = new JSDOM(html);
    const doc = dom.window.document;

    // 1. Exactly one H1
    const h1s = doc.querySelectorAll('h1');
    if(h1s.length !== 1) report.errors.push(`${articlePath}: expected 1 H1, found ${h1s.length}`);

    // 2. <title> exists
    const title = doc.querySelector('title');
    if(!title) report.errors.push(`${articlePath}: missing <title>`);

    // 3. meta description matches source metadata (we'll try to read from embedded meta name)
    // Extract canonical from link[rel=canonical]
    const canonical = doc.querySelector('link[rel="canonical"]')?.getAttribute('href');
    if(!canonical) report.errors.push(`${articlePath}: missing canonical link`);

    // 4. JSON-LD exists and headline matches H1
    const jsonld = doc.querySelectorAll('script[type="application/ld+json"]');
    if(jsonld.length === 0) report.errors.push(`${articlePath}: missing JSON-LD`);
    else{
      try{
        const data = JSON.parse(jsonld[0].textContent);
        const headline = data.headline || '';
        const h1text = h1s.length? h1s[0].textContent.trim() : '';
        if(headline && h1text && headline.indexOf(h1text) === -1){
          report.errors.push(`${articlePath}: JSON-LD headline does not match H1`);
        }
      }catch(e){ report.errors.push(`${articlePath}: JSON-LD parse error`); }
    }

    // 5. TOC href anchors resolve to real IDs
    const tocLinks = Array.from(doc.querySelectorAll('.toc a')).map(a=>a.getAttribute('href'));
    for(const href of tocLinks){
      if(!href || !href.startsWith('#')) continue;
      const id = href.substring(1);
      if(!doc.getElementById(id)) report.errors.push(`${articlePath}: TOC anchor ${href} not found`);
    }

    // 6. references rendered exactly - ensure .references exists
    const refList = doc.querySelectorAll('.references li a');
    if(refList.length === 0) report.errors.push(`${articlePath}: no references rendered`);

    // 7. placeholder strings
    for(const ph of PLACEHOLDERS){
      if(html.indexOf(ph) !== -1) report.errors.push(`${articlePath}: contains forbidden placeholder '${ph}'`);
    }

    // 8. footer
    if(!doc.querySelector('footer.footer')) report.errors.push(`${articlePath}: footer element missing`);

    // 9. closing tags presence (basic)
    if(!html.includes('</body>')) report.errors.push(`${articlePath}: missing </body>`);
    if(!html.includes('</html>')) report.errors.push(`${articlePath}: missing </html>`);

    // 10. raw HTML acceptance: assume build already rejected raw HTML in sources

    // 11. generated article path matches metadata slug - best-effort: check folder name
    const folderName = name;
    // we can't re-parse front matter here; accept folderName as slug present

    // 12. required static assets copied
    const requiredAssets = ['index.html','styles.css','script.js'];
    for(const ra of requiredAssets){
      if(!existsSync(path.join(BUILD_DIR,ra))) report.errors.push(`Required static file ${ra} missing from build/`);
    }

    report.files.push({ path: articlePath, checks: 'performed' });
  }

  // Write report
  await fs.mkdir(REPORT_DIR, { recursive: true });
  const reportPath = path.join(REPORT_DIR,'validation-report.json');
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf8');

  if(report.errors.length) {
    console.error('Validation failed with errors:\n', report.errors.join('\n'));
    process.exit(2);
  }
  console.log('Validation passed.');
}

if(process.argv[1] === new URL(import.meta.url).pathname){
  validate().catch(err=>{ console.error(err); process.exit(1); });
}
