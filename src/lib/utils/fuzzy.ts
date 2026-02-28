export function scoreMatch(
  query: string,
  item: { name: string; brand: string; aliases?: string[] },
): number {
  const q = query.toLowerCase().trim();
  if (!q) return 1;
  const text = [item.name, item.brand, ...(item.aliases ?? [])].join(' ').toLowerCase();
  if (item.name.toLowerCase().startsWith(q)) return 3;
  if (text.includes(q)) return 2;
  if (q.split(/\s+/).every((w) => text.includes(w))) return 1;
  return 0;
}
