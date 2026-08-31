import JSZip from "jszip";

export interface SpreadsheetData {
  sheets: {
    name: string;
    rows: string[][];
  }[];
  activeSheetIndex: number;
}

export interface WordDocumentData {
  paragraphs: {
    text: string;
    isHeading?: boolean;
    headingLevel?: number;
    isBold?: boolean;
    isBullet?: boolean;
    isTable?: boolean;
    tableRows?: string[][];
  }[];
  rawText: string;
}

/**
 * Parse an .xlsx file buffer/blob into structured sheets and cells
 */
export async function parseXlsxBlob(blob: Blob): Promise<SpreadsheetData> {
  const zip = await JSZip.loadAsync(blob);

  // 1. Read shared strings if available
  const sharedStrings: string[] = [];
  const sharedStringsFile = zip.file("xl/sharedStrings.xml");
  if (sharedStringsFile) {
    const xmlText = await sharedStringsFile.async("text");
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "application/xml");
    const siNodes = xmlDoc.getElementsByTagName("si");
    for (let i = 0; i < siNodes.length; i++) {
      const tNodes = siNodes[i].getElementsByTagName("t");
      let str = "";
      for (let j = 0; j < tNodes.length; j++) {
        str += tNodes[j].textContent || "";
      }
      sharedStrings.push(str);
    }
  }

  // 2. Read workbook to get sheet names
  const sheetNames: { id: string; name: string }[] = [];
  const workbookFile = zip.file("xl/workbook.xml");
  if (workbookFile) {
    const xmlText = await workbookFile.async("text");
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "application/xml");
    const sheets = xmlDoc.getElementsByTagName("sheet");
    for (let i = 0; i < sheets.length; i++) {
      const name = sheets[i].getAttribute("name") || `Sheet ${i + 1}`;
      const sheetId = sheets[i].getAttribute("sheetId") || String(i + 1);
      sheetNames.push({ id: sheetId, name });
    }
  }

  if (sheetNames.length === 0) {
    sheetNames.push({ id: "1", name: "Sheet 1" });
  }

  // 3. Parse worksheets
  const resultSheets: SpreadsheetData["sheets"] = [];

  // Find all sheet files
  const sheetFiles = Object.keys(zip.files).filter(
    (path) => path.startsWith("xl/worksheets/sheet") && path.endsWith(".xml")
  );

  const targetFiles = sheetFiles.length > 0 ? sheetFiles : ["xl/worksheets/sheet1.xml"];

  for (let sIdx = 0; sIdx < targetFiles.length; sIdx++) {
    const sFile = zip.file(targetFiles[sIdx]);
    const sheetName = sheetNames[sIdx]?.name || `Sheet ${sIdx + 1}`;

    if (!sFile) {
      resultSheets.push({ name: sheetName, rows: [[""]] });
      continue;
    }

    const xmlText = await sFile.async("text");
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "application/xml");
    const rowNodes = xmlDoc.getElementsByTagName("row");

    const matrix: string[][] = [];
    let maxCols = 0;

    for (let r = 0; r < rowNodes.length; r++) {
      const rowNode = rowNodes[r];
      const cNodes = rowNode.getElementsByTagName("c");
      const rowData: { colIndex: number; val: string }[] = [];

      for (let c = 0; c < cNodes.length; c++) {
        const cNode = cNodes[c];
        const ref = cNode.getAttribute("r") || "";
        const type = cNode.getAttribute("t");
        const vNode = cNode.getElementsByTagName("v")[0];
        let val = "";

        if (vNode) {
          const rawVal = vNode.textContent || "";
          if (type === "s") {
            // Shared string lookup
            const strIndex = parseInt(rawVal, 10);
            val = sharedStrings[strIndex] !== undefined ? sharedStrings[strIndex] : rawVal;
          } else {
            val = rawVal;
          }
        } else {
          // Check inline string
          const isNode = cNode.getElementsByTagName("is")[0];
          if (isNode) {
            val = isNode.textContent || "";
          }
        }

        // Calculate column index from reference (e.g., 'A1' -> 0, 'B2' -> 1, 'AA1' -> 26)
        const colLetters = ref.replace(/[0-9]/g, "");
        let colIndex = 0;
        for (let i = 0; i < colLetters.length; i++) {
          colIndex = colIndex * 26 + (colLetters.charCodeAt(i) - 64);
        }
        colIndex = Math.max(0, colIndex - 1);

        rowData.push({ colIndex, val });
        if (colIndex + 1 > maxCols) maxCols = colIndex + 1;
      }

      // Fill row array up to max columns
      const fullRow: string[] = [];
      for (const item of rowData) {
        fullRow[item.colIndex] = item.val;
      }
      matrix.push(fullRow);
    }

    // Normalize all rows to same length
    maxCols = Math.max(maxCols, 5);
    const normalizedRows = matrix.map((row) => {
      const newRow = new Array(maxCols).fill("");
      for (let i = 0; i < maxCols; i++) {
        newRow[i] = row[i] || "";
      }
      return newRow;
    });

    if (normalizedRows.length === 0) {
      normalizedRows.push(new Array(maxCols).fill(""));
    }

    resultSheets.push({
      name: sheetName,
      rows: normalizedRows,
    });
  }

  return {
    sheets: resultSheets,
    activeSheetIndex: 0,
  };
}

/**
 * Parse a .docx file buffer/blob into structured paragraphs and plain text
 */
export async function parseDocxBlob(blob: Blob): Promise<WordDocumentData> {
  const zip = await JSZip.loadAsync(blob);
  const docFile = zip.file("word/document.xml");

  if (!docFile) {
    return { paragraphs: [{ text: "Belge içeriği okunamadı." }], rawText: "" };
  }

  const xmlText = await docFile.async("text");
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, "application/xml");

  const paragraphs: WordDocumentData["paragraphs"] = [];
  const body = xmlDoc.getElementsByTagName("w:body")[0];

  if (!body) {
    return { paragraphs: [], rawText: "" };
  }

  const childNodes = body.children;

  for (let i = 0; i < childNodes.length; i++) {
    const node = childNodes[i];
    const nodeName = node.nodeName.toLowerCase();

    if (nodeName === "w:p") {
      // Paragraph
      const pPr = node.getElementsByTagName("w:pPr")[0];
      let isHeading = false;
      let headingLevel = 0;
      let isBullet = false;

      if (pPr) {
        const pStyle = pPr.getElementsByTagName("w:pStyle")[0];
        if (pStyle) {
          const val = pStyle.getAttribute("w:val") || "";
          if (val.toLowerCase().includes("heading") || val.toLowerCase().includes("başlık")) {
            isHeading = true;
            headingLevel = parseInt(val.replace(/[^0-9]/g, ""), 10) || 1;
          }
        }
        const numPr = pPr.getElementsByTagName("w:numPr")[0];
        if (numPr) isBullet = true;
      }

      // Collect text runs
      const rNodes = node.getElementsByTagName("w:r");
      let paragraphText = "";
      let isBold = false;

      for (let j = 0; j < rNodes.length; j++) {
        const rNode = rNodes[j];
        const rPr = rNode.getElementsByTagName("w:rPr")[0];
        if (rPr && rPr.getElementsByTagName("w:b").length > 0) {
          isBold = true;
        }
        const tNodes = rNode.getElementsByTagName("w:t");
        for (let k = 0; k < tNodes.length; k++) {
          paragraphText += tNodes[k].textContent || "";
        }
      }

      if (paragraphText.trim().length > 0 || isHeading) {
        paragraphs.push({
          text: paragraphText,
          isHeading,
          headingLevel,
          isBold,
          isBullet,
        });
      }
    } else if (nodeName === "w:tbl") {
      // Table
      const trNodes = node.getElementsByTagName("w:tr");
      const tableRows: string[][] = [];

      for (let r = 0; r < trNodes.length; r++) {
        const tcNodes = trNodes[r].getElementsByTagName("w:tc");
        const row: string[] = [];
        for (let c = 0; c < tcNodes.length; c++) {
          const text = tcNodes[c].textContent || "";
          row.push(text.trim());
        }
        if (row.length > 0) tableRows.push(row);
      }

      if (tableRows.length > 0) {
        paragraphs.push({
          text: "",
          isTable: true,
          tableRows,
        });
      }
    }
  }

  const rawText = paragraphs.map((p) => (p.isTable ? p.tableRows?.map((r) => r.join("\t")).join("\n") : p.text)).join("\n\n");

  return {
    paragraphs,
    rawText,
  };
}

/**
 * Convert 2D spreadsheet rows into CSV string for saving
 */
export function spreadsheetToCsv(rows: string[][], separator: string = ","): string {
  return rows
    .map((row) =>
      row
        .map((cell) => {
          const str = cell || "";
          if (str.includes(separator) || str.includes('"') || str.includes("\n")) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        })
        .join(separator)
    )
    .join("\n");
}
