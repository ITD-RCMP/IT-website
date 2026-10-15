import { RATING_COLORS, RATING_LABELS } from "@/lib/feedback";
import type { FeedbackStats } from "@/lib/feedback-api";

const MARGIN = 48;

function drawPieChart(
  ratings: { rating: (typeof RATING_LABELS)[number]; count: number }[],
  total: number,
  size = 300,
): string | null {
  if (total <= 0) return null;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 2;
  let angle = -Math.PI / 2;

  for (const item of ratings) {
    if (item.count <= 0) continue;
    const slice = (item.count / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, angle, angle + slice);
    ctx.closePath();
    ctx.fillStyle = RATING_COLORS[item.rating];
    ctx.fill();
    angle += slice;
  }

  return canvas.toDataURL("image/png");
}
const BLUE = "#0077C8";
const NEUTRAL_900 = "#171717";
const NEUTRAL_700 = "#404040";
const NEUTRAL_600 = "#525252";
const NEUTRAL_500 = "#737373";
const NEUTRAL_400 = "#a3a3a3";
const NEUTRAL_200 = "#e5e5e5";
const NEUTRAL_100 = "#f5f5f5";

function formatPeriod(year: number, month: number) {
  return new Intl.DateTimeFormat("en-MY", { month: "long", year: "numeric" }).format(
    new Date(year, month - 1, 1),
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-MY", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

const LOGO_SRC = "/unikl-official.png";
const LOGO_RATIO = 749 / 2221;

async function loadLogo(): Promise<string> {
  const image = new Image();
  image.src = LOGO_SRC;
  await image.decode();
  const width = 1000;
  const height = Math.round(width * (image.naturalHeight / image.naturalWidth));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) return LOGO_SRC;
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", 0.92);
}

export async function downloadFeedbackPdf(stats: FeedbackStats, year: number, month: number) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4", orientation: "landscape" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentWidth = pageWidth - MARGIN * 2;
  let y = MARGIN;

  const ensure = (height: number) => {
    if (y + height <= pageHeight - MARGIN) return;
    doc.addPage();
    y = MARGIN;
  };

  const label = (text: string, x = MARGIN) => {
    ensure(16);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(NEUTRAL_500);
    doc.text(text.toUpperCase(), x, y);
    y += 16;
  };

  const heading = (text: string, size: number, color = NEUTRAL_900) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(size);
    doc.setTextColor(color);
    const lines = doc.splitTextToSize(text, contentWidth) as string[];
    const lineHeight = size + 6;
    ensure(lines.length * lineHeight);
    doc.text(lines, MARGIN, y);
    y += lines.length * lineHeight;
  };

  const body = (text: string, size: number, color = NEUTRAL_600, x = MARGIN, width = contentWidth) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(size);
    doc.setTextColor(color);
    const lines = doc.splitTextToSize(text, width) as string[];
    const lineHeight = size + 6;
    ensure(lines.length * lineHeight);
    doc.text(lines, x, y);
    y += lines.length * lineHeight;
    return lines.length * lineHeight;
  };

  const gap = (amount = 14) => {
    y += amount;
  };

  const rule = () => {
    ensure(1);
    doc.setDrawColor(NEUTRAL_200);
    doc.line(MARGIN, y, pageWidth - MARGIN, y);
  };

  const sectionTitle = (title: string, subtitle: string) => {
    ensure(44);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(NEUTRAL_900);
    doc.text(title, MARGIN, y);
    y += 17;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(NEUTRAL_500);
    doc.text(subtitle, MARGIN, y);
    y += 20;
  };

  // A horizontal "progress" bar matching the ScoreBar / PercentBar components.
  const statBar = (
    barX: number,
    barWidth: number,
    labelText: string,
    valueText: string,
    percent: number,
    color: string = BLUE,
  ) => {
    const rowHeight = 30;
    ensure(rowHeight);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(NEUTRAL_700);
    doc.text(labelText, barX, y);
    doc.setTextColor(NEUTRAL_500);
    doc.text(valueText, barX + barWidth, y, { align: "right" });
    y += 10;
    const trackHeight = 6;
    doc.setFillColor(NEUTRAL_100);
    doc.roundedRect(barX, y, barWidth, trackHeight, trackHeight / 2, trackHeight / 2, "F");
    const filled = Math.max((percent / 100) * barWidth, percent > 0 ? 6 : 0);
    if (filled > 0) {
      doc.setFillColor(color);
      doc.roundedRect(barX, y, filled, trackHeight, trackHeight / 2, trackHeight / 2, "F");
    }
    y += trackHeight + 14;
  };

  const period = formatPeriod(year, month);
  const logo = await loadLogo();
  const logoWidth = 160;
  const logoHeight = logoWidth * LOGO_RATIO;
  ensure(logoHeight + 16);
  doc.addImage(logo, "JPEG", MARGIN, y, logoWidth, logoHeight);
  y += logoHeight + 26;

  // Header: "Staff portal" eyebrow + light/medium title, matching the dashboard hero.
  label("Staff portal");
  gap(2);
  let titleSize = 26;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(titleSize);
  while (
    titleSize > 14 &&
    doc.getTextWidth("Feedback Overview") > contentWidth
  ) {
    titleSize -= 1;
    doc.setFontSize(titleSize);
  }
  y += titleSize * 0.78;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(NEUTRAL_900);
  doc.text("Feedback ", MARGIN, y);
  const feedbackWidth = doc.getTextWidth("Feedback ");
  doc.setFont("helvetica", "bold");
  doc.text("Overview", MARGIN + feedbackWidth, y);
  y += titleSize * 0.4 + 6;
  body(`Statistics for ${period}.`, 11, NEUTRAL_600);
  gap(22);

  // Metrics row, mirroring the two-up Metric cards with a dividing rule.
  const metricColWidth = (contentWidth - 24) / 2;
  const metricTop = y;
  label("Total responses", MARGIN);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(22);
  doc.setTextColor(NEUTRAL_900);
  doc.text(String(stats.totalResponses), MARGIN, y + 20);

  const metricX2 = MARGIN + metricColWidth + 24;
  y = metricTop;
  label("Average score", metricX2);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(22);
  doc.setTextColor(NEUTRAL_900);
  const avgText = stats.averageScore == null ? "—" : `${stats.averageScore.toFixed(2)} / 5`;
  doc.text(avgText, metricX2, y + 20);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(NEUTRAL_500);
  doc.text("Across all rated questions", metricX2, y + 34);

  doc.setDrawColor(NEUTRAL_200);
  doc.line(metricX2 - 12, metricTop - 14, metricX2 - 12, metricTop + 34);

  y = metricTop + 46;
  gap(16);
  rule();
  gap(28);

  if (stats.totalResponses === 0) {
    heading(`No feedback for ${period}`, 16);
    gap(6);
    body("Try another month or year, or check back once new responses are submitted.", 11, NEUTRAL_600);
  } else {
    // By category / Rating mix side-by-side columns.
    const colWidth = (contentWidth - 32) / 2;
    const colX1 = MARGIN;
    const colX2 = MARGIN + colWidth + 32;
    const categoryMax = Math.max(...stats.byCategory.map((item) => item.count), 1);
    const ratingTotal = stats.byRating.reduce((sum, item) => sum + item.count, 0);
    const rowsNeeded = Math.max(stats.byCategory.length, stats.byRating.length);
    ensure(60 + rowsNeeded * 30);

    const columnsTop = y;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(NEUTRAL_900);
    doc.text("By Category", colX1, y);
    doc.text("Rating mix", colX2, y);
    y += 15;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(NEUTRAL_500);
    doc.text("Who is submitting feedback", colX1, y);
    doc.text("All question ratings combined", colX2, y);
    y += 16;
    const barsTop = y;

    y = barsTop;
    for (const item of stats.byCategory) {
      const percent = (item.count / categoryMax) * 100;
      statBar(colX1, colWidth, item.category, String(item.count), percent, NEUTRAL_400);
    }
    const categoryBottom = y;

    y = barsTop;
    for (const item of stats.byRating) {
      const percent = ratingTotal > 0 ? (item.count / ratingTotal) * 100 : 0;
      statBar(colX2, colWidth, item.rating, `${percent.toFixed(1)}%`, percent, RATING_COLORS[item.rating]);
    }
    const ratingBottom = y;

    y = Math.max(categoryBottom, ratingBottom, columnsTop);
    gap(16);
    rule();
    gap(28);

    // Respond average — rating-mix pie charts for Academic Staff and Non-Academic Staff.
    const pieHasData = stats.byCategoryRating.some((group) =>
      group.ratings.some((item) => item.count > 0),
    );
    const pieSize = 150;
    const legendHeight = RATING_LABELS.length * 16 + 10;
    ensure(44 + (pieHasData ? 34 + pieSize + 16 + legendHeight : 20));
    sectionTitle("Respond Average", "Fraction of ratings by Academic Staff & Non-Academic Staff");
    if (!pieHasData) {
      body("No responses from Academic or Non-Academic Staff for this period.", 11, NEUTRAL_600);
    } else {
      gap(14);
      const pieColWidth = (contentWidth - 32) / 2;
      const pieColX = [MARGIN, MARGIN + pieColWidth + 32];
      const sectionTop = y;

      stats.byCategoryRating.forEach((group, index) => {
        const colX = pieColX[index];
        let colY = sectionTop;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(NEUTRAL_900);
        doc.text(group.category, colX, colY);
        colY += 20;

        const total = group.ratings.reduce((sum, item) => sum + item.count, 0);
        const pieX = colX + (pieColWidth - pieSize) / 2;
        const pieDataUrl = drawPieChart(group.ratings, total);
        if (pieDataUrl) {
          doc.addImage(pieDataUrl, "PNG", pieX, colY, pieSize, pieSize);
        } else {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);
          doc.setTextColor(NEUTRAL_500);
          doc.text("No responses yet.", colX, colY + pieSize / 2);
        }
        colY += pieSize + 16;

        for (const item of group.ratings) {
          const percentText = total > 0 ? `${((item.count / total) * 100).toFixed(1)}%` : "—";
          const color = RATING_COLORS[item.rating];
          doc.setFillColor(color);
          doc.rect(colX, colY - 8, 9, 9, "F");
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9.5);
          doc.setTextColor(NEUTRAL_700);
          doc.text(item.rating, colX + 14, colY);
          doc.setTextColor(NEUTRAL_500);
          doc.text(percentText, colX + pieColWidth, colY, { align: "right" });
          colY += 16;
        }
      });

      y = sectionTop + 20 + pieSize + 16 + legendHeight;
    }
    gap(12);
    rule();
    gap(28);

    // Recent suggestions, laid out two-up to use the landscape width.
    sectionTitle("Recent suggestions", "Comments from this period");
    if (stats.recentSuggestions.length === 0) {
      body("No suggestions for this period.", 11, NEUTRAL_600);
    } else {
      const sugColGap = 32;
      const sugColWidth = (contentWidth - sugColGap) / 2;
      const sugColX = [MARGIN, MARGIN + sugColWidth + sugColGap];

      const measureSuggestion = (item: (typeof stats.recentSuggestions)[number]) => {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10.5);
        const lines = doc.splitTextToSize(item.suggestion, sugColWidth) as string[];
        return 14 + lines.length * 15 + 4;
      };

      const drawSuggestion = (item: (typeof stats.recentSuggestions)[number], x: number) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(NEUTRAL_700);
        doc.text(item.category, x, y);
        const catWidth = doc.getTextWidth(item.category);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(NEUTRAL_500);
        doc.text(formatDate(item.createdAt), x + catWidth + 10, y);
        y += 14;
        body(item.suggestion, 10.5, "#1f1f1f", x, sugColWidth);
      };

      for (let i = 0; i < stats.recentSuggestions.length; i += 2) {
        const left = stats.recentSuggestions[i];
        const right = stats.recentSuggestions[i + 1];
        const rowHeight = Math.max(
          measureSuggestion(left),
          right ? measureSuggestion(right) : 0,
        );
        ensure(rowHeight + 2);
        rule();
        gap(14);
        const rowTop = y;
        drawSuggestion(left, sugColX[0]);
        const leftBottom = y;
        if (right) {
          y = rowTop;
          drawSuggestion(right, sugColX[1]);
        }
        y = Math.max(leftBottom, y) + 4;
      }
    }
  }

  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page += 1) {
    doc.setPage(page);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor("#a3a3a3");
    doc.text(`Page ${page} of ${pages}`, pageWidth - MARGIN, pageHeight - 28, { align: "right" });
    doc.text("© 2026 Information Technology Department RCMP", MARGIN, pageHeight - 28);
  }

  const slug = period.toLowerCase().replace(/\s+/g, "-");
  doc.save(`it-feedback-${slug}.pdf`);
}
