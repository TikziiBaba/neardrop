/**
 * Utility to extract all files from a DataTransfer object during drag and drop,
 * supporting recursive directory traversal for dropped folders.
 */

interface ExtendedFile extends File {
  relativePath?: string;
}

/**
 * Reads all entries from a FileSystemDirectoryReader (handling Chromium's 100 entries batching limit).
 */
async function readAllDirectoryEntries(reader: any): Promise<any[]> {
  const entries: any[] = [];
  let readBatch = async (): Promise<any[]> => {
    return new Promise((resolve) => {
      reader.readEntries(
        (results: any[]) => resolve(results || []),
        () => resolve([])
      );
    });
  };

  let batch = await readBatch();
  while (batch.length > 0) {
    entries.push(...batch);
    batch = await readBatch();
  }

  return entries;
}

/**
 * Recursively scans a FileSystemEntry and extracts all File objects.
 */
async function scanEntry(entry: any, path = ""): Promise<ExtendedFile[]> {
  if (!entry) return [];

  if (entry.isFile) {
    return new Promise((resolve) => {
      entry.file(
        (file: File) => {
          const extendedFile: ExtendedFile = file;
          const fullPath = entry.fullPath || (path ? `${path}/${file.name}` : file.name);
          const cleanPath = fullPath.startsWith("/") ? fullPath.slice(1) : fullPath;
          extendedFile.relativePath = cleanPath;
          resolve([extendedFile]);
        },
        (err: any) => {
          console.warn("Could not read file entry:", entry.name, err);
          resolve([]);
        }
      );
    });
  }

  if (entry.isDirectory) {
    try {
      const reader = entry.createReader();
      const childEntries = await readAllDirectoryEntries(reader);
      const currentPath = path ? `${path}/${entry.name}` : entry.name;
      
      const filePromises = childEntries.map((child) => scanEntry(child, currentPath));
      const nestedFiles = await Promise.all(filePromises);
      return nestedFiles.flat();
    } catch (err) {
      console.warn("Could not read directory entry:", entry.name, err);
      return [];
    }
  }

  return [];
}

/**
 * Extracts files from DataTransfer (handles dropped files and dropped folders).
 */
export async function extractFilesFromDataTransfer(dataTransfer: DataTransfer): Promise<File[]> {
  const items = dataTransfer.items;

  // Modern browsers supporting DataTransferItemList and webkitGetAsEntry
  if (items && items.length > 0) {
    const entryPromises: Promise<ExtendedFile[]>[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.kind !== "file") continue;

      const entry = item.webkitGetAsEntry ? item.webkitGetAsEntry() : null;
      if (entry) {
        entryPromises.push(scanEntry(entry));
      } else {
        const file = item.getAsFile();
        if (file) {
          entryPromises.push(Promise.resolve([file]));
        }
      }
    }

    const fileArrays = await Promise.all(entryPromises);
    const flattened = fileArrays.flat();
    if (flattened.length > 0) {
      return flattened;
    }
  }

  // Fallback to standard dataTransfer.files
  if (dataTransfer.files && dataTransfer.files.length > 0) {
    return Array.from(dataTransfer.files);
  }

  return [];
}
