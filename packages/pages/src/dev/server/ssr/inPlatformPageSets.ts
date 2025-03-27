import { spawn } from "child_process";

export type PageSetConfig = {
  name: string;
  id: string;
  code_template: string;
  scope: {
    locales: string[];
    saved_filters: string[];
    entity_types: string[];
  };
  display_name: string;
};

export const getInPlatformPageSets = async (
  siteId: number
): Promise<PageSetConfig[]> => {
  const pageSetsRes = await spawnPageSetCommands(
    process.stdout,
    "yext",
    ["pages", "visual-editor", "pagesets", "--siteId", siteId.toString(10)],
    "{"
  );

  if (pageSetsRes) {
    const parsedPageSets = pageSetsRes.page_sets as Omit<PageSetConfig[], "id">;
    const pageSetsWithIds = parsedPageSets.map((ps) => {
      const id = ps.name.split("/").pop();
      return { ...ps, id: id ?? ps.name };
    });
    return pageSetsWithIds;
  }
  return [];
};

export const getInPlatformPageSetDocuments = async (
  siteId: number,
  pageSetId: string,
  filters?: {
    entityIds?: string[];
    locale?: string;
    slug?: string;
  }
): Promise<Record<string, any>[] | undefined> => {
  const args = ["--siteId", siteId.toString(10), "--pageSetId", pageSetId];
  filters?.entityIds?.forEach((entityId) => {
    args.push("--entityId", entityId);
  });
  if (filters?.locale) {
    args.push("--locale", filters.locale);
  }
  if (filters?.slug) {
    args.push("--slug", filters.slug);
  }

  return await spawnPageSetCommands(
    process.stdout,
    "yext",
    ["pages", "visual-editor", "document", ...args],
    "["
  );
};

async function spawnPageSetCommands(
  stdout: NodeJS.WriteStream,
  command: string,
  args: string[],
  dataStartKey: string
): Promise<undefined | any> {
  return new Promise((resolve) => {
    const childProcess = spawn(command, args, {
      stdio: ["inherit", "pipe", "inherit"],
    });

    // Assume that all CLI chunks will come before any stream data. Once stream data is found
    // assume the rest is relevant.
    let testData = "";
    let foundDocumentData = false;
    childProcess.stdout.on("data", (chunkBuff: Buffer) => {
      const chunk = chunkBuff.toString("utf-8");

      // If we've found documents at all then we assume the rest of the output is document data.
      if (foundDocumentData) {
        testData += chunk;
        return;
      }

      let lines = chunk.split("\n");

      // Check to see if the document data has begun to be printed in this chunk.
      const dataStartIndex = chunk.indexOf(dataStartKey);
      if (dataStartIndex !== -1) {
        foundDocumentData = true;
        testData = lines.slice(dataStartIndex).join("\n");
        lines = lines.slice(0, dataStartIndex);
      }
    });

    childProcess.on("close", () => {
      let parsedData: any;
      if (testData) {
        try {
          parsedData = JSON.parse(testData.trim());
        } catch {
          stdout.write(
            `\nUnable to parse test data from command: \`${command} ${args.join(
              " "
            )}\``
          );
          resolve(null);
        }
      } else {
        stdout.write(
          `\nUnable to generate test data from command: \`${command} ${args.join(
            " "
          )}\``
        );
      }

      resolve(parsedData);
    });
  });
}
