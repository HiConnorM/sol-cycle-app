import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy — Sol Cycle',
  description: 'How Sol Cycle handles your data.',
}

const LAST_UPDATED = 'May 2025'
const CONTACT_EMAIL = 'privacy@solcycle.app'
const MIN_AGE = 13

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 bg-background/90 backdrop-blur border-b border-border px-5 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to Sol Cycle
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-10 space-y-10">
        <div>
          <h1 className="text-3xl font-semibold mb-2">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>
        </div>

        <Section title="The short version">
          <p>
            Sol Cycle stores everything — your cycle logs, symptoms, moods, notes, and settings —
            only on your device. Nothing is sent to any server. We do not have an account system.
            We do not sell your data. We do not use your health data for advertising. You can
            delete everything at any time directly inside the app.
          </p>
        </Section>

        <Section title="What data Sol Cycle stores">
          <p className="mb-3">All data is stored in your browser&apos;s local storage on your device only:</p>
          <ul className="space-y-2 list-none">
            <Li>Cycle logs — flow level, symptoms, moods, pain level, energy, notes, pain location, basal body temperature</Li>
            <Li>Cycle settings — last period start date, average cycle and period length, tracking enabled</Li>
            <Li>App preferences — theme, week start day, notification preferences, care mode selections</Li>
            <Li>Derived data — a cached cycles index and pattern summaries computed from your logs</Li>
          </ul>
          <p className="mt-3 text-sm text-muted-foreground">
            This data never leaves your device. Sol Cycle has no servers that receive health data.
          </p>
        </Section>

        <Section title="What data Sol Cycle does not store or transmit">
          <ul className="space-y-2 list-none">
            <Li>No name, email address, phone number, or any identifying information — there is no account</Li>
            <Li>No location data</Li>
            <Li>No biometric data (Face ID and Touch ID are handled entirely by your device — Sol Cycle never receives the result)</Li>
            <Li>No data is transmitted to Sol Cycle or any third party</Li>
            <Li>No data is sold, shared, or used for advertising or profiling</Li>
          </ul>
        </Section>

        <Section title="Analytics and diagnostics">
          <p>
            Sol Cycle uses Vercel Analytics to collect anonymous, aggregated usage data (such as page
            views and general app performance). This data does not include any cycle, health, mood,
            or symptom information. It cannot be linked back to any individual user. You can disable
            JavaScript analytics in your browser settings.
          </p>
        </Section>

        <Section title="How to delete your data">
          <p className="mb-3">
            All your data can be permanently deleted from within the app:
          </p>
          <ol className="space-y-1 list-decimal list-inside text-sm">
            <li>Open the side menu (☰ icon)</li>
            <li>Go to Privacy &amp; Data</li>
            <li>Tap Delete All Data and confirm</li>
          </ol>
          <p className="mt-3 text-sm text-muted-foreground">
            This immediately and permanently removes all Sol Cycle data from your device.
            Because data is never sent to a server, there is nothing to request deletion of remotely.
          </p>
        </Section>

        <Section title="Data export">
          <p>
            You can export your cycle history at any time as a JSON file from Settings → Privacy &amp; Data
            → Export All Data. This file contains your complete log history in a portable format.
            Additional export formats are planned for a future update.
          </p>
        </Section>

        <Section title="Minimum age">
          <p>
            Sol Cycle is intended for users aged {MIN_AGE} and older. The app is not designed for
            or directed at children under {MIN_AGE}. If you are a parent or guardian and believe
            your child under {MIN_AGE} has used Sol Cycle, please delete the app and clear the
            device&apos;s browser storage.
          </p>
        </Section>

        <Section title="GDPR — rights for users in the European Economic Area">
          <p className="mb-3">
            Because Sol Cycle processes no personal data on any server, most GDPR obligations do not
            apply in the traditional sense. However, in the spirit of the regulation:
          </p>
          <ul className="space-y-2 list-none">
            <Li><strong>Right of access</strong> — your data is already fully accessible to you on your device. Use Export All Data to download it.</Li>
            <Li><strong>Right to erasure</strong> — use Delete All Data in Privacy &amp; Data. Deletion is immediate and complete.</Li>
            <Li><strong>Right to portability</strong> — use Export All Data to download your history as JSON.</Li>
            <Li><strong>Right to object</strong> — there is no profiling, automated decision-making, or data processing on our servers. Vercel Analytics collects only anonymous, non-health aggregated data. You can disable this via browser settings.</Li>
          </ul>
          <p className="mt-3 text-sm text-muted-foreground">
            For any GDPR-related questions, contact{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="underline">{CONTACT_EMAIL}</a>.
          </p>
        </Section>

        <Section title="Medical disclaimer">
          <p>
            Sol Cycle is a personal tracking and awareness tool. It is not a medical device. It does
            not provide medical advice, diagnoses, or treatment recommendations. Information and
            patterns shown in Sol Cycle are for personal awareness only and should not be used to
            make medical decisions. Always consult a qualified healthcare provider for any medical
            concerns.
          </p>
        </Section>

        <Section title="Changes to this policy">
          <p>
            If this policy changes materially, a notice will be shown inside the app on first launch
            after the update. The latest version will always be available at this URL.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            Questions about this policy:{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="underline text-foreground">
              {CONTACT_EMAIL}
            </a>
          </p>
        </Section>
      </main>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">{title}</h2>
      <div className="text-sm text-muted-foreground leading-relaxed space-y-2">{children}</div>
    </section>
  )
}

function Li({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <span className="text-muted-foreground mt-0.5 flex-shrink-0">•</span>
      <span>{children}</span>
    </li>
  )
}
