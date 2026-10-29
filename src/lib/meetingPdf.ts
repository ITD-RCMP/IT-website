import type { Attendee, MeetingDetails } from "@/lib/meeting-api";

const MARGIN = 48;
const INK = "#171717";
const MUTED = "#737373";
const LINE = "#e5e5e5";
const ZEBRA = "#f7f7f5";

const dateTime = (value: string | Date) =>
  new Intl.DateTimeFormat("en-MY", { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(value),
  );
const timeOnly = (value: string) =>
  new Intl.DateTimeFormat("en-MY", { timeStyle: "short" }).format(new Date(value));

async function loadLogo() {
  const image = new Image();
  image.src = "/unikl-official.png";
  await image.decode();
  const width = 1000;
  const height = Math.round(width * (image.naturalHeight / image.naturalWidth));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d")!;
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);
  return { data: canvas.toDataURL("image/jpeg", 0.92), ratio: height / width };
}

export async function downloadMeetingPdf(meeting: {
  details: MeetingDetails;
  startedAt: string;
  endedAt: string;
  attendees: Attendee[];
}) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentWidth = pageWidth - MARGIN * 2;
  let y = MARGIN;

  const logo = await loadLogo();
  const logoWidth = 150;
  doc.addImage(logo.data, "JPEG", MARGIN, y, logoWidth, logoWidth * logo.ratio);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(MUTED);
  doc.text(`Generated ${dateTime(new Date())}`, pageWidth - MARGIN, y + 10, { align: "right" });
  y += logoWidth * logo.ratio + 32;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("MEETING ATTENDANCE", MARGIN, y);
  y += 24;
  doc.setFontSize(22);
  doc.setTextColor(INK);
  const titleLines = doc.splitTextToSize(meeting.details.name, contentWidth) as string[];
  doc.text(titleLines, MARGIN, y);
  y += titleLines.length * 26 + 8;

  const facts: [string, string][] = [
    ["Place", meeting.details.place],
    ["Organised by", meeting.details.organiser],
    ["Started", dateTime(meeting.startedAt)],
    ["Ended", dateTime(meeting.endedAt)],
    ["Attendees", String(meeting.attendees.length)],
  ];
  doc.setFontSize(10.5);
  for (const [label, value] of facts) {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(MUTED);
    doc.text(label, MARGIN, y);
    doc.setTextColor(INK);
    const lines = doc.splitTextToSize(value, contentWidth - 110) as string[];
    doc.text(lines, MARGIN + 110, y);
    y += lines.length * 15 + 3;
  }
  y += 22;

  // Attendee table: No. | Name | Department | Role | Time
  const cols = [
    { label: "No.", x: MARGIN + 8, width: 28 },
    { label: "Name", x: MARGIN + 40, width: 150 },
    { label: "Department", x: MARGIN + 198, width: 130 },
    { label: "Role", x: MARGIN + 336, width: 92 },
    { label: "Time", x: MARGIN + 436, width: contentWidth - 444 },
  ];

  const header = () => {
    doc.setFillColor(INK);
    doc.rect(MARGIN, y, contentWidth, 24, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor("#ffffff");
    for (const col of cols) doc.text(col.label, col.x, y + 16);
    y += 24;
  };

  header();
  if (meeting.attendees.length === 0) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(MUTED);
    doc.text("No attendees signed in.", MARGIN + 8, y + 20);
  }

  doc.setFontSize(10);
  meeting.attendees.forEach((a, i) => {
    const cells = [String(i + 1), a.name, a.department, a.role, timeOnly(a.joinedAt)];
    const wrapped = cells.map((c, j) => doc.splitTextToSize(c, cols[j].width) as string[]);
    const rowHeight = Math.max(...wrapped.map((w) => w.length)) * 13 + 11;
    if (y + rowHeight > pageHeight - MARGIN - 20) {
      doc.addPage();
      y = MARGIN;
      header();
      doc.setFontSize(10);
    }
    if (i % 2 === 1) {
      doc.setFillColor(ZEBRA);
      doc.rect(MARGIN, y, contentWidth, rowHeight, "F");
    }
    doc.setFont("helvetica", "normal");
    doc.setTextColor(INK);
    wrapped.forEach((lines, j) => doc.text(lines, cols[j].x, y + 16));
    y += rowHeight;
    doc.setDrawColor(LINE);
    doc.line(MARGIN, y, MARGIN + contentWidth, y);
  });

  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page += 1) {
    doc.setPage(page);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor("#a3a3a3");
    doc.text("Information Technology Department, UniKL RCMP", MARGIN, pageHeight - 28);
    doc.text(`Page ${page} of ${pages}`, pageWidth - MARGIN, pageHeight - 28, { align: "right" });
  }

  const slug =
    meeting.details.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40) || "meeting";
  const day = new Date(meeting.startedAt).toISOString().slice(0, 10);
  doc.save(`attendance-${slug}-${day}.pdf`);
}
