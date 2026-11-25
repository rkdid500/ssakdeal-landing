/** Resolve a file in /public against the site's base path (GitHub Pages sub-folder). */
export function asset(file: string) {
  return `${import.meta.env.BASE_URL}${file.replace(/^\//, "")}`;
}
