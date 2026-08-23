import fs from 'fs';
import path from 'path';

const files = [
  'app/series/new/page.tsx',
  'app/series/[seriesId]/episodes/page.tsx',
  'app/series/[seriesId]/episodes/new/page.tsx',
  'app/announcements/new/page.tsx',
  'app/devotionals/new/page.tsx',
];

for (const f of files) {
  let s = fs.readFileSync(f, 'utf8');
  s = s.replace(/return \(\s*<div className="">\s*/, 'return (\n    <>\n      ');
  s = s.replace(/\s*<\/main>\s*<\/motion>\s*\);/, '\n    </>\n  );');
  s = s.replace(/\s*<\/main>\s*<\/div>\s*\);/, '\n    </>\n  );');
  s = s.replace(/<div className="">\s*{\/\* Header \*\/}[\s\S]*?<\/header>\s*/m, '');
  fs.writeFileSync(f, s);
  console.log('fixed', f);
}
