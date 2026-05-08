/**
 * Read a file from the user's computer.
 * @param accept
 * @returns
 */
export async function readFile(accept?: string) {
  return new Promise<string>((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    if (accept) input.accept = accept;
    input.addEventListener("cancel", () => reject("File selection cancelled"));
    input.addEventListener("change", async () => {
      const file = input.files?.[0];
      if (!file) return reject("No file selected");
      const data = await file.text();
      return resolve(data);
    });
    input.click();
  });
}

/**
 * Save a file to the user's computer.
 * @param filename
 * @param content
 * @param type
 */
export function saveFile(
  filename: string,
  content: string,
  type = "text/plain;charset=utf-8"
) {
  const a = document.createElement("a");
  a.setAttribute("href", `data:${type},${encodeURIComponent(content)}`);
  a.setAttribute("download", filename);
  a.click();
}
