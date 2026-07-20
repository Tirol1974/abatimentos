import path from "node:path";
import { fileURLToPath } from "node:url";
import ejs from "ejs";

const currentFilePath = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFilePath);
const templatesDir = path.join(currentDir, "templates");

export async function renderEmailTemplate(templateName: string, data: Record<string, unknown>) {
  return await ejs.renderFile(
    path.join(templatesDir, `${templateName}.ejs`),
    data,
    {
      async: false,
    }
  );
}
