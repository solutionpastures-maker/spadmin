"""Add requireAdmin() to unguarded spadmin API routes."""
from pathlib import Path
import re

ROOT = Path(r"g:\So\spadmin\app\api")
SKIP = {
    ROOT / "auth" / "signup" / "route.ts",
    ROOT / "auth" / "signup" / "verify" / "route.ts",
    ROOT / "auth" / "setup-password" / "route.ts",
    ROOT / "auth" / "me" / "route.ts",
}

GUARD = "  const auth = await requireAdmin(request);\n  if ('error' in auth) return auth.error;\n"

updated = []
for path in ROOT.rglob("route.ts"):
    if path in SKIP:
        continue
    text = path.read_text(encoding="utf-8")
    if "requireAdmin" in text:
        continue

    if "NextRequest" not in text.split("from 'next/server'")[0] if "from 'next/server'" in text else True:
        if "import { NextResponse } from 'next/server'" in text:
            text = text.replace(
                "import { NextResponse } from 'next/server'",
                "import { NextRequest, NextResponse } from 'next/server'",
            )
        elif "from 'next/server'" not in text:
            text = "import { NextRequest, NextResponse } from 'next/server';\n" + text

    if "from '@/lib/auth/require-admin'" not in text:
        lines = text.splitlines(keepends=True)
        insert_at = 0
        for i, line in enumerate(lines):
            if line.startswith("import "):
                insert_at = i + 1
        lines.insert(insert_at, "import { requireAdmin } from '@/lib/auth/require-admin';\n")
        text = "".join(lines)

    text = re.sub(
        r"export async function (GET|POST|PUT|PATCH|DELETE)\(\s*\)",
        r"export async function \1(request: NextRequest)",
        text,
    )
    text = re.sub(
        r"export async function (GET|POST|PUT|PATCH|DELETE)\(\s*_request: NextRequest",
        r"export async function \1(request: NextRequest",
        text,
    )

    def inject(match: re.Match[str]) -> str:
        return f"{match.group(1)} {{\n{GUARD}"

    text = re.sub(
        r"(export async function (?:GET|POST|PUT|PATCH|DELETE)\([^)]*\)[^{]*)\{",
        inject,
        text,
    )

    path.write_text(text, encoding="utf-8")
    updated.append(str(path.relative_to(ROOT)))

print(f"updated {len(updated)} files")
for p in updated:
    print(" ", p)
