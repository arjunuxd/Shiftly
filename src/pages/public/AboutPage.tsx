import { Link } from "react-router-dom";

export default function AboutPage() {
  return (
    <>
      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-16 sm:pb-20">
          <p className="text-xs font-semibold text-primary-600 uppercase tracking-widest mb-4">
            About Shiftly
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900 leading-tight max-w-2xl">
            A better way to work flexibly.
          </h1>
          <p className="mt-5 text-lg text-neutral-500 leading-relaxed max-w-xl">
            Shiftly exists to fix a broken system. Flexible employment
            should be fair, transparent, and safe for everyone involved.
          </p>
        </div>
      </section>

      <section className="bg-neutral-50 border-y border-neutral-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
            <div>
              <p className="text-xs font-semibold text-primary-600 uppercase tracking-widest mb-3">The problem</p>
              <h2 className="text-2xl font-bold text-neutral-900 mb-4">
                Shift work is underserved.
              </h2>
              <p className="text-neutral-500 leading-relaxed">
                Millions of people work part-time, temporary, and shift-based
                jobs. Yet the tools connecting them with employers are outdated,
                opaque, and often unsafe. Workers don&apos;t know what they&apos;re
                signing up for. Employers can&apos;t find reliable people quickly.
                The system is broken.
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-primary-600 uppercase tracking-widest mb-3">Our approach</p>
              <h2 className="text-2xl font-bold text-neutral-900 mb-4">
                Transparency by default.
              </h2>
              <p className="text-neutral-500 leading-relaxed">
                Every job listing on Shiftly shows pay, schedule, and
                requirements upfront. Every user is verified. Every interaction
                is encrypted. We don&apos;t cut corners on trust because trust
                is the product.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <p className="text-xs font-semibold text-primary-600 uppercase tracking-widest mb-3">Who Shiftly is for</p>
          <h2 className="text-2xl font-bold text-neutral-900 mb-8 max-w-xl">
            Built for two sides of the same coin.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-neutral-50 rounded-xl p-6 border border-neutral-100">
              <h3 className="text-base font-semibold text-neutral-900 mb-2">Job Seekers</h3>
              <p className="text-sm text-neutral-500 leading-relaxed">
                You need flexibility, fair pay, and employers you can
                trust. Shiftly gives you all three. Create a verified
                profile, browse transparent listings, and start working
                on your terms.
              </p>
            </div>
            <div className="bg-neutral-50 rounded-xl p-6 border border-neutral-100">
              <h3 className="text-base font-semibold text-neutral-900 mb-2">Employers</h3>
              <p className="text-sm text-neutral-500 leading-relaxed">
                You need reliable workers, fast. Post a shift in under
                two minutes. Review verified applicants. Hire with
                confidence. Every worker has a profile and reputation
                score you can trust.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-neutral-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <p className="text-xs font-semibold text-primary-400 uppercase tracking-widest mb-3">Our vision</p>
          <h2 className="text-2xl sm:text-3xl font-bold max-w-2xl leading-snug">
            We believe flexible work should be the default, not the
            exception. And the tools supporting it should be as
            trustworthy as the people using them.
          </h2>
          <p className="mt-6 text-neutral-400 max-w-xl leading-relaxed">
            Shiftly is building the infrastructure for the future of work.
            Not just a job board, but a platform where trust is earned,
            verified, and maintained by the community.
          </p>
        </div>
      </section>

      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">
            Join us
          </h2>
          <p className="text-neutral-500 max-w-md mx-auto mb-8">
            Whether you are looking for work or hiring for your next event.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white font-semibold text-sm rounded-lg hover:bg-primary-700 transition-colors"
            >
              Create Account
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center px-6 py-3 border border-neutral-300 text-neutral-700 font-semibold text-sm rounded-lg hover:bg-neutral-50 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
