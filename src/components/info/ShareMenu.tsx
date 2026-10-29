import React from "react";
import { Check, Link2, Mail, MessageCircle, Share2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ShareMenu({
  url,
  title,
  variant = "overlay",
}: {
  url: string;
  title: string;
  variant?: "overlay" | "inline";
}) {
  const [copied, setCopied] = React.useState(false);

  const absoluteUrl = React.useMemo(() => {
    if (typeof window === "undefined") return url;
    try {
      return new URL(url, window.location.origin).toString();
    } catch {
      return url;
    }
  }, [url]);

  const encodedUrl = encodeURIComponent(absoluteUrl);
  const encodedTitle = encodeURIComponent(title);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(absoluteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  }

  const triggerClassName =
    variant === "overlay"
      ? "inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-neutral-800 shadow-sm backdrop-blur transition hover:bg-white hover:text-[#2F5BD3]"
      : "inline-flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-neutral-700 transition hover:bg-neutral-200 hover:text-[#2F5BD3]";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          aria-label="Share"
          className={triggerClassName}
        >
          <Share2 className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-52 rounded-2xl p-1.5"
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenuItem asChild>
          <a
            href={`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex cursor-pointer items-center gap-2 rounded-xl"
          >
            <MessageCircle className="h-4 w-4 text-[#25D366]" />
            WhatsApp
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a
            href={`https://outlook.office.com/mail/deeplink/compose?subject=${encodedTitle}&body=${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex cursor-pointer items-center gap-2 rounded-xl"
          >
            <Mail className="h-4 w-4 text-[#0078D4]" />
            Outlook
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a
            href={`mailto:?subject=${encodedTitle}&body=${encodedUrl}`}
            className="flex cursor-pointer items-center gap-2 rounded-xl"
          >
            <Mail className="h-4 w-4 text-neutral-500" />
            Email
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
            void handleCopy();
          }}
          className="flex cursor-pointer items-center gap-2 rounded-xl"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-600" />
          ) : (
            <Link2 className="h-4 w-4 text-neutral-500" />
          )}
          {copied ? "Link copied!" : "Copy link"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
