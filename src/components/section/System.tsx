import { LinkSection, type SectionLink } from "./LinkSection";

const SYSTEMS: SectionLink[] = [
  {
    title: "VenuQuip",
    description: "Venue booking system.",
    href: "https://vequip.rcmp.edu.my",
    cta: "Open VenuQuip",
    tile: { bg: "bg-[#2F6BFF]", fg: "text-[#FFD93D]" },
  },
  {
    title: "Nexcheck",
    description: "Request for ITD equipment.",
    href: "https://nims.rcmp.edu.my",
    cta: "Open Nexcheck",
    tile: { bg: "bg-[#FFD93D]", fg: "text-[#7B61FF]" },
  },
  {
    title: "Helpdesk",
    description: "Submit and track complaints.",
    href: "http://rush.rcmp.edu.my",
    cta: "Open Helpdesk",
    tile: { bg: "bg-neutral-950", fg: "text-[#FF7A2F]" },
  },
  {
    title: "Meeting Attendance",
    description: "QR code sign-in sheet for any meeting.",
    href: "/meeting",
    cta: "Start a meeting",
    tile: { bg: "bg-[#7B61FF]", fg: "text-white" },
    internal: true,
  },
];

export function SystemSection({ onClose }: { onClose: () => void }) {
  return (
    <LinkSection
      id="systems"
      label="Quick links"
      title="Internal Systems"
      description="Quick links to the department’s internal platforms."
      links={SYSTEMS}
      closeLabel="Back to top"
      onClose={onClose}
    />
  );
}
