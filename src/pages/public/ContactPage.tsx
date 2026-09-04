import { Link } from "react-router-dom";
import PlatformIcon, {
  isMailto,
} from "../../components/ui/PlatformIcon";
import {
  DEVELOPER_PLATFORM_META,
  developerProfile,
  getConfiguredPlatforms,
  type ConfiguredPlatform,
  type DeveloperPlatformKey,
} from "../../lib/developerContact";

const FOCUS_RING =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600";

function ctaLabel(platform: ConfiguredPlatform): string {
  switch (platform.key) {
    case "email":
      return `Email me — ${platform.handle}`;
    case "linkedin":
      return "Connect on LinkedIn";
    case "github":
      return "View GitHub";
    default:
      return platform.cta;
  }
}

export default function ContactPage() {
  const name = developerProfile.name.trim();
  const role = developerProfile.role.trim();
  const location = developerProfile.location.trim();
  const initials = developerProfile.initials.trim();
  const bio = developerProfile.bio.trim();
  const intro = developerProfile.intro.trim();

  const emailUrl = developerProfile.platforms.email.url.trim();
  const emailHandle = developerProfile.platforms.email.handle.trim();
  const hasEmail = emailUrl.length > 0 && emailHandle.length > 0;

  const platforms = getConfiguredPlatforms();
  const ctaOrder: DeveloperPlatformKey[] = ["email", "linkedin", "github"];
  const ctaPlatforms = ctaOrder
    .map((key) => platforms.find((p) => p.key === key))
    .filter((p): p is ConfiguredPlatform => Boolean(p));
  const primaryCta = ctaPlatforms[0] ?? null;
  const secondaryCta = ctaPlatforms.slice(1);

  const introParagraphs = intro
    ? intro.split(/\n\n|\n/)
    : [
        "I care about products that respect people's time — interfaces that are honest, flows that don't waste anyone's day, and the small details that quietly make things easier.",
        "Shiftly is where I apply that thinking to flexible work.",
      ];

  const whatIBuild = [
    "Digital products",
    "Web experiences",
    "Useful tools",
    "Experimental ideas",
  ];

  const interests = [
    "Product Design",
    "Web Development",
    "Technology",
    "Creative Problem Solving",
  ];

  const whyPoints = [
    {
      number: "01",
      title: "Transparent listings",
      body: "Pay, schedule, and expectations are shown up front — no hidden terms.",
    },
    {
      number: "02",
      title: "Verified profiles",
      body: "Every account is checked before it's active, so trust is built in.",
    },
    {
      number: "03",
      title: "Fair matching",
      body: "Both sides rate each other after every shift — accountability in both directions.",
    },
  ];

  return (
    <>
      {/* ============================ HERO ============================ */}
      <section className="overflow-hidden bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-4 pt-16 pb-16 sm:px-6 sm:pt-24 sm:pb-24 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16 lg:px-8">
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-primary-600">
              The person behind the product
            </p>
            <h1 className="text-4xl font-bold leading-[1.08] tracking-tight text-neutral-900 sm:text-5xl lg:text-[3.4rem]">
              Meet the developer
              <br />
              behind Shiftly.
            </h1>
            <div className="mt-6 flex items-baseline gap-3">
              <p className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
                {name}
              </p>
              {location && (
                <span className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium text-neutral-500">
                  {location}
                </span>
              )}
            </div>
            {role && <p className="mt-1 text-sm font-medium text-primary-600">{role}</p>}
            {bio && (
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-neutral-500">
                {bio}
              </p>
            )}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {hasEmail && (
                <a
                  href={emailUrl}
                  className={`inline-flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-700 hover:shadow-card-hover ${FOCUS_RING}`}
                >
                  <PlatformIcon platform="email" className="h-4 w-4" />
                  {DEVELOPER_PLATFORM_META.email.cta}
                </a>
              )}
              <Link
                to="/about"
                className={`inline-flex items-center justify-center rounded-lg border border-neutral-300 bg-white px-6 py-3 text-sm font-semibold text-neutral-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-neutral-400 hover:bg-neutral-50 ${FOCUS_RING}`}
              >
                About Shiftly
              </Link>
            </div>
          </div>

          {/* Identity visual — typographic, no photograph */}
          <div className="relative">
            <div className="absolute -top-16 -right-10 h-52 w-52 rounded-full bg-primary-200/40 blur-3xl" />
            <div className="absolute -bottom-14 -left-10 h-52 w-52 rounded-full bg-accent-200/40 blur-3xl" />
            <div className="relative overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-50 shadow-card">
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-24 opacity-[0.06]"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, #1f2937 1px, transparent 1px), linear-gradient(to bottom, #1f2937 1px, transparent 1px)",
                  backgroundSize: "28px 28px",
                }}
              />
              <div className="relative flex flex-col items-center px-8 py-12 text-center sm:py-16">
                <span className="rounded-full border border-neutral-200 bg-white px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
                  Developer &amp; Builder
                </span>
                <div className="mt-8 flex h-28 w-28 items-center justify-center rounded-2xl bg-neutral-900 text-5xl font-bold tracking-tight text-white shadow-card sm:h-32 sm:w-32 sm:text-6xl">
                  {initials}
                </div>
                <p
                  className="mt-7 text-[11px] font-semibold uppercase tracking-[0.3em] text-neutral-400"
                  aria-hidden="true"
                >
                  {role}
                </p>
                <div className="mt-4 h-px w-16 bg-neutral-200" />
                <p className="mt-4 text-xs font-bold uppercase tracking-[0.3em] text-primary-600">
                  Shiftly
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== WHO I AM / WHAT I BUILD ==================== */}
      <section className="border-y border-neutral-200 bg-neutral-50">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[minmax(0,6fr)_minmax(0,6fr)] lg:gap-16 lg:px-8">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary-600">
              A little about me
            </p>
            <h2 className="text-3xl font-bold leading-tight tracking-tight text-neutral-900 sm:text-4xl">
              Here&apos;s what&nbsp;I build.
            </h2>
            <div className="mt-6 space-y-4 text-base leading-relaxed text-neutral-500">
              {introParagraphs.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
            <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-primary-100 bg-primary-50 px-4 py-2">
              <span className="h-2 w-2 rounded-full bg-primary-500" />
              <span className="text-sm font-medium text-primary-700">
                Currently building — Shiftly
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-card">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                What I build
              </p>
              <ul className="mt-4 space-y-3">
                {whatIBuild.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500" />
                    <span className="text-sm font-medium text-neutral-800">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-card">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                Interested in
              </p>
              <ul className="mt-4 space-y-3">
                {interests.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500" />
                    <span className="text-sm font-medium text-neutral-800">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ======================= WHY I BUILT SHIFTLY ======================= */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-20">
            <div>
              <p className="sticky top-24 text-xs font-semibold uppercase tracking-widest text-primary-600">
                The story
              </p>
            </div>
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold leading-tight tracking-tight text-neutral-900 sm:text-4xl">
                It started with a simple frustration.
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-neutral-500">
                Finding flexible work usually means scattered listings, vague
                pay, and no way to tell what&apos;s real. Shiftly was built to
                change that — a single place where workers can trust what
                they&apos;re applying to and employers can trust who they&apos;re
                hiring.
              </p>
              <blockquote className="mt-8 border-l-2 border-primary-600 pl-5">
                <p className="text-xl font-medium leading-relaxed tracking-tight text-neutral-800">
                  Flexible work shouldn&apos;t feel like a gamble. It should feel
                  as fair and human as any other way to make a living.
                </p>
              </blockquote>
              <div className="mt-10 divide-y divide-neutral-100 border-y border-neutral-100">
                {whyPoints.map((point) => (
                  <div key={point.number} className="flex gap-6 py-5">
                    <span className="shrink-0 text-xs font-bold text-primary-600 pt-1">
                      {point.number}
                    </span>
                    <div>
                      <h3 className="text-base font-semibold text-neutral-900">
                        {point.title}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-neutral-500">
                        {point.body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SHIFTLY PRODUCT CONNECTION ================= */}
      <section className="bg-neutral-900 text-white">
        <div className="relative mx-auto max-w-6xl overflow-hidden px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="absolute -top-24 right-1/4 h-64 w-64 rounded-full bg-primary-600/20 blur-3xl" />
          <div className="absolute -bottom-28 left-1/4 h-64 w-64 rounded-full bg-accent-500/10 blur-3xl" />
          <p className="relative text-xs font-semibold uppercase tracking-widest text-primary-300">
            One of the things I&apos;m building
          </p>
          <div className="relative mt-6 flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-5xl font-black tracking-tight sm:text-6xl lg:text-7xl">
                Shiftly
              </p>
              <p className="mt-3 text-xl font-medium text-neutral-300">
                Find your next shift.
              </p>
            </div>
            <Link
              to="/"
              className={`inline-flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-500 ${FOCUS_RING}`}
            >
              Explore Shiftly
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
          <p className="relative mt-8 max-w-xl text-base leading-relaxed text-neutral-400">
            Shiftly is being built to rethink how people discover and connect
            with flexible work — transparent listings, verified people, and
            matches that feel fair on both sides.
          </p>
        </div>
      </section>

      {/* ======================= COLLABORATION CTA ======================= */}
      <section className="bg-white">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 sm:py-24 lg:px-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary-600">
            Let&apos;s talk
          </p>
          <h2 className="text-3xl font-bold leading-tight tracking-tight text-neutral-900 sm:text-4xl">
            Have an idea?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-neutral-500">
            Want to collaborate, talk about the product, or just say hello?
            I&apos;m always happy to hear from people who care about good work.
          </p>
          {primaryCta ? (
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a
                href={primaryCta.url}
                target={
                  isMailto(primaryCta.url, primaryCta.key)
                    ? undefined
                    : "_blank"
                }
                rel={
                  isMailto(primaryCta.url, primaryCta.key)
                    ? undefined
                    : "noopener noreferrer"
                }
                className={`inline-flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-700 hover:shadow-card-hover ${FOCUS_RING}`}
              >
                <PlatformIcon platform={primaryCta.key} className="h-4 w-4" />
                {ctaLabel(primaryCta)}
              </a>
              {secondaryCta.map((platform) => (
                <a
                  key={platform.key}
                  href={platform.url}
                  target={
                    isMailto(platform.url, platform.key)
                      ? undefined
                      : "_blank"
                  }
                  rel={
                    isMailto(platform.url, platform.key)
                      ? undefined
                      : "noopener noreferrer"
                  }
                  aria-label={`${platform.name} — ${platform.handle}`}
                  className={`inline-flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-6 py-3 text-sm font-semibold text-neutral-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-neutral-400 hover:bg-neutral-50 ${FOCUS_RING}`}
                >
                  <PlatformIcon platform={platform.key} className="h-4 w-4" />
                  {ctaLabel(platform)}
                </a>
              ))}
            </div>
          ) : (
            <Link
              to="/about"
              className={`mt-8 inline-flex items-center justify-center rounded-lg border border-neutral-300 bg-white px-6 py-3 text-sm font-semibold text-neutral-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-neutral-400 hover:bg-neutral-50 ${FOCUS_RING}`}
            >
              About Shiftly
            </Link>
          )}
        </div>
      </section>
    </>
  );
}