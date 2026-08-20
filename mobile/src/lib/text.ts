// Display-only formatting: capitalizes the given name(s) and uppercases the
// surname (last whitespace-separated token), e.g. "marie curie" -> "Marie
// CURIE", regardless of how the teacher typed it. Never mutates stored data,
// just how a name renders.
function capitalize(word: string): string {
  return word ? word[0].toUpperCase() + word.slice(1).toLowerCase() : word;
}

export function famName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length < 2) return name.toUpperCase();
  const last = parts.pop()!;
  return `${parts.map(capitalize).join(' ')} ${last.toUpperCase()}`;
}
