import { useState } from "react";

export function initialsFor(name: string): string {
  const cleaned = (name ?? "").trim();
  if (!cleaned) return "?";
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const PALETTE = [
  "bg-rose-500",
  "bg-orange-500",
  "bg-amber-500",
  "bg-emerald-500",
  "bg-teal-500",
  "bg-sky-500",
  "bg-indigo-500",
  "bg-violet-500",
  "bg-fuchsia-500",
];

function colorFor(name: string): string {
  const cleaned = (name ?? "").trim();
  if (!cleaned) return "bg-neutral-400";
  const hash = cleaned
    .split("")
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return PALETTE[hash % PALETTE.length];
}

interface AvatarProps {
  name: string;
  src?: string | null;
  className?: string;
  textClassName?: string;
}

export default function Avatar({
  name,
  src,
  className = "",
  textClassName = "",
}: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(src) && !failed;

  if (showImage) {
    return (
      <img
        src={src as string}
        alt={name || "Profile"}
        className={`shrink-0 rounded-full object-cover ${className}`}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full ${colorFor(
        name,
      )} text-white ${className}`}
      aria-hidden
    >
      <span className={`font-bold leading-none ${textClassName}`}>
        {initialsFor(name)}
      </span>
    </div>
  );
}
