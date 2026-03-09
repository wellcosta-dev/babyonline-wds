import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

function getDataFilePath(fileName: string): string {
  return path.join(process.cwd(), "data", fileName);
}

export async function readJsonFile<T>(fileName: string, fallback: T): Promise<T> {
  const filePath = getDataFilePath(fileName);
  try {
    const raw = await readFile(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function writeJsonFile<T>(fileName: string, value: T): Promise<void> {
  const dirPath = path.join(process.cwd(), "data");
  const filePath = getDataFilePath(fileName);
  await mkdir(dirPath, { recursive: true });
  await writeFile(filePath, JSON.stringify(value, null, 2), "utf-8");
}
