export function sizedImage(uri: string, width: number): string {
  return uri.includes('w=900') ? uri.replace('w=900', `w=${Math.round(width)}`) : uri;
}
