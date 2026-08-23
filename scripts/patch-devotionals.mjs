import fs from 'fs';

const f = 'app/devotionals/page.tsx';
let s = fs.readFileSync(f, 'utf8');

if (!s.includes('PageHeader')) {
  s = s.replace(
    "import { useDevotionals, useDeleteDevotional } from '../../lib/hooks/useDevotionals';",
    `import { useDevotionals, useDeleteDevotional } from '@/lib/hooks/useDevotionals';
import { PageHeader } from '@/components/page-header';
import { LoadingScreen } from '@/components/loading-screen';
import { Button } from '@/components/ui/button';`
  );
}

const start = s.indexOf('  if (isLoading) {');
const end =
  s.indexOf('      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">') +
  '      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">'.length;

const replacement = `  if (isLoading) {
    return <LoadingScreen message="Loading devotionals..." />;
  }

  return (
    <>
      <PageHeader
        title="Devotionals"
        description="Manage daily devotionals"
        icon={BookOpen}
        action={
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={handleRefresh} disabled={isRefetching}>
              <RefreshCw size={16} className={isRefetching ? 'animate-spin' : ''} />
              Refresh
            </Button>
            <Button variant="gold" asChild>
              <Link href="/devotionals/new">
                <Plus size={16} />
                New Devotional
              </Link>
            </Button>
          </div>
        }
      />
`;

const patched = s.slice(0, start) + replacement + s.slice(end);
const final = patched.replace(/\n      <\/main>\n    <\/motion>\n  \);/, '\n    </>\n  );').replace(/\n      <\/main>\n    <\/div>\n  \);/, '\n    </>\n  );');

fs.writeFileSync(f, final);
console.log('patched devotionals');
