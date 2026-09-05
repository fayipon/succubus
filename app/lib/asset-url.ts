/** Resolve app assets under either / or the GitHub Pages project subdirectory. */
export function assetUrl(path: string): string {
  if (/^(https?:|data:|blob:)/i.test(path)) return path;
  return new URL(path.replace(/^\/+/, ''), document.baseURI).href;
}
