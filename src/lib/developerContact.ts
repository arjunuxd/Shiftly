/**
 * ============================================================================
 * SHIFTLY — DEVELOPER PROFILE (SINGLE SOURCE OF TRUTH)
 * ============================================================================
 *
 * This file powers the "Meet the developer behind Shiftly" Contact page,
 * the hero identity visual, and the footer social links.
 *
 * EVERYTHING BELOW IS DEMO / PLACEHOLDER DATA so the page looks complete
 * before the real developer details are added.
 *
 * To make this page yours, replace the values in `developerProfile` below:
 *
 *   name        → your name
 *   role        → your role
 *   location    → your location
 *   initials    → your initials
 *   bio         → your one-line bio
 *   intro       → your longer intro (optional)
 *   each platform url + handle → your real links/handles
 *
 * Leave a platform's `url` empty ("") to hide that platform everywhere.
 * The typographic identity visual (initials) is always used — no photograph
 * is required.
 *
 * The Contact page and the Footer read from this object and update
 * automatically. No other file needs to be edited.
 * ============================================================================
 */

export type DeveloperPlatformKey =
  | "instagram"
  | "linkedin"
  | "github"
  | "x"
  | "portfolio"
  | "email";

export interface DeveloperPlatformConfig {
  /** Display handle shown on the card (e.g. "@arjunaacharry" or "Arjun A Acharry"). */
  handle: string;
  /** Full URL (e.g. "https://github.com/arjunuxd"). Leave "" to hide the platform. */
  url: string;
  /** Optional. Overrides the default one-line description. */
  description?: string;
  /** Optional. Overrides the default call-to-action label. */
  cta?: string;
}

export interface DeveloperProfileConfig {
  /** Developer's display name (e.g. "Arjun A Acharry"). */
  name: string;
  /** Short role line (e.g. "Developer & Product Builder"). */
  role: string;
  /** Location shown on the page (e.g. "India, Kerala"). */
  location: string;
  /** Initials used for the identity visual (e.g. "AA"). */
  initials: string;
  /** One-line bio used in the hero. */
  bio: string;
  /** Optional longer personal intro. Leave "" to fall back to the default copy. */
  intro: string;
  /** Per-platform connection links. Only platforms with a non-empty url are shown. */
  platforms: Record<DeveloperPlatformKey, DeveloperPlatformConfig>;
}

export const DEVELOPER_PLATFORM_META: Record<
  DeveloperPlatformKey,
  { name: string; description: string; cta: string }
> = {
  instagram: {
    name: "Instagram",
    description: "Behind the scenes of the build.",
    cta: "Follow",
  },
  linkedin: {
    name: "LinkedIn",
    description: "Let's connect professionally.",
    cta: "Connect",
  },
  github: {
    name: "GitHub",
    description: "See what I'm building.",
    cta: "View",
  },
  x: {
    name: "X",
    description: "Thoughts, ideas & updates.",
    cta: "Follow",
  },
  portfolio: {
    name: "Portfolio",
    description: "Explore my work.",
    cta: "Visit",
  },
  email: {
    name: "Email",
    description: "Send me a message.",
    cta: "Email",
  },
};

/** DEMO / PLACEHOLDER PROFILE — replace with your real details. */
export const developerProfile: DeveloperProfileConfig = {
  name: "Arjun A Acharry",
  role: "Developer & Product Designer",
  location: "India, Kerala",
  initials: "AA",
  bio: "Building digital products that make complicated things feel simple. Shiftly is one of those ideas.",
  intro:
    "I care about products that respect people's time — interfaces that are honest, flows that don't waste anyone's day, and the small details that quietly make things easier.\n\nShiftly is where I apply that thinking to flexible work.",
  platforms: {
    instagram: {
      handle: "@arjunaacharry",
      url: "https://instagram.com/arjunaacharry",
    },
    linkedin: {
      handle: "Arjun A Acharry",
      url: "https://www.linkedin.com/in/arjun-a-acharry/",
    },
    github: {
      handle: "arjunuxd",
      url: "https://github.com/arjunuxd",
    },
    x: {
      handle: "@a_acharry13885",
      url: "https://x.com/a_acharry13885",
    },
    portfolio: {
      handle: "arjunaacharry",
      url: "https://arjunaacharry",
    },
    email: {
      handle: "arjunaacharry",
      url: "mailto:arjunaacharry01@gmail.com",
    },
  },
};

export interface ConfiguredPlatform {
  key: DeveloperPlatformKey;
  url: string;
  name: string;
  handle: string;
  description: string;
  cta: string;
}

/** Returns only the platforms that have a real url configured. */
export function getConfiguredPlatforms(): ConfiguredPlatform[] {
  const result: ConfiguredPlatform[] = [];
  for (const key of Object.keys(
    developerProfile.platforms,
  ) as DeveloperPlatformKey[]) {
    const platform = developerProfile.platforms[key];
    const meta = DEVELOPER_PLATFORM_META[key];
    if (!platform.url || platform.url.trim().length === 0) continue;
    result.push({
      key,
      url: platform.url.trim(),
      name: meta.name,
      handle: platform.handle.trim(),
      description: platform.description?.trim() || meta.description,
      cta: platform.cta?.trim() || meta.cta,
    });
  }
  return result;
}