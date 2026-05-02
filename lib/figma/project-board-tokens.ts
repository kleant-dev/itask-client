/**
 * Extracted from Figma node `5979:15311` (“73. Project - Main”) in project.json
 * — board / kanban region only (pixel-matched).
 *
 * Key frames (absoluteBoundingBox + layout + fills from Figma REST export):
 * - `tabs`: horizontal column row — width 1156px, layoutMode HORIZONTAL, itemSpacing 16px
 *   (parent `scroll-container` uses horizontal padding 24px — align with app `main` padding).
 * - `board-container` per column: width 350px, padding 4px, itemSpacing 4px between cards,
 *   cornerRadius 16px, fill #F7F9FB (rgba(247,249,251,1)).
 * - `board-card` instance: padding 16px, gap 24px between major sections, cornerRadius 12px,
 *   fill #FFFFFF; no stroke in Figma (flat card on tinted column).
 * - Column title (`title`): 342×44, title text 16/24, color #596881 (not #111625).
 * - Task title: 18/24 #111625; description & date row: 16/24 #596881.
 * - Priority labels: 12/16 — High #DF1C41, Medium #375DFB, Low #111625 (plain text).
 */

export const boardTokens = {
  columnWidthPx: 350,
  columnGapPx: 16,
  boardContainerPaddingPx: 4,
  boardContainerRadiusPx: 16,
  boardContainerBg: "#F7F9FB",
  cardPaddingPx: 16,
  cardRadiusPx: 12,
  cardGapPx: 24,
  cardBg: "#FFFFFF",
  columnTitleHeightPx: 44,
  columnTitleFontPx: 16,
  columnTitleLinePx: 24,
  columnTitleColor: "#596881",
  taskTitleFontPx: 18,
  taskTitleLinePx: 24,
  taskTitleColor: "#111625",
  bodyFontPx: 16,
  bodyLinePx: 24,
  bodyColor: "#596881",
  priorityFontPx: 12,
  priorityLinePx: 16,
  priorityHigh: "#DF1C41",
  priorityMedium: "#375DFB",
  priorityLow: "#111625",
} as const;
