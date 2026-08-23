import fs from 'fs';

const f = 'app/comments/page.tsx';
let s = fs.readFileSync(f, 'utf8');

if (!s.includes('PageHeader')) {
  s = s.replace(
    "import { useComments, useUpdateCommentStatus, useDeleteComment } from '../../lib/hooks/useComments';",
    `import { useComments, useUpdateCommentStatus, useDeleteComment } from '@/lib/hooks/useComments';
import { PageHeader } from '@/components/page-header';
import { LoadingScreen } from '@/components/loading-screen';
import { Button } from '@/components/ui/button';`
  );
  s = s.replace(
    "import { useEpisodes } from '../../lib/hooks/useEpisodes';",
    "import { useEpisodes } from '@/lib/hooks/useEpisodes';"
  );
}

const start = s.indexOf('  if (isLoading) {');
const end =
  s.indexOf('      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">') +
  '      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">'.length;

const replacement = `  if (isLoading) {
    return <LoadingScreen message="Loading comments..." />;
  }

  return (
    <>
      <PageHeader
        title="Comments"
        description="Moderate user comments"
        icon={MessageSquare}
        action={
          <Button type="button" variant="outline" size="sm" onClick={() => refetch()} disabled={isRefetching}>
            <RefreshCw size={16} className={isRefetching ? 'animate-spin' : ''} />
            Refresh
          </Button>
        }
      />
`;

const patched = s.slice(0, start) + replacement + s.slice(end);
const final = patched.replace(/\n      <\/main>\n    <\/motion>\n  \);/, '\n    </>\n  );').replace(/\n      <\/main>\n    <\/div>\n  \);/, '\n    </>\n  );');

fs.writeFileSync(f, final);
console.log('patched comments');
