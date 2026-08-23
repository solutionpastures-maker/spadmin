from pathlib import Path

hooks = Path(r"g:\So\spadmin\lib\hooks")
needle = "const res = await fetch(url, init);"
repl = "const res = await adminFetch(url, init);"
import_line = "import { adminFetch } from '@/lib/admin-api';\n"

for p in hooks.glob("*.ts"):
    t = p.read_text(encoding="utf-8")
    if needle not in t:
        continue
    if "from '@/lib/admin-api'" not in t:
        lines = t.splitlines(keepends=True)
        insert_at = 0
        for i, line in enumerate(lines):
            if line.startswith("import "):
                insert_at = i + 1
        lines.insert(insert_at, import_line)
        t = "".join(lines)
    t = t.replace(needle, repl)
    p.write_text(t, encoding="utf-8")
    print("updated", p.name)
