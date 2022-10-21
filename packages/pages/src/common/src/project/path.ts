import pathLib from "path";

/**
 * Provides useful methods to operate on a specific property of {@link ProjectFilepaths}.
 *
 * @public
 */
export class Path {
  path: string;

  constructor(path: string) {
    this.path = path;
  }

  getRelativePath = (to: string): string => {
    return pathLib.join(".", pathLib.relative(this.path, to));
  };

  getAbsolutePath = (): string => {
    return pathLib.resolve(this.path);
  };
}
