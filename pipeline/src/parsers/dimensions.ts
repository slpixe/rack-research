/**
 * Dimensions Parser
 * 
 * Parses physical dimensions from various formats
 */

export interface ParsedDimensions {
  width_mm: number | null;
  height_mm: number | null;
  depth_mm: number | null;
}

export function parseDimensions(value: string): ParsedDimensions {
  const result: ParsedDimensions = { width_mm: null, height_mm: null, depth_mm: null };

  // Format: "width: 483mm / depth: 450mm / height: 177mm"
  const labeledMatch = value.match(
    /width:\s*([\d.]+)\s*mm.*depth:\s*([\d.]+)\s*mm.*height:\s*([\d.]+)\s*mm/i
  );
  if (labeledMatch) {
    result.width_mm = parseFloat(labeledMatch[1]);
    result.depth_mm = parseFloat(labeledMatch[2]);
    result.height_mm = parseFloat(labeledMatch[3]);
    return result;
  }

  // Format: "430mm (W) x 88.5mm (H) x 580mm (D)"
  const wxhxdMatch = value.match(
    /([\d.]+)\s*mm\s*\(W\)\s*x\s*([\d.]+)\s*mm\s*\(H\)\s*x\s*([\d.]+)\s*mm\s*\(D\)/i
  );
  if (wxhxdMatch) {
    result.width_mm = parseFloat(wxhxdMatch[1]);
    result.height_mm = parseFloat(wxhxdMatch[2]);
    result.depth_mm = parseFloat(wxhxdMatch[3]);
    return result;
  }

  // Format: "H x W x D: 44.5 x 482 x 428mm" (Inter-Tech style)
  const hxwxdMatch = value.match(/([\d.]+)\s*x\s*([\d.]+)\s*x\s*([\d.]+)\s*mm/i);
  if (hxwxdMatch) {
    result.height_mm = parseFloat(hxwxdMatch[1]);
    result.width_mm = parseFloat(hxwxdMatch[2]);
    result.depth_mm = parseFloat(hxwxdMatch[3]);
    return result;
  }

  return result;
}

export function parseMillimeters(value: string): number | null {
  const match = value.match(/(\d+)\s*mm/);
  return match ? parseInt(match[1], 10) : null;
}

export function parseWeight(value: string): number | null {
  const match = value.match(/([\d.]+)\s*kg/);
  return match ? parseFloat(match[1]) : null;
}
