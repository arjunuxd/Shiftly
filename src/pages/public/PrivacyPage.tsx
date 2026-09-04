import { Link } from "react-router-dom";

const SECTIONS = [
  {
    title: "1. Information We Collect",
    content: `When you create an account, we collect your name, email address, and any profile information you choose to provide. For job seekers, this may include skills, work history, and availability. For vendors, this includes business name and registration details.

We automatically collect certain device and usage information when you access Shiftly, including IP address, browser type, device identifiers, and pages visited.`,
  },
  {
    title: "2. How We Use Your Information",
    content: `We use your information to operate the Shiftly platform, including verifying your identity, matching you with relevant opportunities, and facilitating communication between job seekers and vendors.

We may also use your information to send platform-related notifications, respond to your inquiries, and improve our services.`,
  },
  {
    title: "3. How We Share Your Information",
    content: `Your profile information is visible to other verified users on the platform as necessary to facilitate job matching and communication. Job seekers can control which profile details are visible to vendors.

We do not sell your personal information to third parties. We may share information with service providers who assist in operating the platform, subject to contractual obligations to protect your data.`,
  },
  {
    title: "4. Data Security",
    content: `We use AES-256 encryption for data at rest and TLS 1.3 for data in transit. Our infrastructure is hosted on Firebase (Google Cloud), which maintains SOC 2 Type II compliance.

While we take reasonable measures to protect your information, no method of transmission or storage is 100% secure.`,
  },
  {
    title: "5. Data Retention",
    content: `We retain your account information for as long as your account is active. If you delete your account, we will remove your personal data within 30 days, except where required by law or for legitimate business purposes such as fraud prevention.`,
  },
  {
    title: "6. Your Rights",
    content: `Depending on your location, you may have the right to access, correct, or delete your personal data. You can manage most of your data directly through your Shiftly account settings.

To exercise additional rights, contact us at support@shiftly.app.`,
  },
  {
    title: "7. Cookies",
    content: `Shiftly uses essential cookies to maintain your session and ensure platform functionality. We do not use advertising or tracking cookies.

You can manage cookie preferences through your browser settings.`,
  },
  {
    title: "8. Children's Privacy",
    content: `Shiftly is not intended for users under the age of 18. We do not knowingly collect information from children. If we become aware that a child has provided us with personal data, we will take steps to delete it.`,
  },
  {
    title: "9. Changes to This Policy",
    content: `We may update this Privacy Policy from time to time. We will notify you of material changes by posting the updated policy on this page and, where appropriate, by email.`,
  },
  {
    title: "10. Contact",
    content: `If you have questions about this Privacy Policy, contact us at:

support@shiftly.app`,
  },
];

export default function PrivacyPage() {
  return (
    <>
      <section className="bg-gradient-to-b from-primary-50/50 to-white py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-neutral-900">
            Privacy Policy
          </h1>
          <p className="mt-4 text-neutral-500">
            Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>
      </section>

      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-neutral max-w-none">
            <p className="text-neutral-600 leading-relaxed mb-12">
              This Privacy Policy describes how Shiftly (&quot;we,&quot;
              &quot;us,&quot; or &quot;our&quot;) collects, uses, and protects
              your personal information when you use our platform and services.
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
