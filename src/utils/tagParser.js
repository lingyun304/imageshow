// Helper to parse weights and parentheses from raw tags
export function parseTag(rawTag) {
  let clean = rawTag.trim();
  let weight = 1.0;

  // Matches ((tag:weight)) or (tag:weight)
  const match = clean.match(/^\(+(.+?):([0-9.]+)\)+$/);
  if (match) {
    clean = match[1].trim();
    weight = parseFloat(match[2]);
  } else {
    // Check if it's just wrapped in parentheses like (((tag)))
    const parenMatch = clean.match(/^\(+(.+?)\)+$/);
    if (parenMatch) {
      clean = parenMatch[1].trim();
    }
  }
  return { clean, weight };
}
