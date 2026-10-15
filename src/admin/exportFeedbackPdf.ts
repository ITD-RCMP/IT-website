import type { FeedbackStats } from "@/lib/feedback-api";

const MARGIN = 48;
const BLUE = "#0077C8";
const NEUTRAL_900 = "#171717";
const NEUTRAL_700 = "#404040";
const NEUTRAL_600 = "#525252";
const NEUTRAL_500 = "#737373";
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
  const doc = new jsPDF({ unit: "pt", format: "a4" });
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
      doc.setFillColor(BLUE);
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
      statBar(colX1, colWidth, item.category, String(item.count), percent);
    }
    const categoryBottom = y;

    y = barsTop;
    for (const item of stats.byRating) {
      const percent = ratingTotal > 0 ? (item.count / ratingTotal) * 100 : 0;
      statBar(colX2, colWidth, item.rating, `${percent.toFixed(1)}%`, percent);
    }
    const ratingBottom = y;

    y = Math.max(categoryBottom, ratingBottom, columnsTop);
    gap(16);
    rule();
    gap(28);

    // Question averages — simple vertical bar chart on a 0-5 scale.
    sectionTitle("Question averages", "Mean score from 1 (poor) to 5 (excellent)");
    if (stats.byQuestion.length === 0) {
      body("No question scores for this period.", 11, NEUTRAL_600);
    } else {
      const chartHeight = 130;
      const chartWidth = contentWidth;
      ensure(chartHeight + 30);
      const chartTop = y;
      const chartBottom = chartTop + chartHeight;
      doc.setDrawColor(NEUTRAL_200);
      doc.line(MARGIN, chartBottom, MARGIN + chartWidth, chartBottom);

      const barGap = 14;
      const barWidth = Math.min(
        40,
        (chartWidth - barGap * (stats.byQuestion.length - 1)) / stats.byQuestion.length,
      );
      const totalBarsWidth =
        barWidth * stats.byQuestion.length + barGap * (stats.byQuestion.length - 1);
      let barX = MARGIN + (chartWidth - totalBarsWidth) / 2;

      for (const item of stats.byQuestion) {
        const score = item.averageScore ?? 0;
        const barHeight = (score / 5) * chartHeight;
        doc.setFillColor(BLUE);
        doc.roundedRect(barX, chartBottom - barHeight, barWidth, barHeight, 4, 4, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(NEUTRAL_500);
        doc.text(`Q${item.sortOrder}`, barX + barWidth / 2, chartBottom + 14, { align: "center" });
        barX += barWidth + barGap;
      }
      y = chartBottom + 28;

      for (const item of stats.byQuestion) {
        const score = item.averageScore == null ? "—" : `${item.averageScore.toFixed(2)} / 5`;
        ensure(32);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(NEUTRAL_900);
        doc.text(`Q${item.sortOrder}.`, MARGIN, y);
        const prefixWidth = doc.getTextWidth(`Q${item.sortOrder}. `);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(NEUTRAL_700);
        const lines = doc.splitTextToSize(item.question, contentWidth - prefixWidth) as string[];
        doc.text(lines, MARGIN + prefixWidth, y);
        y += lines.length * 13;
        doc.setFontSize(9);
        doc.setTextColor(NEUTRAL_500);
        doc.text(`${score} · ${item.responses} responses`, MARGIN, y);
        y += 18;
      }
    }
    gap(12);
    rule();
    gap(28);

    // Recent suggestions list, mirroring the border-top divided list on the dashboard.
    sectionTitle("Recent suggestions", "Comments from this period");
    if (stats.recentSuggestions.length === 0) {
      body("No suggestions for this period.", 11, NEUTRAL_600);
    } else {
      for (const item of stats.recentSuggestions) {
        ensure(40);
        rule();
        gap(14);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(NEUTRAL_700);
        doc.text(item.category, MARGIN, y);
        const catWidth = doc.getTextWidth(item.category);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(NEUTRAL_500);
        doc.text(formatDate(item.createdAt), MARGIN + catWidth + 10, y);
        y += 14;
        body(item.suggestion, 10.5, "#1f1f1f");
        gap(4);
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
