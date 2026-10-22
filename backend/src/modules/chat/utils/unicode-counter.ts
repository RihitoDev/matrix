export function countCharacters(text: string): number {
  const segmenter = new Intl.Segmenter('es', {
    granularity: 'grapheme',
  });

  return Array.from(segmenter.segment(text)).length;
}