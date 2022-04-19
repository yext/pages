import path from 'path';
import fs from 'fs';
import { readdir } from 'fs/promises';

const LOCAL_DATA_PATH = 'localData';

export const getLocalData = async (entityId: string) => {
  try {
    const dir = await readdir(LOCAL_DATA_PATH);

    for (const fileName of dir) {
      const data = JSON.parse(
        fs.readFileSync(path.resolve(process.cwd(), `${LOCAL_DATA_PATH}/${fileName}`)).toString(),
      );

      if (data.id?.toString() === entityId) {
        return data;
      }
    }
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      throw 'No localData exists. Please run `yext sites generate-test-data`';
    } else {
      throw err;
    }
  }

  throw `No localData files match entityId ${entityId}`;
};
