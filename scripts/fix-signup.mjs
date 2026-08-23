import fs from 'fs';

const p = 'app/signup/page.tsx';
let s = fs.readFileSync(p, 'utf8');

s = s.replace('<motion className="min-h-screen', '<TAG className="min-h-screen');
s = s.replace('</motion>', '</TAG>');
s = s.replace(/TAG/g, 'div');
s = s.replace('text-white', 'text-primary');
s = s.replace("from '../../lib/firebase'", "from '@/lib/firebase'");
if (!s.includes('@/components/ui/button')) {
  s = s.replace(
    "import { auth } from '@/lib/firebase';",
    "import { auth } from '@/lib/firebase';\nimport { Button } from '@/components/ui/button';"
  );
}

s = s.replace(
  /<button\s+type="submit"[\s\S]*?<\/button>/,
  `<Button type="submit" variant="gold" className="w-full" disabled={isLoading}>
                {isLoading ? 'Creating account...' : 'Create Account'}
              </Button>`
);

fs.writeFileSync(p, s);
console.log('signup fixed');
