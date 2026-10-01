import type { FeedbackStats } from "@/lib/feedback-api";

const MARGIN = 48;

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
  const width = pageWidth - MARGIN * 2;
  let y = MARGIN;

  const ensure = (height: number) => {
    if (y + height <= pageHeight - MARGIN) return;
    doc.addPage();
    y = MARGIN;
  };

  const write = (text: string, size: number, style: "normal" | "bold" = "normal", color = "#171717") => {
    doc.setFont("helvetica", style);
    doc.setFontSize(size);
    doc.setTextColor(color);
    const lines = doc.splitTextToSize(text, width) as string[];
    const lineHeight = size + 5;
    ensure(lines.length * lineHeight);
    doc.text(lines, MARGIN, y);
    y += lines.length * lineHeight;
  };

  const gap = (amount = 14) => {
    y += amount;
  };

  const rule = () => {
    ensure(12);
    doc.setDrawColor("#e5e5e5");
    doc.line(MARGIN, y, pageWidth - MARGIN, y);
    y += 16;
  };

  const period = formatPeriod(year, month);
  const logo = await loadLogo();
  const logoWidth = 250;
  const logoHeight = logoWidth * LOGO_RATIO;
  ensure(logoHeight + 16);
  doc.addImage(logo, "JPEG", MARGIN, y, logoWidth, logoHeight);
  y += logoHeight + 20;

  write("RCMP IT Department", 11, "bold", "#0077C8");
  gap(4);
  write("Feedback overview", 22, "bold");
  gap(2);
  write(period, 12, "normal", "#525252");
  gap(18);

  write("Total responses", 10, "bold", "#737373");
  write(String(stats.totalResponses), 16, "bold");
  gap(8);
  write("Average score", 10, "bold", "#737373");
  write(stats.averageScore == null ? "—" : `${stats.averageScore.toFixed(2)} / 5`, 16, "bold");
  gap(16);
  rule();

  write("By category", 14, "bold");
  gap(6);
  for (const item of stats.byCategory) {
    write(`${item.category}    ${item.count}`, 11);
  }
  gap(12);
  rule();

  const ratingTotal = stats.byRating.reduce((sum, item) => sum + item.count, 0);
  write("Rating mix", 14, "bold");
  gap(6);
  for (const item of stats.byRating) {
    const percent = ratingTotal > 0 ? ((item.count / ratingTotal) * 100).toFixed(1) : "0.0";
    write(`${item.rating}    ${item.count} (${percent}%)`, 11);
  }
  gap(12);
  rule();

  write("Question averages", 14, "bold");
  gap(6);
  if (stats.byQuestion.length === 0) {
    write("No question scores for this period.", 11, "normal", "#525252");
  } else {
    for (const item of stats.byQuestion) {
      const score = item.averageScore == null ? "—" : `${item.averageScore.toFixed(2)} / 5`;
      write(`Q${item.sortOrder}. ${item.question}`, 11);
      write(`${score} · ${item.responses} responses`, 10, "normal", "#525252");
      gap(6);
    }
  }
  gap(8);
  rule();

  write("Suggestions", 14, "bold");
  gap(6);
  if (stats.recentSuggestions.length === 0) {
    write("No suggestions for this period.", 11, "normal", "#525252");
  } else {
    for (const item of stats.recentSuggestions) {
      write(`${item.category} · ${formatDate(item.createdAt)}`, 10, "bold", "#525252");
      gap(2);
      write(item.suggestion, 11);
      gap(10);
    }
  }

  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page += 1) {
    doc.setPage(page);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor("#a3a3a3");
    doc.text(`Page ${page} of ${pages}`, pageWidth - MARGIN, pageHeight - 28, { align: "right" });
  }

  const slug = period.toLowerCase().replace(/\s+/g, "-");
  doc.save(`it-feedback-${slug}.pdf`);
}
