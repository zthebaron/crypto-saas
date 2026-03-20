import { Shield, FileText, AlertTriangle, Scale, Clock, Globe } from 'lucide-react';

const LAST_UPDATED = 'March 19, 2026';

export default function Terms() {
  return (
    <div className="max-w-4xl mx-auto space-y-10">
      {/* Header */}
      <div className="text-center space-y-3 pb-6 border-b border-gray-800">
        <div className="w-14 h-14 bg-indigo-600/15 rounded-2xl flex items-center justify-center mx-auto">
          <FileText size={28} className="text-indigo-400" />
        </div>
        <h1 className="text-3xl font-bold text-white">Terms of Service</h1>
        <p className="text-sm text-gray-500">Last updated: {LAST_UPDATED}</p>
      </div>

      {/* Intro */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
        <p className="text-sm text-gray-300 leading-relaxed">
          Welcome to BlockView. These Terms of Service ("Terms") govern your access to and use of the BlockView
          platform, website, APIs, and all related services (collectively, the "Service") operated by BlockView Inc.
          ("BlockView," "we," "us," or "our"). By accessing or using the Service, you agree to be bound by these Terms.
          If you do not agree, do not use the Service.
        </p>
      </div>

      {/* Sections */}
      <div className="space-y-8">
        <Section icon={Scale} title="1. Acceptance of Terms">
          <p>
            By creating an account, accessing, or using BlockView, you confirm that you are at least 18 years of age
            (or the age of legal majority in your jurisdiction), and that you have the legal capacity to enter into
            these Terms. If you are using the Service on behalf of an organization, you represent that you have authority
            to bind that organization to these Terms.
          </p>
        </Section>

        <Section icon={Globe} title="2. Description of Service">
          <p>
            BlockView provides an AI-powered cryptocurrency research and analysis platform that includes, but is not
            limited to:
          </p>
          <ul>
            <li>Real-time market data aggregation and display for 500+ cryptocurrencies</li>
            <li>Multi-agent AI analysis pipeline (Market Scanner, Sentiment Analyst, Risk Assessor, Opportunity Scout, Portfolio Advisor)</li>
            <li>Trading signal generation with confidence scoring</li>
            <li>Portfolio tracking and performance analytics</li>
            <li>Knowledge base and document management</li>
            <li>Custom alert rules and notification system</li>
            <li>Historical signal accuracy tracking</li>
            <li>Coin comparison and research tools</li>
            <li>PDF report generation and export</li>
          </ul>
        </Section>

        <Section icon={Shield} title="3. Account Registration & Security">
          <p>To access certain features, you must register for an account. You agree to:</p>
          <ul>
            <li>Provide accurate, current, and complete information during registration</li>
            <li>Maintain the security of your password and account credentials</li>
            <li>Notify us immediately of any unauthorized use of your account</li>
            <li>Accept responsibility for all activities that occur under your account</li>
          </ul>
          <p>
            We reserve the right to suspend or terminate accounts that violate these Terms, provide false information,
            or engage in fraudulent or harmful activity.
          </p>
        </Section>

        <Section icon={AlertTriangle} title="4. Subscription Plans & Billing">
          <p>BlockView offers the following subscription tiers:</p>
          <ul>
            <li><strong>Free Plan:</strong> Limited access with 5 agent runs per day, top 50 coins analysis, and 24-hour report history.</li>
            <li><strong>Platinum Plan ($49/month):</strong> Enhanced access with 50 agent runs per day, top 200 coins, full report history, portfolio tracking, knowledge base, custom alert rules, PDF exports, and priority support.</li>
            <li><strong>Enterprise Plan ($199/month):</strong> Unlimited access with all Platinum features plus API access, custom agent configurations, team collaboration (5 seats), white-label reporting, and dedicated account management.</li>
          </ul>
          <p>
            Paid subscriptions are billed in advance on a monthly basis. You authorize us to charge your designated
            payment method for recurring fees. All fees are non-refundable except as expressly stated in our 30-day
            money-back guarantee for first-time subscribers.
          </p>
          <p>
            We reserve the right to modify pricing with 30 days' notice. Price changes will take effect at the start
            of your next billing cycle.
          </p>
        </Section>

        <Section icon={Clock} title="5. Free Trial">
          <p>
            The Platinum plan includes a 14-day free trial for new users. No credit card is required to start the trial.
            At the end of the trial period, you will be prompted to subscribe. If you do not subscribe, your account
            will revert to the Free plan and premium features will become unavailable. Any data created during the trial
            (reports, documents, portfolio entries) will be retained for 30 days, after which it may be permanently deleted.
          </p>
        </Section>

        <Section title="6. Intellectual Property">
          <p>
            All content, features, and functionality of the Service — including but not limited to text, graphics, logos,
            icons, images, audio clips, data compilations, software, AI models, and their arrangement — are owned by
            BlockView or its licensors and are protected by international copyright, trademark, patent, trade secret,
            and other intellectual property laws.
          </p>
          <p>
            You retain ownership of any documents, notes, or data you upload to the Service. By uploading content,
            you grant BlockView a limited, non-exclusive license to process, store, and display that content solely
            for the purpose of providing the Service to you.
          </p>
        </Section>

        <Section title="7. Acceptable Use">
          <p>You agree not to:</p>
          <ul>
            <li>Use the Service for any unlawful purpose or in violation of any applicable laws or regulations</li>
            <li>Attempt to gain unauthorized access to any part of the Service, other accounts, or computer systems</li>
            <li>Use automated scripts, bots, or scrapers to access the Service without our express written permission</li>
            <li>Reverse engineer, decompile, or disassemble any part of the Service</li>
            <li>Resell, redistribute, or sublicense access to the Service without authorization</li>
            <li>Transmit malware, viruses, or any malicious code through the Service</li>
            <li>Interfere with or disrupt the integrity or performance of the Service</li>
            <li>Use the Service to manipulate markets, engage in wash trading, or commit financial fraud</li>
          </ul>
        </Section>

        <Section title="8. Investment Disclaimer">
          <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4">
            <p className="text-yellow-300 font-semibold text-sm mb-2">Important Notice</p>
            <p>
              BlockView is a research and analysis tool only. Nothing on the platform constitutes financial advice,
              investment advice, trading advice, or any other type of advice. AI-generated signals, reports, and
              recommendations are provided for informational and educational purposes only.
            </p>
            <p className="mt-2">
              Cryptocurrency trading involves substantial risk of loss and is not suitable for every investor. Past
              performance of signals or analysis does not guarantee future results. You are solely responsible for
              your own investment decisions. Always conduct your own research and consult with a qualified financial
              advisor before making any investment.
            </p>
          </div>
        </Section>

        <Section title="9. Data & Privacy">
          <p>
            Your use of the Service is also governed by our <a href="/privacy" className="text-indigo-400 hover:text-indigo-300">Privacy Policy</a>,
            which describes how we collect, use, and protect your personal information. By using the Service, you
            consent to the practices described in our Privacy Policy.
          </p>
        </Section>

        <Section title="10. Third-Party Services">
          <p>
            The Service integrates with third-party data providers (including CoinMarketCap for market data and
            Anthropic for AI analysis). We are not responsible for the accuracy, availability, or reliability of
            third-party data. Third-party services are subject to their own terms and privacy policies.
          </p>
        </Section>

        <Section title="11. Service Availability & Modifications">
          <p>
            We strive to maintain 99.9% uptime but do not guarantee uninterrupted access. We reserve the right to:
          </p>
          <ul>
            <li>Modify, suspend, or discontinue any part of the Service at any time</li>
            <li>Perform scheduled maintenance with reasonable advance notice</li>
            <li>Implement emergency changes without notice to protect security or stability</li>
          </ul>
          <p>
            Enterprise plan customers receive custom SLA agreements with guaranteed uptime commitments.
          </p>
        </Section>

        <Section title="12. Limitation of Liability">
          <p>
            To the maximum extent permitted by applicable law, BlockView and its officers, directors, employees,
            agents, and affiliates shall not be liable for any indirect, incidental, special, consequential, or
            punitive damages, including but not limited to loss of profits, data, use, goodwill, or other intangible
            losses, resulting from:
          </p>
          <ul>
            <li>Your use of or inability to use the Service</li>
            <li>Any trading or investment decisions made based on information from the Service</li>
            <li>Unauthorized access to or alteration of your data</li>
            <li>Any third-party conduct on the Service</li>
            <li>Any other matter relating to the Service</li>
          </ul>
          <p>
            Our total liability shall not exceed the amount you paid to BlockView in the twelve (12) months preceding
            the claim.
          </p>
        </Section>

        <Section title="13. Indemnification">
          <p>
            You agree to indemnify, defend, and hold harmless BlockView and its affiliates from and against any
            claims, liabilities, damages, losses, and expenses (including reasonable attorneys' fees) arising out of
            or in any way connected with your access to or use of the Service, your violation of these Terms, or your
            violation of any third-party rights.
          </p>
        </Section>

        <Section title="14. Termination">
          <p>
            You may terminate your account at any time through your account settings. We may terminate or suspend
            your access immediately, without prior notice, for any reason including breach of these Terms.
          </p>
          <p>
            Upon termination, your right to use the Service ceases immediately. We may retain certain data as
            required by law or for legitimate business purposes. Provisions that by their nature should survive
            termination shall survive (including Sections 6, 8, 12, 13, and 15).
          </p>
        </Section>

        <Section title="15. Governing Law & Dispute Resolution">
          <p>
            These Terms shall be governed by and construed in accordance with the laws of the State of Delaware,
            United States, without regard to its conflict of law provisions.
          </p>
          <p>
            Any disputes arising out of or relating to these Terms or the Service shall first be attempted to be
            resolved through good-faith negotiation. If unresolved within 30 days, disputes shall be submitted to
            binding arbitration administered by the American Arbitration Association under its Commercial Arbitration
            Rules. The arbitration shall be conducted in Wilmington, Delaware.
          </p>
        </Section>

        <Section title="16. Changes to These Terms">
          <p>
            We may update these Terms from time to time. We will notify you of material changes by posting the
            updated Terms on the Service and updating the "Last updated" date. Your continued use of the Service
            after changes become effective constitutes acceptance of the revised Terms.
          </p>
        </Section>

        <Section title="17. Contact Us">
          <p>If you have any questions about these Terms, please contact us at:</p>
          <div className="bg-gray-800/40 rounded-xl p-4 mt-2 space-y-1 text-sm">
            <p className="text-white font-semibold">BlockView Inc.</p>
            <p>Email: <a href="mailto:legal@block-view.app" className="text-indigo-400">legal@block-view.app</a></p>
            <p>Support: <a href="mailto:support@block-view.app" className="text-indigo-400">support@block-view.app</a></p>
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, children }: { icon?: any; title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        {Icon && <Icon size={18} className="text-indigo-400 flex-shrink-0" />}
        <h2 className="text-lg font-bold text-white">{title}</h2>
      </div>
      <div className="text-sm text-gray-300 leading-relaxed space-y-3 pl-0 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_li]:text-gray-400 [&_strong]:text-white">
        {children}
      </div>
    </section>
  );
}
