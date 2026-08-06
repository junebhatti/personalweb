/** Reading time from raw markdown, at an average 225 words per minute. */
export function readMinutes(body: string | undefined): number {
  const words = (body ?? '').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 225));
}

export function readLabel(body: string | undefined): string {
  return `${readMinutes(body)} min read`;
}
