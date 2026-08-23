from pathlib import Path

root = Path(r"g:\So\spadmin\app\api")
needle = "import {\nimport { requireAdmin } from '@/lib/auth/require-admin';\n"
repl = "import { requireAdmin } from '@/lib/auth/require-admin';\nimport {\n"
n = 0
for p in root.rglob("route.ts"):
    t = p.read_text(encoding="utf-8")
    if needle in t:
        p.write_text(t.replace(needle, repl), encoding="utf-8")
        n += 1
        print(p)
print("fixed", n)
