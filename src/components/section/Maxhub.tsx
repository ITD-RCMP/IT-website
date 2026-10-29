import { LinkSection, type SectionLink } from "./LinkSection";

const APPS: SectionLink[] = [
  {
    title: "MAXHUB Screen Share",
    description: "Cast your screen to MAXHUB displays.",
    href: "https://www.maxhub.com/en/screen_share",
    cta: "Download",
    tile: { bg: "bg-[#7B61FF]", fg: "text-[#FFD93D]" },
  },
  {
    title: "MAXHUB Connect",
    description: "Share, control, and collaborate in meetings.",
    href: "https://connect.maxhub.com/downloads",
    cta: "Download",
    tile: { bg: "bg-[#FF7A2F]", fg: "text-white" },
  },
];

export function MaxhubSection({ onClose }: { onClose: () => void }) {
  return (
    <LinkSection
      id="maxhub"
      label="Downloads"
      title="MaxHub"
      description="Download the apps for wireless screen sharing and meeting collaboration."
      links={APPS}
      closeLabel="Back to top"
      onClose={onClose}
    />
  );
}
