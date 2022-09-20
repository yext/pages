/**
 * This is necessary to prevent IntelliSense from highlighting
 * the usages of import.meta.env in red due to the following issue,
 * which it looks like will be resolved in Vite v3.0.
 *
 * https://github.com/vitejs/vite/issues/6194
 */
interface ImportMeta {
  readonly env: any;
}
