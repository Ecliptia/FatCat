import { readdir } from "fs/promises";
import { join, extname } from "path";

export default async function walk(dir) {
  let files = [];

  const items = await readdir(dir, { withFileTypes: true });
  for (const item of items) {
    const res = join(dir, item.name);
    if (item.isDirectory()) {
      files = files.concat(await walk(res));
    } else if (extname(res) === ".js") {
      files.push(res);
    }
  }

  return files;
}
