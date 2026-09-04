import { Link } from "react-router-dom";

const SECTIONS = [
  {
    title: "1. Acceptance of Terms",
    content: `By creating an account or using Shiftly, you agree to these Terms of Service. If you do not agree, do not use the platform.`,
  },
  {
    title: "2. Eligibility",
    content: `You must be at least 18 years old to use Shiftly. You must provide accurate, complete information during registration and keep your account information up to date.

By using Shiftly, you represent that you meet these requirements and have the legal capacity to enter into these terms.`,
  },
  {
    title: "3. Account Verification",
    content: `Every user — job seekers and vendors — must complete identity verification before their account is fully activated. Shiftly reserves the right to reject or deactivate accounts that fail verification or that we reasonably believe are fraudulent.`,
  },
  {
    title: "4. Platform Role",
    content: `Shiftly is a platform that connects job seekers with vendors for shift-based employment. We are not a party to any employment relationship between users.

Shiftly does not guarantee job placement, payment, or the conduct of any user on the platform.`,
  },
  {
    title: "5. Job Listings",
    content: `Vendors are responsible for the accuracy and legality of their job listings. All listings must include clear information about pay, schedule, location, and job requirements.

Shiftly reserves the right to remove listings that violate our policies or that we determine to be misleading or fraudulent.`,
  },
  {
    title: "6. Messaging & Conduct",
    content: `All communication between users must occur through Shiftly messaging. Harassment, discrimination, spam, or any abusive behavior is strictly prohibited and may result in account termination.`,
  },
  {
    title: "7. Ratings & Reviews",
    content: `After completing a shift, both job seekers and vendors may leave a rating and review. Ratings reflect your genuine experience. Manipulating, fabricating, or retaliating through ratings is a violation of these terms.`,
  },
  {
    title: "8. Intellectual Property",
    content: `All content, design, and code on Shiftly are owned by or licensed to us. You may not copy, modify, or distribute any part of the platform without our written consent.`,
  },
  {
    title: "9. Limitation of Liability",
    content: `To the maximum extent permitted by law, Shiftly is not liable for any indirect, incidental, or consequential damages arising from your use of the platform.

Our total liability shall not exceed the amount you paid us in the twelve months preceding the claim, or $100, whichever is greater.`,
  },
  {
    title: "10. Termination",
    content: `We may suspend or terminate your account at any time if we determine you have violated these terms or engaged in conduct harmful to the platform or its users.

You may delete your account at any time through your account settings.`,
  },
  {
    title: "11. Changes to Terms",
    content: `We may update these terms from time to time. Material changes will be communicated via email or platform notification. Continued use after changes constitutes acceptance.`,
  },
  {
    title: "12. Governing Law",
    content: `These terms are governed by the laws of the State of New York, without regard to conflict of law principles.`,
  },
  {
    title: "13. Contact",
    content: `Questions about these Terms? Contact us at support@shiftly.app.`,
  },
];

export default function TermsPage() {
  return (
    <>
      <section className="bg-gradient-to-b from-primary-50/50 to-white py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-neutral-900">
            Terms of Service
          </h1>
          <p className="mt-4 text-neutral-500">
            Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>
      </section>

      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-neutral-600 leading-relaxed mb-12">
            These Terms of Service govern your use of the Shiftly platform.
            Please read them carefully.
          </p>

          <div className="space-y-10">
            {SECTIONS.map((section) => (
              <div key={section.title}>
                <h2 className="text-xl font-bold text-neutral-900 mb-3">
                  {section.title}
                </h2>
                <div className="text-neutral-600 text-sm leading-relaxed whitespace-pre-line">
                  {section.content}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 pt-8 border-t border-neutral-100 text-center">
            <p className="text-sm text-neutral-500">
              Questions?{" "}
              <Link
                to="/contact"
                className="font-medium text-primary-600 hover:text-primary-700"
              >
                Contact us
              </Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
