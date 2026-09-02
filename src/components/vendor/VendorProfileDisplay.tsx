import type { VendorProfile } from "../../types";
import { BUSINESS_TYPES } from "../../types";

const BUSINESS_TYPE_LABELS: Record<string, string> = Object.fromEntries(
  BUSINESS_TYPES.map((bt) => [bt.value, bt.label]),
);

export function VerificationBadge({ status }: { status: string }) {
  if (status === "approved") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700 border border-green-200">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        Verified
      </span>
    );
  }
  if (status === "pending") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700 border border-amber-200">
        <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Verification pending
      </span>
    );
  }
  if (status === "rejected") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-sm font-medium text-red-700 border border-red-200">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
        Verification rejected
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-neutral-100 px-3 py-1 text-sm text-neutral-500">
      Not verified
    </span>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-neutral-900">{title}</h3>
      {children}
    </section>
  );
}

function EmptyState({ text }: { text: string }) {
  return <p className="text-sm text-neutral-400 italic">{text}</p>;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-3">
      <span className="w-32 shrink-0 text-sm font-medium text-neutral-700">
        {label}
      </span>
      <span className="text-sm text-neutral-600 break-words">{value}</span>
    </div>
  );
}

export default function VendorProfileDisplay({
  profile,
}: {
  profile: VendorProfile;
}) {
  const { businessInfo, location, verification } = profile;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xl font-bold text-primary-700">
            {businessInfo.businessName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">
              {businessInfo.businessName}
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              {(businessInfo.businessType && BUSINESS_TYPE_LABELS[businessInfo.businessType]) || "Business"}
            </p>
          </div>
        </div>
        <VerificationBadge status={verification.status} />
      </div>

      {/* Danger notice if rejected */}
      {verification.status === "rejected" && verification.rejectionReason && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p className="font-medium mb-1">Verification rejected</p>
          <p>Reason: {verification.rejectionReason}</p>
        </div>
      )}

      {/* About */}
      <Section title="About">
        {businessInfo.description ? (
          <p className="text-sm text-neutral-600 whitespace-pre-line">
            {businessInfo.description}
          </p>
        ) : (
          <EmptyState text="No description added yet." />
        )}
      </Section>

      {/* Contact */}
      <Section title="Contact Details">
        <div className="flex flex-col gap-3">
          <Row label="Website" value={businessInfo.website || "—"} />
          <Row label="Phone" value={businessInfo.phone || "—"} />
          <Row label="Contact email" value={businessInfo.contactEmail || "—"} />
        </div>
      </Section>

      {/* Location */}
      <Section title="Business Location">
        <div className="flex flex-col gap-3">
          <Row
            label="City"
            value={[location.city, location.state, location.country].filter(Boolean).join(", ") || "—"}
          />
          <Row label="Address" value={location.address || "—"} />
        </div>
      </Section>
    </div>
  );
}
