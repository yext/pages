export interface ConfigYaml {
  /**
   * The folder path that assets will be served from. If your using a reverse proxy at
   * a subpath, this should typically look like "mySubpath/assets".
   * */
  assetsDir?: string;
}
