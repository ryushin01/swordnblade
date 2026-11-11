/**
 * 도검별 공유 이미지(1200×630 JPG)를 public/og/swords/에 만듭니다.
 * 부조 그림은 SVG 필터를 쓰므로 실제 브라우저로 그려 저장합니다. 시드 도검이 바뀌면 다시 돌립니다.
 *
 * 프로덕션 서버를 띄운 뒤 실행합니다: node scripts/generate-og.mjs http://localhost:3101
 */
import { chromium } from '@playwright/test';

const base = process.argv[2] ?? 'http://localhost:3101';
const sitemap = await (await fetch(`${base}/sitemap.xml`)).text();
const slugs = [...sitemap.matchAll(/<loc>[^<]*?\/swords\/([^<]+)<\/loc>/g)].map((match) => match[1]);
const unique = [...new Set(slugs)];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });

for (const slug of unique) {
  await page.goto(`${base}/swords/${slug}`);
  await page.locator('main svg[role="img"]').first().waitFor();
  await page.evaluate(() => {
    const svg = document.querySelector('main svg[role="img"]');
    const name = document.querySelector('main h1')?.textContent ?? '';
    const english = document.querySelector('main h1 + p, main [lang="en"]')?.textContent ?? '';
    svg.removeAttribute('class');
    svg.style.cssText = 'width:600px;height:600px;flex:none';
    const wrap = document.createElement('div');
    wrap.style.cssText =
      'position:fixed;inset:0;z-index:9999;display:flex;align-items:center;gap:32px;padding:0 64px;background:#dddcd7;color:#2b2926';
    const text = document.createElement('div');
    text.style.cssText = 'display:grid;gap:16px;min-width:0';
    text.innerHTML = '<p style="font-size:22px;letter-spacing:.2em">SWORD &amp; BLADE</p>';
    const title = document.createElement('p');
    title.style.cssText = 'font-size:72px;line-height:1.15;word-break:keep-all';
    title.textContent = name;
    const sub = document.createElement('p');
    sub.style.cssText = 'font-size:24px;letter-spacing:.12em;text-transform:uppercase;opacity:.7';
    sub.textContent = english;
    text.append(title, sub);
    wrap.append(svg, text);
    document.body.append(wrap);
  });
  await page.screenshot({ path: `public/og/swords/${slug}.jpg`, type: 'jpeg', quality: 72 });
}
await browser.close();
console.log(`${unique.length}개 이미지를 만들었습니다.`);
