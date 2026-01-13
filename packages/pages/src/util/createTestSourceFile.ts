import { Project } from "ts-morph";

/**
 * Creates a test sourceFile and Project for ts-morph testing purposes.
 * @param code to insert into test file
 * @param filepath
 * @returns a sourceFile and Project
 */
export default function createTestSourceFile(code: string, filepath = "test.tsx") {
  const p = createTestProject();
  p.createSourceFile(filepath, code);
  return {
    sourceFile: p.getSourceFileOrThrow(filepath),
    project: p,
  };
}

export function createTestProject() {
  return new Project({
    compilerOptions: {
      react: "react-jsx",
    },
  });
}
