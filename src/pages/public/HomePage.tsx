import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";

const DEMO_STEPS = [
  { phase: "browse", duration: 2600 },
  { phase: "detail", duration: 2200 },
  { phase: "apply", duration: 1900 },
  { phase: "success", duration: 2600 },
  { phase: "idle", duration: 1200 },
] as const;

const DEMO_JOBS = [
  {
    title: "Warehouse Associate",
    company: "Metro Distribution Co.",
    location: "Mumbai, Maharashtra",
    pay: "₹180/hr",
    shift: "Tomorrow, 6 AM - 2 PM",
    spots: 4,
    category: "Logistics",
  },
  {
    title: "Event Setup Crew",
    company: "Grand Arena Events",
    location: "Bengaluru, Karnataka",
    pay: "₹1,200/day",
    shift: "Saturday, 8 AM - 6 PM",
    spots: 12,
    category: "Events",
  },
  {
    title: "Catering Assistant",
    company: "Harbor Kitchen",
    location: "Kochi, Kerala",
    pay: "₹150/hr",
    shift: "Friday, 3 PM - 11 PM",
    spots: 2,
    category: "Hospitality",
  },
];

const HERO_JOBS = [
  {
    title: "Barista",
    company: "Cornerstone Café",
    location: "Bengaluru, Karnataka",
    pay: "₹180/hr",
    shift: "Fri, 7 AM - 3 PM",
    type: "Part-time",
  },
  {
    title: "Warehouse Associate",
    company: "Metro Distribution Co.",
    location: "Mumbai, Maharashtra",
    pay: "₹180/hr",
    shift: "Tomorrow, 6 AM - 2 PM",
    type: "Shift-based",
  },
  {
    title: "Event Setup Crew",
    company: "Grand Arena Events",
    location: "Kochi, Kerala",
    pay: "₹1,200/day",
    shift: "Sat, 8 AM - 6 PM",
    type: "Event work",
  },
  {
    title: "Delivery Partner",
    company: "QuickCart Logistics",
    location: "Kozhikode, Kerala",
    pay: "₹160/hr",
    shift: "Sun, 9 AM - 5 PM",
    type: "Temporary",
  },
];

const DASHBOARD_SHIFTS = [
  {
    title: "Weekend Delivery Partner",
    applicants: 5,
    filled: 3,
    total: 4,
    location: "Kochi, Kerala",
    applicant: { initials: "RK", name: "Rohan Kulkarni", rating: "4.9" },
  },
  {
    title: "Café Service Assistant",
    applicants: 8,
    filled: 2,
    total: 5,
    location: "Thrissur, Kerala",
    applicant: { initials: "AS", name: "Anjali Suresh", rating: "4.8" },
  },
  {
    title: "Retail Floor Staff",
    applicants: 11,
    filled: 4,
    total: 6,
    location: "Kozhikode, Kerala",
    applicant: { initials: "MT", name: "Muhammed Thakir", rating: "5.0" },
  },
];

const STEPS = [
  {
    number: "01",
    title: "Create your profile",
    desc: "Sign up, add your skills and availability. Get verified by our team.",
  },
  {
    number: "02",
    title: "Discover opportunities",
    desc: "Browse verified jobs near you. Filter by pay, schedule, and type.",
  },
  {
    number: "03",
    title: "Apply and work",
    desc: "Apply with one tap. Accept offers, complete shifts, build your reputation.",
  },
];

const FOR_VENDORS = [
  {
    number: "01",
    title: "Register your business",
    desc: "Create an account and complete verification. Get approved by our trust team.",
  },
  {
    number: "02",
    title: "Post an open shift",
    desc: "Describe the role, set pay and schedule. Your listing reaches verified workers.",
  },
  {
    number: "03",
    title: "Hire and manage",
    desc: "Review applicants, accept the best fit, and manage everything from your dashboard.",
  },
];

const TRUST_POINTS = [
  {
    title: "Verified identities",
    desc: "Every user is verified before their account is activated. No anonymous profiles.",
  },
  {
    title: "Transparent listings",
    desc: "Every job shows pay, schedule, and requirements upfront. No hidden terms.",
  },
  {
    title: "Two-way accountability",
    desc: "Both sides rate each other after every shift. Trust is earned, not assumed.",
  },
];

const FEATURES = [
  {
    title: "Get matched to your next shift",
    desc: "Smart matching surfaces jobs that fit your skills, pay, and schedule — delivered right to your notifications.",
  },
  {
    title: "Save shifts for later",
    desc: "Bookmark interesting opportunities and revisit them anytime with one tap.",
  },
  {
    title: "Earn a reputation worth repeating",
    desc: "Rate completed shifts to build a two-way reputation that unlocks better, repeat work.",
  },
];

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const animated = useRef(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) {
      setCount(target);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animated.current) {
          animated.current = true;
          const duration = 1200;
          const steps = 30;
          const increment = target / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, reduced]);

  return (
    <div ref={ref} className="tabular-nums">
      {count.toLocaleString()}{suffix}
    </div>
  );
}

function InteractiveJobBoard() {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (reduced) return;
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % HERO_JOBS.length);
        setVisible(true);
      }, 350);
    }, 3500);
    return () => clearInterval(interval);
  }, [reduced]);

  const job = HERO_JOBS[index];

  return (
    <div className="relative">
      {/* Decorative glow */}
      <div className="absolute -top-12 -right-10 h-48 w-48 rounded-full bg-primary-300/30 blur-3xl" />
      <div className="absolute -bottom-10 -left-8 h-40 w-40 rounded-full bg-accent-300/30 blur-3xl" />

      {/* Main demo card */}
      <div className="relative rounded-2xl border border-neutral-200 bg-white p-5 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </span>
            <div>
              <p className="text-sm font-bold text-neutral-900">Live opportunities</p>
              <p className="text-xs text-neutral-400">Updated in real time</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-50 px-2.5 py-1 text-[11px] font-semibold text-accent-700">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-500" />
            </span>
            Live
          </span>
        </div>

        {/* Job card with fade transition */}
        <div
          className={`rounded-xl border border-neutral-100 bg-neutral-50 p-4 transition-all duration-300 ${
            visible && !reduced ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold text-neutral-900">
                {job.title}
              </h3>
              <p className="mt-0.5 text-sm text-neutral-500">{job.company}</p>
            </div>
            <span className="shrink-0 rounded-full bg-primary-50 px-2.5 py-1 text-[11px] font-semibold text-primary-700 border border-primary-100">
              {job.pay}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-neutral-500">
            <span className="inline-flex items-center gap-1">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              {job.location}
            </span>
            <span className="inline-flex items-center gap-1">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {job.shift}
            </span>
            <span className="inline-flex items-center gap-1">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              {job.type}
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1 text-[11px] text-neutral-400">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent-500" />
              Employer verified
            </span>
            <button
              type="button"
              tabIndex={-1}
              className="rounded-lg bg-primary-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-primary-700 transition-colors"
            >
              Apply
            </button>
          </div>
        </div>

        {/* Progress dots */}
        <div className="mt-4 flex items-center justify-center gap-1.5">
          {HERO_JOBS.map((j, i) => (
            <button
              key={j.title}
              type="button"
              aria-label={`Show ${j.title}`}
              onClick={() => {
                setIndex(i);
                setVisible(true);
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === index ? "w-5 bg-primary-600" : "w-1.5 bg-neutral-300 hover:bg-neutral-400"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Floating mini-card: application accepted */}
      {!reduced && (
        <div className="absolute -bottom-5 -left-4 sm:-left-8 rounded-xl border border-accent-100 bg-white p-3 shadow-card-hover">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-100 text-accent-600">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </span>
            <div>
              <p className="text-xs font-semibold text-neutral-900">Application accepted</p>
              <p className="text-[11px] text-neutral-400">Request shift confirmation</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EmployerDashboardPreview() {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (reduced) return;
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % DASHBOARD_SHIFTS.length);
        setVisible(true);
      }, 300);
    }, 3500);
    return () => clearInterval(interval);
  }, [reduced]);

  const shift = DASHBOARD_SHIFTS[index];
  const fillPct = Math.round((shift.filled / shift.total) * 100);

  return (
    <div
      className={`rounded-xl border border-neutral-100 bg-neutral-50 p-3.5 transition-all duration-300 ${
        visible && !reduced
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-2"
      }`}
    >
      {/* Listing row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg">
            <svg className="h-3.5 w-3.5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </span>
          <p className="truncate text-xs font-semibold text-neutral-900">
            {shift.title}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-semibold text-primary-700">
          {shift.applicants} applicants
        </span>
      </div>

      {/* Spots progress */}
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-neutral-200/70">
        <div
          className="h-full rounded-full bg-primary-500 transition-all duration-700 ease-out"
          style={{ width: `${fillPct}%` }}
        />
      </div>
      <p className="mt-1.5 text-[10px] text-neutral-400">
        {shift.filled} of {shift.total} spots filled &middot; {shift.location}
      </p>

      {/* Top applicant */}
      <div className="mt-3 flex items-center justify-between gap-3 border-t border-neutral-200/70 pt-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-100 text-[10px] font-bold text-primary-700">
            {shift.applicant.initials}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[11px] font-semibold text-neutral-900">
              {shift.applicant.name}
            </p>
            <span className="inline-flex items-center gap-1 text-[10px] text-accent-600">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Verified &middot; {shift.applicant.rating} rating
            </span>
          </div>
        </div>
        <span className="shrink-0 rounded-lg bg-primary-600 px-2.5 py-1 text-[10px] font-semibold text-white">
          Accept
        </span>
      </div>
    </div>
  );
}

export default function HomePage() {
  const reduced = useReducedMotion();
  const [stepIndex, setStepIndex] = useState(0);
  const [activeJobIndex, setActiveJobIndex] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const advanceStep = useCallback(() => {
    setStepIndex((prev) => {
      const next = (prev + 1) % DEMO_STEPS.length;
      if (DEMO_STEPS[next].phase === "browse") {
        setActiveJobIndex((j) => (j + 1) % DEMO_JOBS.length);
      }
      return next;
    });
  }, []);

  useEffect(() => {
    if (reduced) {
      setStepIndex(3);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      return;
    }
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(advanceStep, DEMO_STEPS[stepIndex].duration);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [stepIndex, advanceStep, reduced]);

  const currentPhase = DEMO_STEPS[stepIndex].phase;
  const job = DEMO_JOBS[activeJobIndex];

  const phaseLabel: Record<string, string> = {
    browse: "Reviewing job details…",
    detail: "Checking your profile…",
    apply: "Submitting application…",
    success: "Application submitted",
    idle: "",
  };

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-4 pt-16 pb-20 sm:px-6 sm:pt-24 lg:grid-cols-2 lg:gap-8 lg:px-8">
          <div className="animate-fade-in-up">
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-primary-600">
              Flexible employment, done right
            </p>
            <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-neutral-900 sm:text-5xl lg:text-[3.4rem]">
              Find work that
              <br />
              fits your life.
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-neutral-500">
              Shiftly connects verified job seekers with local part-time,
              temporary, and shift-based opportunities. Transparent pay.
              Real employers. No surprises.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/register"
                className="inline-flex items-center justify-center rounded-lg bg-primary-600 px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-700 hover:shadow-card-hover"
              >
                Find Work
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center justify-center rounded-lg border border-neutral-300 bg-white px-6 py-3 text-sm font-semibold text-neutral-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-neutral-400 hover:bg-neutral-50"
              >
                Hire Workers
              </Link>
            </div>
            <p className="mt-4 text-xs text-neutral-400">
              Free to join &middot; No credit card &middot; Verified users only
            </p>
          </div>

          {/* Interactive job board */}
          <div className={`${reduced ? "" : "animate-fade-in-up animation-delay-200"}`}>
            <InteractiveJobBoard />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-y border-neutral-200 bg-neutral-50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mb-12 max-w-2xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary-600">
              How it works
            </p>
            <h2 className="text-2xl font-bold text-neutral-900 sm:text-3xl">
              Three steps to your next shift.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-neutral-500">
              A simple, guided flow that gets verified workers into good jobs
              and keeps employers in control from day one.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {STEPS.map((step) => (
              <div key={step.number} className="rounded-xl border border-neutral-200 bg-white p-6 shadow-card transition-all duration-200 hover:shadow-card-hover">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-sm font-bold text-primary-600">{step.number}</span>
                <h3 className="mt-4 text-base font-semibold text-neutral-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Demo */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="order-2 lg:order-1">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary-600">
                Made for job seekers
              </p>
              <h2 className="mb-4 text-2xl font-bold text-neutral-900 sm:text-3xl">
                Matched, saved, and applied — fast.
              </h2>
              <p className="leading-relaxed text-neutral-500">
                No more hunting for pay details or wondering if a listing is
                legit. Shiftly shows you everything a job involves up front,
                matches you to the right shifts, and lets you apply with one
                tap.
              </p>
              <div className="mt-8 space-y-4">
                {FEATURES.map((f) => (
                  <div key={f.title} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-100 text-accent-600">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-neutral-800">{f.title}</p>
                      <p className="text-sm text-neutral-500">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Auto-animating demo card */}
            <div className="order-1 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 sm:p-5 lg:order-2">
              <div className="mb-4 grid grid-cols-3 gap-1.5">
                {DEMO_JOBS.map((j, i) => (
                  <button
                    key={j.title}
                    type="button"
                    tabIndex={-1}
                    className={`truncate rounded-md px-2 py-2 text-[11px] font-medium transition-all duration-200 sm:text-xs ${
                      i === activeJobIndex
                        ? "bg-primary-600 text-white"
                        : "bg-neutral-200 text-neutral-500 hover:bg-neutral-300"
                    }`}
                  >
                    {j.title}
                  </button>
                ))}
              </div>

              <div className="rounded-xl border border-neutral-100 bg-white p-5 shadow-soft">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="truncate text-base font-semibold text-neutral-900">
                      {job.title}
                    </h4>
                    <p className="mt-0.5 text-xs text-neutral-500">{job.company}</p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all duration-300 ${
                      currentPhase === "success"
                        ? "bg-accent-100 text-accent-700"
                        : "bg-primary-50 text-primary-700"
                    }`}
                  >
                    {currentPhase === "success" ? "Applied" : job.category}
                  </span>
                </div>

                <div className="mb-4 grid grid-cols-2 gap-2.5">
                  <div className="rounded-lg border border-neutral-100 bg-neutral-50 p-3">
                    <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-400">Pay</span>
                    <p className="mt-0.5 text-sm font-semibold text-neutral-900">{job.pay}</p>
                  </div>
                  <div className="rounded-lg border border-neutral-100 bg-neutral-50 p-3">
                    <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-400">Spots</span>
                    <p className="mt-0.5 text-sm font-semibold text-neutral-900">
                      {job.spots} left
                    </p>
                  </div>
                  <div className="rounded-lg border border-neutral-100 bg-neutral-50 p-3">
                    <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-400">When</span>
                    <p className="mt-0.5 text-sm font-semibold text-neutral-900">{job.shift}</p>
                  </div>
                  <div className="rounded-lg border border-neutral-100 bg-neutral-50 p-3">
                    <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-400">Where</span>
                    <p className="mt-0.5 text-sm font-semibold text-neutral-900">{job.location}</p>
                  </div>
                </div>

                <div className="mb-3 flex items-center gap-1.5 text-[11px] text-neutral-400">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent-500" />
                  Employer verified
                </div>

                {/* Application progress */}
                <div className="relative h-10 overflow-hidden rounded-lg border border-neutral-100 bg-neutral-50">
                  {reduced ? (
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-accent-700">
                      Application submitted
                    </div>
                  ) : (
                    <>
                      <div
                        key={stepIndex}
                        className={`absolute inset-0 flex items-center px-4 text-xs font-medium ${
                          currentPhase === "success"
                            ? "justify-center gap-2 bg-accent-50 text-accent-700"
                            : currentPhase === "apply"
                              ? "justify-center gap-2 text-primary-600"
                              : "text-neutral-500"
                        } animate-fade-in`}
                      >
                        {currentPhase === "apply" ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-300 border-t-primary-600" />
                        ) : currentPhase === "success" ? (
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : null}
                        {phaseLabel[currentPhase]}
                      </div>
                      {currentPhase === "success" && (
                        <div className="absolute bottom-0 left-0 h-0.5 w-full animate-[progress_2.6s_linear_forwards] bg-accent-500" />
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Vendors */}
      <section className="border-y border-neutral-200 bg-neutral-50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="order-2 lg:order-1">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary-600">
                For employers
              </p>
              <h2 className="mb-4 text-2xl font-bold text-neutral-900 sm:text-3xl">
                Fill shifts with verified workers.
              </h2>
              <p className="mb-8 leading-relaxed text-neutral-500">
                Post a shift in under two minutes. Review pre-vetted applicants.
                Hire with confidence. Every worker on Shiftly has a verified
                profile and a reputation you can trust.
              </p>
              <div className="space-y-3">
                {FOR_VENDORS.map((step) => (
                  <div key={step.number} className="flex gap-3">
                    <span className="mt-0.5 shrink-0 text-xs font-bold text-primary-600">{step.number}</span>
                    <div>
                      <h4 className="text-sm font-semibold text-neutral-900">{step.title}</h4>
                      <p className="mt-0.5 text-xs leading-relaxed text-neutral-500">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                to="/register"
                className="mt-8 inline-flex rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-700 hover:shadow-card-hover"
              >
                Start Hiring
              </Link>
            </div>

            {/* Employer dashboard preview */}
            <div className="order-1 rounded-2xl border border-neutral-200 bg-white p-5 shadow-card lg:order-2">
              {/* Header */}
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-xs font-bold text-primary-600">
                    SG
                  </span>
                  <div>
                    <p className="text-sm font-bold text-neutral-900">Employer Dashboard</p>
                    <p className="text-[11px] text-neutral-400">SG Foods &amp; Services</p>
                  </div>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-accent-100 bg-accent-50 px-2 py-0.5 text-[10px] font-semibold text-accent-700">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Verified
                </span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="rounded-lg border border-neutral-100 bg-neutral-50 p-3">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-400">Active Listings</span>
                  <p className="mt-0.5 text-xl font-bold text-neutral-900">3</p>
                </div>
                <div className="rounded-lg border border-neutral-100 bg-neutral-50 p-3">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-400">Applications</span>
                  <p className="mt-0.5 text-xl font-bold text-neutral-900">18</p>
                </div>
                <div className="rounded-lg border border-neutral-100 bg-neutral-50 p-3">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-400">Shifts Filled</span>
                  <p className="mt-0.5 text-xl font-bold text-neutral-900">42</p>
                </div>
                <div className="rounded-lg border border-neutral-100 bg-neutral-50 p-3">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-400">Avg. Time to Fill</span>
                  <p className="mt-0.5 text-xl font-bold text-neutral-900">4.2h</p>
                </div>
              </div>

              {/* Mini bar chart */}
              <div className="mt-3 rounded-lg border border-neutral-100 bg-neutral-50 p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="truncate text-[10px] font-medium uppercase tracking-wider text-neutral-400">
                    Applications, 7 days
                  </span>
                  <span className="shrink-0 text-[10px] font-semibold text-neutral-500">18 total</span>
                </div>
                <div className="flex h-8 items-end gap-1.5">
                  {[4, 6, 3, 8, 5, 9, 12].map((value, i) => (
                    <div
                      key={i}
                      className={`animate-bar-grow flex-1 rounded-sm ${
                        i === 6 ? "bg-primary-600" : "bg-primary-200"
                      }`}
                      style={{
                        height: `${Math.round((value / 12) * 100)}%`,
                        animationDelay: `${i * 60}ms`,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Animated listing + top applicant */}
              <div className="mt-3">
                <EmployerDashboardPreview />
              </div>

              {/* Preview note */}
              <div className="mt-3 flex items-center gap-2 rounded-lg border border-dashed border-neutral-200 bg-neutral-50/60 px-3 py-2">
                <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-accent-500" />
                <span className="text-[11px] font-medium text-neutral-500">
                  Interactive dashboard preview within the app
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mb-12 max-w-2xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary-600">
              Trust &amp; safety
            </p>
            <h2 className="text-2xl font-bold text-neutral-900 sm:text-3xl">
              Security is the foundation, not a feature.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-neutral-500">
              Every listing, every profile, every shift is backed by
              verification and accountability, so both sides can focus on
              the work.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {TRUST_POINTS.map((point) => (
              <div key={point.title} className="rounded-xl border border-neutral-200 bg-white p-6 shadow-card transition-all duration-200 hover:shadow-card-hover">
                <h3 className="text-sm font-semibold text-neutral-900">{point.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-500">{point.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-neutral-900 text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mb-12 max-w-2xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary-400">
              The state of the platform
            </p>
            <h2 className="text-2xl font-bold sm:text-3xl">
              Built to scale with real demand.
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-8 text-center sm:grid-cols-4">
            <div>
              <div className="text-3xl font-bold sm:text-4xl text-primary-300">
                <AnimatedCounter target={10} suffix="+" />
              </div>
              <p className="mt-2 text-sm text-neutral-400">Job categories</p>
            </div>
            <div>
              <div className="text-3xl font-bold sm:text-4xl text-primary-300">
                <AnimatedCounter target={5} />
              </div>
              <p className="mt-2 text-sm text-neutral-400">Work types supported</p>
            </div>
            <div>
              <div className="text-3xl font-bold sm:text-4xl text-primary-300">
                <AnimatedCounter target={24} suffix="h" />
              </div>
              <p className="mt-2 text-sm text-neutral-400">Support response time</p>
            </div>
            <div>
              <div className="text-3xl font-bold sm:text-4xl text-primary-300">
                <AnimatedCounter target={100} suffix="%" />
              </div>
              <p className="mt-2 text-sm text-neutral-400">Verified users</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary-600">
            Get started
          </p>
          <h2 className="mb-4 text-2xl font-bold text-neutral-900 sm:text-3xl">
            Ready to get started?
          </h2>
          <p className="mx-auto mb-8 max-w-md text-neutral-500">
            Join Shiftly today. Whether you need work or need workers, we have
            you covered.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/register"
              className="inline-flex items-center justify-center rounded-lg bg-primary-600 px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-700 hover:shadow-card-hover"
            >
              Create Free Account
            </Link>
            <Link
              to="/jobs"
              className="inline-flex items-center justify-center rounded-lg border border-neutral-300 bg-white px-6 py-3 text-sm font-semibold text-neutral-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-neutral-400 hover:bg-neutral-50"
            >
              Browse Jobs
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
