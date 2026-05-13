import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Use — Sol Cycle',
  description: 'Terms of use for Sol Cycle.',
}

const LAST_UPDATED = 'May 2025'
const CONTACT_EMAIL = 'privacy@solcycle.app'
const MIN_AGE = 13

export default function TermsPage() {
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
          <h1 className="text-3xl font-semibold mb-2">Terms of Use</h1>
          <p className="text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>
        </div>

        <Section title="Agreement">
          <p>
            By using Sol Cycle, you agree to these terms. If you do not agree, please do not use
            the app. These terms apply to the Sol Cycle app and any associated web pages.
          </p>
        </Section>

        <Section title="Minimum age">
          <p>
            You must be at least {MIN_AGE} years old to use Sol Cycle. By using the app, you
            confirm that you are {MIN_AGE} or older. Sol Cycle is not designed for or directed
            at children under {MIN_AGE}.
          </p>
        </Section>

        <Section title="Not medical advice">
          <p className="font-medium text-foreground">
            Sol Cycle is a personal tracking tool. It is not a medical device, medical service,
            or healthcare provider.
          </p>
          <p>
            Nothing in Sol Cycle — including cycle predictions, symptom patterns, phase
            estimates, or any insight — constitutes medical advice, a diagnosis, or a treatment
            recommendation. All information is for personal awareness and educational purposes only.
          </p>
          <p>
            Always consult a qualified healthcare provider before making any health-related
            decisions. Do not delay or disregard professional medical advice because of
            anything you see in Sol Cycle.
          </p>
        </Section>

        <Section title="Not for emergencies">
          <p>
            Sol Cycle is not an emergency service. If you are experiencing a medical emergency,
            call emergency services (911 in the US, 999 in the UK, 112 in the EU, or your local
            emergency number) immediately.
          </p>
          <p>
            If you are in crisis or may hurt yourself, call or text{' '}
            <strong>988</strong> (Suicide &amp; Crisis Lifeline, US and Canada) or contact
            your local crisis service. Sol Cycle is not able to connect you with emergency
            help or crisis support.
          </p>
        </Section>

        <Section title="Your data and your responsibility">
          <p>
            All data you enter into Sol Cycle is stored only on your device. Sol Cycle has no
            access to your data and cannot recover it if it is lost or deleted.
          </p>
          <ul className="space-y-2 list-none">
            <Li>You are responsible for exporting or backing up your data if you want to preserve it.</Li>
            <Li>You are responsible for deleting your data before uninstalling the app or wiping your device.</Li>
            <Li>Clearing your browser or device storage will permanently delete all Sol Cycle data.</Li>
            <Li>Sol Cycle cannot restore deleted data under any circumstances.</Li>
          </ul>
        </Section>

        <Section title="Predictions and estimates">
          <p>
            Cycle predictions, ovulation windows, phase estimates, and any other date or health
            estimates in Sol Cycle are personal reflections based on your logged history. They are
            not guarantees, clinical measurements, or reliable contraception tools.
          </p>
          <p>
            Sol Cycle should not be used as a method of contraception or family planning. If you
            are trying to conceive or avoid pregnancy, consult a healthcare provider.
          </p>
        </Section>

        <Section title="Acceptable use">
          <p>Sol Cycle is for personal use only. You agree not to:</p>
          <ul className="space-y-2 list-none">
            <Li>Use the app in any way that violates applicable laws or regulations</Li>
            <Li>Attempt to reverse engineer, copy, or redistribute the app without permission</Li>
            <Li>Use the app to harm yourself or others</Li>
          </ul>
        </Section>

        <Section title="Disclaimer of warranties">
          <p>
            Sol Cycle is provided &quot;as is&quot; without any warranties, express or implied.
            We do not warrant that the app will be error-free, uninterrupted, or accurate.
            Cycle predictions are estimates based on your own data and may not reflect your
            actual cycle. Use the app at your own discretion.
          </p>
        </Section>

        <Section title="Limitation of liability">
          <p>
            To the fullest extent permitted by law, Sol Cycle and its developers are not liable
            for any damages arising from your use of the app, including any reliance on cycle
            predictions, health patterns, or any other information provided by the app.
          </p>
        </Section>

        <Section title="Changes to these terms">
          <p>
            We may update these terms from time to time. When we do, the updated date at the top
            of this page will change. Continued use of the app after a change means you accept
            the updated terms.
          </p>
        </Section>

        <Section title="Governing law">
          <p>
            These terms are governed by the laws of the jurisdiction in which Sol Cycle is
            registered, without regard to conflict of law provisions.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            Questions about these terms:{' '}
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
