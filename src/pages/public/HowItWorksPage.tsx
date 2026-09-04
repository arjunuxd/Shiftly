import { Link } from "react-router-dom";

const SEEKER_STEPS = [
  {
    number: "01",
    title: "Sign Up & Verify",
    description:
      "Create your free account in under 2 minutes. Complete a brief identity verification — our team reviews every profile before it goes live.",
  },
  {
    number: "02",
    title: "Build Your Profile",
    description:
      "Add your skills, experience, availability, and location preferences. Your profile is your Shiftly resume — visible only to verified employers.",
  },
  {
    number: "03",
    title: "Browse & Apply",
    description:
      "Search jobs by pay, schedule, location, and type. Every listing shows full details upfront. Apply with one tap.",
  },
  {
    number: "04",
    title: "Work & Get Paid",
    description:
      "Accept your offer, complete the shift, and get paid. Rate your experience and build your reputation over time.",
  },
];

const VENDOR_STEPS = [
  {
    number: "01",
    title: "Register Your Business",
    description:
      "Sign up with your business details. Our trust team verifies your account before you can post jobs — keeping the platform safe.",
  },
  {
    number: "02",
    title: "Post a Shift",
    description:
      "Describe the role, set the pay rate, choose a schedule, and publish. Your listing is immediately shown to verified, available workers in your area.",
  },
  {
    number: "03",
    title: "Review Applications",
    description:
      "Browse applicants with their verified profiles, ratings, and experience. Message candidates directly through the platform.",
  },
  {
    number: "04",
    title: "Hire & Manage",
    description:
      "Accept the best fit, coordinate through messaging, and manage everything from your dashboard. Leave a rating after each shift.",
  },
];

const FAQ_ITEMS = [
  {
    q: "Is Shiftly free to use?",
    a: "Yes. Creating an account, browsing jobs, and applying are completely free for job seekers. Vendors can post their first listing at no cost.",
  },
  {
    q: "How does verification work?",
    a: "Every user — job seeker and vendor — goes through identity verification. We check government ID, cross-reference business details, and manually review each account before approval.",
  },
  {
    q: "What types of jobs are listed?",
    a: "Shiftly focuses on part-time, temporary, and shift-based work: warehouse, events, hospitality, food service, retail, and more. All roles are local and in-person.",
  },
  {
    q: "How do payments work?",
    a: "Payments are handled between you and the employer. Shiftly provides the platform for connecting, messaging, and managing the working relationship.",
  },
  {
    q: "Can I use Shiftly on mobile?",
    a: "Yes. Shiftly is fully responsive and works on any device — phone, tablet, or desktop.",
  },
];

export default function HowItWorksPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-primary-50/50 to-white py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-neutral-900">
            How Shiftly Works
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-neutral-500 leading-relaxed max-w-2xl mx-auto">
            A simple, transparent process for job seekers and employers alike.
          </p>
        </div>
      </section>

      {/* For Job Seekers */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900">
              For Job Seekers
            </h2>
            <p className="mt-4 text-lg text-neutral-500">
              From sign-up to your first shift in under a day.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {SEEKER_STEPS.map((step) => (
              <div
                key={step.number}
                className="relative bg-neutral-50 rounded-2xl p-8 border border-neutral-100"
              >
                <span className="text-5xl font-extrabold text-primary-100/80 select-none">
                  {step.number}
                </span>
                <h3 className="text-lg font-semibold text-neutral-900 mt-2">
                  {step.title}
                </h3>
                <p className="mt-3 text-neutral-500 leading-relaxed text-sm">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              to="/register"
              className="inline-flex px-7 py-3.5 bg-primary-600 text-white font-semibold rounded-2xl hover:bg-primary-700 transition-all hover:shadow-xl hover:shadow-primary-600/25 active:scale-[0.97]"
            >
              Get Started as a Job Seeker
            </Link>
          </div>
        </div>
      </section>

      {/* For Vendors */}
      <section className="py-20 sm:py-28 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900">
              For Vendors
            </h2>
            <p className="mt-4 text-lg text-neutral-500">
              Fill your open shifts with verified, reliable workers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {VENDOR_STEPS.map((step) => (
              <div
                key={step.number}
                className="relative bg-white rounded-2xl p-8 border border-neutral-200"
              >
                <span className="text-5xl font-extrabold text-primary-100/80 select-none">
                  {step.number}
                </span>
                <h3 className="text-lg font-semibold text-neutral-900 mt-2">
                  {step.title}
                </h3>
                <p className="mt-3 text-neutral-500 leading-relaxed text-sm">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              to="/register"
              className="inline-flex px-7 py-3.5 bg-primary-600 text-white font-semibold rounded-2xl hover:bg-primary-700 transition-all hover:shadow-xl hover:shadow-primary-600/25 active:scale-[0.97]"
            >
              Get Started as a Vendor
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-neutral-900 text-center mb-16">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {FAQ_ITEMS.map((item) => (
              <div
                key={item.q}
                className="bg-neutral-50 rounded-2xl p-6 border border-neutral-100"
              >
                <h3 className="font-semibold text-neutral-900">{item.q}</h3>
                <p className="mt-3 text-sm text-neutral-500 leading-relaxed">
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
