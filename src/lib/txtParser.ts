/**
 * Smart TXT Ingestor / Parser for COA Colombo S/A
 * Can parse JSON or delimited text (CSV, Semicolon-Separated, Tab-Separated)
 */

export interface ParsedWorkbook {
  SheetNames: string[];
  Sheets: Record<string, any[]>;
}

export function parseTxtContent(text: string): ParsedWorkbook {
  const trimmed = text.trim();

  // 1. Try parsing as JSON
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return {
          SheetNames: ['Sheet1'],
          Sheets: { 'Sheet1': parsed }
        };
      } else if (typeof parsed === 'object' && parsed !== null) {
        // If it is structured as { sheetName: Array<any> }
        const sheetNames = Object.keys(parsed);
        const sheets: Record<string, any[]> = {};
        let hasArrays = false;

        sheetNames.forEach(name => {
          if (Array.isArray(parsed[name])) {
            sheets[name] = parsed[name];
            hasArrays = true;
          }
        });

        if (hasArrays) {
          return {
            SheetNames: sheetNames,
            Sheets: sheets
          };
        } else {
          // Wrap single object in a sheet array
          return {
            SheetNames: ['Sheet1'],
            Sheets: { 'Sheet1': [parsed] }
          };
        }
      }
    } catch (e) {
      console.warn("TXT started like JSON but failed to parse, falling back to delimited parser:", e);
    }
  }

  // 2. CSV / Delimited Parsing
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length === 0) {
    return {
      SheetNames: ['Sheet1'],
      Sheets: { 'Sheet1': [] }
    };
  }

  // Detect delimiter: tab, semicolon, or comma
  const firstLine = lines[0];
  let delimiter = ',';
  const tabCount = (firstLine.match(/\t/g) || []).length;
  const semiCount = (firstLine.match(/;/g) || []).length;
  const commaCount = (firstLine.match(/,/g) || []).length;

  if (tabCount > semiCount && tabCount > commaCount) {
    delimiter = '\t';
  } else if (semiCount > commaCount && semiCount > tabCount) {
    delimiter = ';';
  }

  // Split line respecting quotes
  const splitLine = (line: string, delim: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"' || char === "'") {
        inQuotes = !inQuotes;
      } else if (char === delim && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const headers = splitLine(lines[0], delimiter).map(h => h.replace(/^["']|["']$/g, '').trim());
  const rows = lines.slice(1).map(line => {
    const cols = splitLine(line, delimiter).map(c => c.replace(/^["']|["']$/g, '').trim());
    const rowObj: Record<string, any> = {};
    headers.forEach((header, idx) => {
      if (header) {
        rowObj[header] = cols[idx] !== undefined ? cols[idx] : '';
      }
    });
    return rowObj;
  });

  return {
    SheetNames: ['Sheet1'],
    Sheets: { 'Sheet1': rows }
  };
}
