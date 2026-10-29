import type { ComponentType } from "react";
import {
  Cloud,
  GraduationCap,
  Headphones,
  LayoutDashboard,
  Megaphone,
  Monitor,
  Projector,
  type LucideIcon,
} from "lucide-react";
import {
  CloudArt,
  HelpdeskArt,
  InfoArt,
  MaxhubArt,
  PortalArt,
  ProjectorArt,
  SystemsArt,
  VleArt,
} from "./OrbitArt";

export type ServiceSection = "maxhub" | "systems";

export type Service = {
  label: string;
  description: string;
  href: string;
  // opens an inline section on the home page instead of navigating
  section?: ServiceSection;
  // small icon used by the mobile grid and the hover popup
  Icon?: LucideIcon;
  imgSrc?: string;
  imgAlt?: string;
  iconClassName?: string;
  bg: string;
  fg: string;
  // illustrated card shown in the desktop orbit
  Art: ComponentType<{ className?: string }>;
  // resting rotation of the orbit card, in degrees
  tilt: number;
};

export const SERVICES: Service[] = [
  {
    label: "Info",
    description: "Announcements, guides and the latest updates from the IT Department.",
    href: "/information",
    Icon: Megaphone,
    bg: "bg-[#0A84FF]",
    fg: "text-white",
    Art: InfoArt,
    tilt: -5,
  },
  {
    label: "Systems",
    description: "Quick links to internal platforms like VenuQuip, NexCheck and the helpdesk.",
    href: "#systems",
    section: "systems",
    Icon: Monitor,
    bg: "bg-neutral-900",
    fg: "text-white",
    Art: SystemsArt,
    tilt: 4,
  },
  {
    label: "UniKL VLE",
    description: "Virtual Learning Environment for course materials, assignments and quizzes.",
    href: "https://vle.unikl.edu.my/",
    Icon: GraduationCap,
    bg: "bg-[#FFCC00]",
    fg: "text-neutral-900",
    Art: VleArt,
    tilt: -3,
  },
  {
    label: "Portal",
    description: "UniKL CAS portal: one sign-in for student and staff campus services.",
    href: "https://cas.unikl.edu.my/",
    Icon: LayoutDashboard,
    bg: "bg-[#FF3B30]",
    fg: "text-white",
    Art: PortalArt,
    tilt: 6,
  },
  {
    label: "MaxHub Connect",
    description: "Apps for wireless screen sharing to the MaxHub panels in classrooms.",
    href: "#maxhub",
    section: "maxhub",
    imgSrc: "/maxhub.png",
    imgAlt: "MaxHub",
    iconClassName: "invert",
    bg: "bg-neutral-950",
    fg: "text-white",
    Art: MaxhubArt,
    tilt: -6,
  },
  {
    label: "Epson iProjection",
    description: "Project your laptop or phone wirelessly to Epson projectors.",
    href: "https://epson.com/support/wireless-projector-support",
    Icon: Projector,
    bg: "bg-white border border-neutral-200",
    fg: "text-neutral-900",
    Art: ProjectorArt,
    tilt: 3,
  },
  {
    label: "Cloud Drive",
    description: "Microsoft 365: Outlook, OneDrive, Teams and the Office apps.",
    href: "https://www.office.com/",
    Icon: Cloud,
    bg: "bg-[#0061FE]",
    fg: "text-white",
    Art: CloudArt,
    tilt: -4,
  },
  {
    label: "Helpdesk",
    description: "Report an IT issue or request support from our team.",
    href: "http://rush.rcmp.edu.my",
    Icon: Headphones,
    bg: "bg-[#FF9500]",
    fg: "text-white",
    Art: HelpdeskArt,
    tilt: 5,
  },
];
