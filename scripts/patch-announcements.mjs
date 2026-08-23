import fs from 'fs';

const f = 'app/announcements/page.tsx';
let s = fs.readFileSync(f, 'utf8');

const start = s.indexOf('  if (isLoading) {');
const end =
  s.indexOf('      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">') +
  '      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">'.length;

const replacement = `  if (isLoading) {
    return <LoadingScreen message="Loading announcements..." />;
  }

  return (
    <>
      <PageHeader
        title="Announcements"
        description="Manage church announcements"
        icon={Megaphone}
        action={
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={handleRefresh} disabled={isRefetching}>
              <RefreshCw size={16} className={isRefetching ? 'animate-spin' : ''} />
              Refresh
            </Button>
            <Button variant="gold" asChild>
              <Link href="/announcements/new">
                <Plus size={16} />
                New Announcement
              </Link>
            </Button>
          </motion>
        }
      />
`;

const patched = s.slice(0, start) + replacement.replace(/<\/motion>/g, '</div>') + s.slice(end);
const final = patched.replace(/\n      <\/main>\n    <\/div>\n  \);/, '\n    </>\n  );');

fs.writeFileSync(f, final);
console.log('patched announcements');
