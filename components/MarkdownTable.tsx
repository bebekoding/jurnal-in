function parse(md: string): { headers: string[]; rows: string[][] } {
  const lines = md
    .trim()
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length === 0) return { headers: [], rows: [] };

  const cells = (line: string) =>
    line
      .replace(/^\||\|$/g, "")
      .split("|")
      .map((c) => c.trim());

  const headers = cells(lines[0]);
  // line 1 is the --- separator
  const rows = lines.slice(2).map(cells);
  return { headers, rows };
}

export function MarkdownTable({
  markdown,
  className = "",
}: {
  markdown: string;
  className?: string;
}) {
  const { headers, rows } = parse(markdown);
  if (headers.length === 0) return null;

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full border-collapse text-sm tabular">
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th
                key={i}
                className={`border-[1.5px] border-ink bg-lime-soft px-3 py-2 font-display font-semibold text-ink text-left ${
                  i === 0 ? "" : "text-right"
                }`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  className={`border-[1.5px] border-ink px-3 py-2 text-ink ${
                    ci === 0
                      ? "font-medium bg-paper-raised"
                      : "text-right bg-paper-raised/40"
                  }`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
