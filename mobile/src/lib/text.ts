// Display-only formatting: uppercases the surname (last whitespace-separated
// token) for stylized display, e.g. "Marie Curie" -> "Marie CURIE". Never
// mutates stored data, just how a name renders.
export function famName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length < 2) return name.toUpperCase();
  const last = parts.pop()!;
  return `${parts.join(' ')} ${last.toUpperCase()}`;
}
