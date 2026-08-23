import fs from 'fs';
import path from 'path';

function walk(dir) {
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walk(p));
    else if (ent.name.endsWith('.tsx')) out.push(p);
  }
  return out;
}

const files = walk(path.join(process.cwd(), 'app')).filter((f) => !f.includes('login') && !f.includes('page.tsx') === false);

const replacements = [
  [/hover:bg-gray-50/g, 'hover:bg-muted/50'],
  [/bg-gray-50 rounded/g, 'bg-muted/50 rounded'],
  [/bg-gray-50 hover:bg-gray-100/g, 'bg-muted/30 hover:bg-muted/50'],
  [/min-h-screen bg-gray-50/g, ''],
  [/border-gray-200/g, 'border-border'],
  [/border-gray-300/g, 'border-input'],
  [/text-gray-900/g, 'text-foreground'],
  [/text-gray-700/g, 'text-foreground'],
  [/text-gray-600/g, 'text-muted-foreground'],
  [/text-gray-500/g, 'text-muted-foreground'],
  [/text-gray-400/g, 'text-muted-foreground'],
  [/bg-white/g, 'bg-card'],
  [/bg-blue-100/g, 'bg-primary/10'],
  [/text-blue-600/g, 'text-primary'],
  [/text-blue-800/g, 'text-primary'],
  [/hover:text-blue-800/g, 'hover:text-primary/80'],
  [/hover:text-blue-700/g, 'hover:text-primary/80'],
  [/focus:ring-blue-500/g, 'focus:ring-ring'],
  [/focus:border-blue-500/g, 'focus:border-ring'],
  [
    /bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors/g,
    'bg-accent text-primary font-semibold rounded-md hover:bg-accent/90 transition-all duration-200',
  ],
  [
    /text-white bg-blue-600 hover:bg-blue-700/g,
    'bg-accent text-primary font-semibold hover:bg-accent/90',
  ],
  [/bg-blue-600 hover:bg-blue-700/g, 'bg-accent text-primary hover:bg-accent/90'],
  [/bg-blue-600 rounded-full/g, 'bg-accent rounded-full'],
  [/border-b-2 border-blue-600/g, 'border-b-2 border-accent'],
];

for (const file of files) {
  let s = fs.readFileSync(file, 'utf8');
  const before = s;
  for (const [from, to] of replacements) {
    s = s.replace(from, to);
  }
  if (s !== before) {
    fs.writeFileSync(file, s);
    console.log('Updated', path.relative(process.cwd(), file));
  }
}
