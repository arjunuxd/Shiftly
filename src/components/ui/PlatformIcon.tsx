import type { DeveloperPlatformKey } from "../../lib/developerContact";

export default function PlatformIcon({
  platform,
  className = "h-5 w-5",
}: {
  platform: DeveloperPlatformKey;
  className?: string;
}) {
  const strokeClasses = className + " fill-none stroke-current";
  switch (platform) {
    case "instagram":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
        </svg>
      );
    case "linkedin":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8h4V24h-4V8zm7.5 0h3.8v2.2h.05c.53-.94 1.83-1.94 3.87-1.94 4.13 0 4.88 2.6 4.88 6V24h-4v-7.7c0-1.84-.03-4.2-2.6-4.2-2.6 0-3 2-3 4.05V24H8V8z" />
        </svg>
      );
    case "github":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55v-2c-3.2.7-3.87-1.54-3.87-1.54-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 015.79 0c2.21-1.49 3.18-1.18 3.18-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.7 5.38-5.27 5.67.41.36.78 1.06.78 2.14V22.5c0 .3.21.67.8.55A11.52 11.52 0 0023.5 12c0-6.35-5.15-11.5-11.5-11.5z" />
        </svg>
      );
    case "x":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.24 2.25h3.31l-7.23 8.26L22.75 21.75h-6.66l-5.22-6.82-5.97 6.82H1.6l7.73-8.84L1.25 2.25h6.83l4.71 6.23 5.45-6.23zm-1.16 17.52h1.83L6.98 4.09H5.02l12.06 15.68z" />
        </svg>
      );
    case "portfolio":
      return (
        <svg className={strokeClasses} viewBox="0 0 24 24" strokeWidth={1.6}>
          <circle cx="12" cy="12" r="9.25" />
          <path strokeLinecap="round" d="M3 12h18M12 2.75c2.5 2.4 3.75 5.7 3.75 9.25S14.5 18.85 12 21.25c-2.5-2.4-3.75-5.7-3.75-9.25S9.5 5.15 12 2.75z" />
        </svg>
      );
    case "email":
      return (
        <svg className={strokeClasses} viewBox="0 0 24 24" strokeWidth={1.6}>
          <rect x="2.75" y="5" width="18.5" height="14" rx="3" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.5 6.5l7.6 6.2a1.4 1.4 0 001.8 0l7.6-6.2" />
        </svg>
      );
    default:
      return (
        <svg className={strokeClasses} viewBox="0 0 24 24" strokeWidth={1.6}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
        </svg>
      );
  }
}

export function isMailto(url: string, platform: DeveloperPlatformKey): boolean {
  return platform === "email" || url.startsWith("mailto:");
}

export function isExternalSocialLink(
  url: string,
  platform: DeveloperPlatformKey,
): boolean {
  return !isMailto(url, platform);
}