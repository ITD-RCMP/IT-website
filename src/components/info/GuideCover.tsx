import { Play } from "lucide-react";
import { Asterisk } from "@/components/Asterisk";
import { isVideo } from "@/lib/text";

// Theme colours cycled for guides that have no image.
const PLACEHOLDERS = [
  { bg: "bg-[#2F6BFF]", fg: "text-[#FFD93D]" },
  { bg: "bg-[#FFD93D]", fg: "text-[#7B61FF]" },
  { bg: "bg-[#FF7A2F]", fg: "text-white" },
  { bg: "bg-[#7B61FF]", fg: "text-[#FFD93D]" },
  { bg: "bg-neutral-950", fg: "text-[#FF7A2F]" },
];

export function GuideCover({
  imagePath,
  title,
  index,
  className = "",
}: {
  imagePath: string | null;
  title: string;
  index: number;
  className?: string;
}) {
  if (!imagePath) {
    const p = PLACEHOLDERS[index % PLACEHOLDERS.length];
    return (
      <div className={`flex items-center justify-center ${p.bg} ${className}`}>
        <Asterisk className={`w-1/4 max-w-20 ${p.fg}`} duration={20} />
      </div>
    );
  }

  if (isVideo(imagePath)) {
    return (
      <div className={`relative bg-neutral-950 ${className}`}>
        <video
          src={imagePath}
          muted
          playsInline
          preload="metadata"
          className="h-full w-full object-cover opacity-90"
        />
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur">
            <Play className="ml-0.5 h-5 w-5 fill-neutral-900 text-neutral-900" />
          </span>
        </span>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden bg-neutral-100 ${className}`}>
      <img
        src={imagePath}
        alt={title}
        className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.04]"
      />
    </div>
  );
}
