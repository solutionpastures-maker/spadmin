import fs from 'fs';
import path from 'path';

function patch(file, transforms) {
  let s = fs.readFileSync(file, 'utf8');
  for (const [from, to] of transforms) {
    if (typeof from === 'string') {
      if (!s.includes(from)) console.warn('Missing in', file, from.slice(0, 40));
      s = s.split(from).join(to);
    } else {
      s = s.replace(from, to);
    }
  }
  fs.writeFileSync(file, s);
  console.log('Patched', path.relative(process.cwd(), file));
}

const imports = `import { PageHeader } from '@/components/page-header';
import { LoadingScreen } from '@/components/loading-screen';
import { Button } from '@/components/ui/button';
`;

const loadingOld = `  if (isLoading) {
    return (
      <div className=" flex items-center justify-center">
        <motion className="text-center">
          <motion className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></motion>
          <p className="mt-4 text-muted-foreground">`;

// Use regex patch per file instead
const pages = [
  {
    file: 'app/announcements/page.tsx',
    title: 'Announcements',
    desc: 'Manage church announcements',
    loadingMsg: 'Loading announcements...',
    newHref: '/announcements/new',
    newLabel: 'New Announcement',
    icon: 'Megaphone',
    headerEnd: '</header>\n\n      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">',
    mainEnd: '      </main>\n    </div>',
  },
];

for (const p of pages) {
  const file = path.join(process.cwd(), p.file);
  let s = fs.readFileSync(file, 'utf8');

  if (!s.includes('PageHeader')) {
    s = s.replace(/^'use client';\n\n/, `'use client';\n\n${imports}`);
  }

  s = s.replace(
    /if \(isLoading\) \{[\s\S]*?\n  \}\n\n  return \(\n    <div className="">\n      \{\/\* Header \*\/\}[\s\S]*?<\/header>\n\n      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">/,
    `if (isLoading) {
    return <LoadingScreen message="${p.loadingMsg}" />;
  }

  return (
    <>
      <PageHeader
        title="${p.title}"
        description="${p.desc}"
        icon={${p.icon}}
        action={
          <>
            <Button type="button" variant="outline" size="sm" onClick={handleRefresh} disabled={isRefetching}>
              <RefreshCw size={16} className={isRefetching ? 'animate-spin' : ''} />
              Refresh
            </Button>
            <Button variant="gold" asChild>
              <Link href="${p.newHref}">
                <Plus size={16} />
                ${p.newLabel}
              </Link>
            </Button>
          </>
        }
      />
      <WRAPPER>`
  );

  s = s.replace(/\n      <\/main>\n    <\/div>\n  \);/, '\n    </>\n  );');
  s = s.replace(/<WRAPPER>/g, '<' + 'div>').replace(/<\/WRAPPER>/g, '</' + 'motion>').replace(/<\/motion>/g, '</' + 'motion>'.replace('motion', 'motion'));

  fs.writeFileSync(file, s);
}

console.log('done');
