import type { MeetingDetails } from "@/lib/meeting-api";

export type TicketData = {
  name: string;
  department: string;
  role: string;
  date: string;
  time: string;
};

const W = 1080;
const PAD = 64;
const CARD_X = PAD;
const CARD_W = W - PAD * 2;
const INNER = 16;
const STUB_X = CARD_X + INNER;
const STUB_W = CARD_W - INNER * 2;
const TEXT_X = STUB_X + 56;
const TEXT_W = STUB_W - 112;

const HEADING = '"Bricolage Grotesque", "Schibsted Grotesk", sans-serif';
const SANS = '"Schibsted Grotesk", "Helvetica Neue", Arial, sans-serif';
const MONO = 'ui-monospace, "SF Mono", Menlo, Consolas, monospace';

function wrap(ctx: CanvasRenderingContext2D, text: string, width: number) {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width <= width || !line) line = next;
    else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function asterisk(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  color: string,
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineCap = "round";
  ctx.lineWidth = size * 0.22;
  for (const deg of [15, 75, 135]) {
    const a = (deg * Math.PI) / 180;
    const r = size * 0.37;
    ctx.beginPath();
    ctx.moveTo(cx - Math.cos(a) * r, cy - Math.sin(a) * r);
    ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    ctx.stroke();
  }
  ctx.restore();
}

async function loadImage(src: string) {
  const img = new Image();
  img.src = src;
  await img.decode();
  return img;
}

export async function renderTicketPng(meeting: MeetingDetails, ticket: TicketData): Promise<Blob> {
  await Promise.all([
    document.fonts.load(`600 80px ${HEADING}`),
    document.fonts.load(`500 30px ${SANS}`),
    document.fonts.load(`600 30px ${SANS}`),
  ]).catch(() => {});
  const logo = await loadImage("/unikl-official.png").catch(() => null);

  // Measure pass: the title and values can wrap, so work out the height first.
  const measure = document.createElement("canvas").getContext("2d")!;
  measure.font = `600 76px ${HEADING}`;
  const titleLines = wrap(measure, meeting.name, TEXT_W - 60);
  measure.font = `500 30px ${SANS}`;
  const halfW = (TEXT_W - 40) / 2;
  const placeLines = wrap(measure, meeting.place, halfW - 44);
  const orgLines = wrap(measure, meeting.organiser, halfW - 44);
  measure.font = `600 34px ${SANS}`;
  const rows: [string, string][] = [
    ["NAME", ticket.name],
    ["DEPARTMENT", ticket.department],
    ["ROLE", ticket.role],
    ["SIGNED IN", `${ticket.date}, ${ticket.time}`],
  ];
  const rowLines = rows.map(([, v]) => wrap(measure, v, halfW));
  const rowHeight = (i: number) => 34 + Math.max(rowLines[i].length, rowLines[i + 1].length) * 44;

  const stubTop = PAD + INNER;
  const stubH =
    56 +
    52 +
    40 +
    titleLines.length * 82 +
    40 +
    Math.max(placeLines.length, orgLines.length) * 38 +
    30 +
    56;
  const perfY = stubTop + stubH + 34;
  const detailsTop = perfY + 50;
  const detailsH = rowHeight(0) + 36 + rowHeight(2);
  const cardBottom = detailsTop + detailsH + 48;
  const footerTop = cardBottom + 48;
  const H = footerTop + 90 + PAD;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  ctx.textBaseline = "top";

  ctx.fillStyle = "#FAFAF8";
  ctx.fillRect(0, 0, W, H);

  // Card
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.06)";
  ctx.shadowBlur = 50;
  ctx.shadowOffsetY = 16;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.roundRect(CARD_X, PAD, CARD_W, cardBottom - PAD, 56);
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = "#ececea";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(CARD_X, PAD, CARD_W, cardBottom - PAD, 56);
  ctx.stroke();

  // Purple stub
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(STUB_X, stubTop, STUB_W, stubH, 44);
  ctx.clip();
  ctx.fillStyle = "#7B61FF";
  ctx.fillRect(STUB_X, stubTop, STUB_W, stubH);
  asterisk(ctx, STUB_X + STUB_W - 40, stubTop + 40, 260, "rgba(255,217,61,0.92)");
  ctx.restore();

  let y = stubTop + 56;
  ctx.font = `500 24px ${MONO}`;
  const badge = "Signed in";
  const badgeW = ctx.measureText(badge).width + 86;
  ctx.fillStyle = "rgba(255,255,255,0.18)";
  ctx.beginPath();
  ctx.roundRect(TEXT_X, y, badgeW, 52, 26);
  ctx.fill();
  ctx.fillStyle = "#FFD93D";
  ctx.beginPath();
  ctx.arc(TEXT_X + 30, y + 26, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.fillText(badge, TEXT_X + 52, y + 13);
  y += 52 + 40;

  ctx.font = `600 76px ${HEADING}`;
  ctx.fillStyle = "#ffffff";
  for (const line of titleLines) {
    ctx.fillText(line, TEXT_X, y);
    y += 82;
  }
  y += 40;

  const meta = (x: number, label: string, lines: string[]) => {
    ctx.font = `500 20px ${MONO}`;
    ctx.fillStyle = "rgba(255,255,255,0.65)";
    ctx.fillText(label, x, y);
    ctx.font = `500 30px ${SANS}`;
    ctx.fillStyle = "#ffffff";
    lines.forEach((l, i) => ctx.fillText(l, x, y + 30 + i * 38));
  };
  meta(TEXT_X, "PLACE", placeLines);
  meta(TEXT_X + halfW + 40, "ORGANISED BY", orgLines);

  // Perforation with notches cut into the card edge
  ctx.fillStyle = "#FAFAF8";
  ctx.strokeStyle = "#ececea";
  ctx.lineWidth = 2;
  for (const x of [CARD_X, CARD_X + CARD_W]) {
    ctx.beginPath();
    ctx.arc(x, perfY, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  ctx.setLineDash([16, 12]);
  ctx.lineWidth = 3;
  ctx.strokeStyle = "#e5e5e5";
  ctx.beginPath();
  ctx.moveTo(CARD_X + 48, perfY);
  ctx.lineTo(CARD_X + CARD_W - 48, perfY);
  ctx.stroke();
  ctx.setLineDash([]);

  // Attendee details, 2 x 2
  y = detailsTop;
  for (let i = 0; i < rows.length; i += 2) {
    [0, 1].forEach((col) => {
      const x = TEXT_X + col * (halfW + 40);
      ctx.font = `500 22px ${MONO}`;
      ctx.fillStyle = "#737373";
      ctx.fillText(rows[i + col][0], x, y);
      ctx.font = `600 34px ${SANS}`;
      ctx.fillStyle = "#0a0a0a";
      rowLines[i + col].forEach((l, j) => ctx.fillText(l, x, y + 34 + j * 44));
    });
    y += rowHeight(i) + 36;
  }

  // Footer
  if (logo) {
    const lh = 64;
    ctx.drawImage(logo, CARD_X + 8, footerTop, (logo.naturalWidth / logo.naturalHeight) * lh, lh);
  }
  ctx.textAlign = "right";
  ctx.font = `600 24px ${SANS}`;
  ctx.fillStyle = "#171717";
  ctx.fillText("Information Technology Department", CARD_X + CARD_W - 8, footerTop + 4);
  ctx.font = `400 22px ${SANS}`;
  ctx.fillStyle = "#737373";
  ctx.fillText("UniKL Royal College of Medicine Perak", CARD_X + CARD_W - 8, footerTop + 38);

  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("PNG export failed"))), "image/png"),
  );
}

export function ticketFileName(meeting: MeetingDetails, ticket: TicketData) {
  const slug = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 30);
  return `ticket-${slug(meeting.name) || "meeting"}-${slug(ticket.name) || "attendee"}.png`;
}
