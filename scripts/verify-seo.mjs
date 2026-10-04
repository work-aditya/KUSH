import fs from 'fs';

console.log('--- Verifying SEO Artifacts for https://coachkush.in/ ---');

// 1. Check robots.txt
const robots = fs.readFileSync('dist/robots.txt', 'utf8');
console.log('1. dist/robots.txt exists. Length:', robots.length);
if (!robots.includes('Sitemap: https://coachkush.in/sitemap.xml')) {
  throw new Error('robots.txt missing sitemap link for coachkush.in!');
}
if (!robots.includes('Disallow: /admin')) {
  throw new Error('robots.txt missing Disallow /admin!');
}
console.log('   robots.txt verified successfully.');

// 2. Check sitemap.xml
const sitemap = fs.readFileSync('dist/sitemap.xml', 'utf8');
console.log('2. dist/sitemap.xml exists. Length:', sitemap.length);
if (!sitemap.includes('https://coachkush.in/')) {
  throw new Error('sitemap missing production domain https://coachkush.in/!');
}
if (sitemap.includes('cochkush.in')) {
  throw new Error('sitemap contains legacy typo domain cochkush.in!');
}
if (sitemap.includes('coachkush.com')) {
  throw new Error('sitemap contains coachkush.com instead of coachkush.in!');
}
console.log('   sitemap.xml verified successfully.');

// 3. Check dist/index.html
const indexHtml = fs.readFileSync('dist/index.html', 'utf8');
console.log('3. dist/index.html exists. Length:', indexHtml.length);
if (!indexHtml.includes('<title>Coach Kush | Online Fitness Coach & Virtual Coaching | coachkush.in</title>')) {
  throw new Error('index.html missing primary SEO title!');
}
if (!indexHtml.includes('https://coachkush.in/')) {
  throw new Error('index.html missing canonical URL for https://coachkush.in/!');
}
if (indexHtml.includes('cochkush.in')) {
  throw new Error('index.html still has typo domain cochkush.in!');
}

const match = indexHtml.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
if (!match) {
  throw new Error('No JSON-LD structured data found in index.html!');
}
const jsonLd = JSON.parse(match[1]);
console.log('   JSON-LD parsed successfully! Context:', jsonLd['@context']);
console.log('   Graph entities:', jsonLd['@graph'].map(e => `${e['@type']} (${e.name || e.jobTitle})`));

console.log('--- All SEO checks passed for https://coachkush.in/! ---');
