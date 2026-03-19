import { Shield, Database, Eye, Lock, UserCheck, Globe, Bell, Trash2 } from 'lucide-react';

const LAST_UPDATED = 'March 19, 2026';

export default function Privacy() {
  return (
    <div className="max-w-4xl mx-auto space-y-10">
      {/* Header */}
      <div className="text-center space-y-3 pb-6 border-b border-gray-800">
        <div className="w-14 h-14 bg-indigo-600/15 rounded-2xl flex items-center justify-center mx-auto">
          <Shield size={28} className="text-indigo-400" />
        </div>
        <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
        <p className="text-sm text-gray-500">Last updated: {LAST_UPDATED}</p>
      </div>

      {/* Intro */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
        <p className="text-sm text-gray-300 leading-relaxed">
          At BlockView Inc. ("BlockView," "we," "us," or "our"), we are committed to protecting your privacy and
          personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information
          when you use our platform, website, and services (collectively, the "Service"). Please read this policy
          carefully. By using the Service, you consent to the practices described herein.
        </p>
      </div>

      <div className="space-y-8">
        <Section icon={Database} title="1. Information We Collect">
          <h4 className="text-white font-semibold text-sm mt-1">1.1 Information You Provide</h4>
          <ul>
            <li><strong>Account Information:</strong> Email address, password (stored as a bcrypt hash — we never store plaintext passwords), and display name when you register.</li>
            <li><strong>Profile Data:</strong> Subscription tier, notification preferences, and watchlist selections.</li>
            <li><strong>Portfolio Data:</strong> Cryptocurrency positions, entry prices, quantities, and notes you add to track your portfolio.</li>
            <li><strong>Uploaded Documents:</strong> Files you upload to the Knowledge Base (PDFs, markdown, text files) for AI-assisted research.</li>
            <li><strong>Alert Rules:</strong> Custom alert conditions and thresholds you configure.</li>
            <li><strong>Chat Messages:</strong> Conversations with the AI chatbot, including questions and slash commands.</li>
            <li><strong>Payment Information:</strong> Billing details processed securely through our third-party payment processor. We do not store full credit card numbers on our servers.</li>
          </ul>

          <h4 className="text-white font-semibold text-sm mt-4">1.2 Information Collected Automatically</h4>
          <ul>
            <li><strong>Usage Data:</strong> Pages visited, features used, agent runs initiated, signals viewed, and time spent on the platform.</li>
            <li><strong>Device Information:</strong> Browser type, operating system, device identifiers, screen resolution, and language settings.</li>
            <li><strong>Log Data:</strong> IP address, access times, referring URLs, and server response codes.</li>
            <li><strong>Cookies & Local Storage:</strong> Authentication tokens (JWT), session data, and user preferences stored in your browser.</li>
            <li><strong>WebSocket Connection Data:</strong> Real-time connection metadata for delivering live agent status updates and notifications.</li>
          </ul>

          <h4 className="text-white font-semibold text-sm mt-4">1.3 Information from Third Parties</h4>
          <ul>
            <li><strong>Market Data:</strong> Cryptocurrency prices, volumes, and market metrics sourced from CoinMarketCap and other data providers.</li>
            <li><strong>AI Processing:</strong> Your queries are processed through Anthropic's Claude AI to generate analysis and responses. See Section 5 for details on AI data handling.</li>
          </ul>
        </Section>

        <Section icon={Eye} title="2. How We Use Your Information">
          <p>We use the information we collect to:</p>
          <ul>
            <li><strong>Provide the Service:</strong> Run AI agent pipelines, generate signals, track portfolios, deliver notifications, and process your chatbot queries.</li>
            <li><strong>Personalize Experience:</strong> Customize market analysis based on your watchlist, display relevant signals, and tailor AI recommendations to your portfolio.</li>
            <li><strong>Process Payments:</strong> Manage subscriptions, process billing, and send receipts.</li>
            <li><strong>Improve the Service:</strong> Analyze usage patterns to improve features, fix bugs, optimize performance, and develop new capabilities.</li>
            <li><strong>Signal Accuracy:</strong> Track historical signal performance (24h, 7d, 30d) to measure and improve the accuracy of our AI agents.</li>
            <li><strong>Communication:</strong> Send transactional emails (account verification, password resets, billing), platform notifications, and optional marketing communications.</li>
            <li><strong>Security:</strong> Detect, prevent, and respond to fraud, abuse, security incidents, and technical issues.</li>
            <li><strong>Legal Compliance:</strong> Comply with applicable laws, regulations, and legal processes.</li>
          </ul>
        </Section>

        <Section icon={UserCheck} title="3. How We Share Your Information">
          <p>We do not sell your personal data. We may share information with:</p>
          <ul>
            <li><strong>Service Providers:</strong> Third-party vendors who help us operate the Service (cloud hosting, payment processing, email delivery, analytics). These providers are contractually bound to protect your data.</li>
            <li><strong>AI Processing Partners:</strong> Your chatbot queries and analysis requests are sent to Anthropic's Claude API for processing. Anthropic processes this data under their data processing terms and does not use it to train their models.</li>
            <li><strong>Market Data Providers:</strong> Aggregated, anonymized usage statistics may be shared with data partners to maintain API access.</li>
            <li><strong>Legal Requirements:</strong> We may disclose information if required by law, subpoena, court order, or government request, or if we believe disclosure is necessary to protect our rights, safety, or property.</li>
            <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, your data may be transferred as part of the transaction. We will notify you of any such change.</li>
            <li><strong>With Your Consent:</strong> We may share information for other purposes with your explicit consent.</li>
          </ul>
          <p>
            <strong>Enterprise team features:</strong> If you are part of an Enterprise team, your team administrator
            may have access to your usage data and reports within the team workspace.
          </p>
        </Section>

        <Section icon={Lock} title="4. Data Security">
          <p>We implement industry-standard security measures to protect your data:</p>
          <ul>
            <li><strong>Encryption:</strong> All data is encrypted in transit using TLS 1.3. Sensitive data at rest is encrypted using AES-256.</li>
            <li><strong>Password Security:</strong> Passwords are hashed using bcrypt with salt rounds, making them computationally infeasible to reverse.</li>
            <li><strong>Authentication:</strong> JWT-based authentication with 7-day token expiry. Tokens are stored securely in the browser.</li>
            <li><strong>Access Controls:</strong> Role-based access controls limit internal access to user data on a need-to-know basis.</li>
            <li><strong>Infrastructure:</strong> Our servers are hosted on secure cloud infrastructure with firewalls, DDoS protection, and regular security audits.</li>
            <li><strong>Monitoring:</strong> Continuous security monitoring and automated alerting for suspicious activity.</li>
          </ul>
          <p>
            While we strive to protect your data, no method of transmission over the Internet is 100% secure.
            We cannot guarantee absolute security and encourage you to use strong, unique passwords.
          </p>
        </Section>

        <Section title="5. AI Data Processing">
          <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-4">
            <p className="text-indigo-300 font-semibold text-sm mb-2">How AI Handles Your Data</p>
            <ul>
              <li>Your chatbot conversations and analysis requests are processed by Anthropic's Claude AI models.</li>
              <li>Market data and your portfolio context may be included in AI prompts to provide personalized analysis.</li>
              <li>Documents you upload to the Knowledge Base may be referenced by the AI during chat sessions to provide informed responses.</li>
              <li>AI-generated signals, reports, and analysis are stored in our database and associated with your account.</li>
              <li>We do not use your personal conversations or uploaded documents to train AI models.</li>
              <li>Anthropic processes data under their enterprise data processing agreement and does not retain your data for model training.</li>
            </ul>
          </div>
        </Section>

        <Section icon={Bell} title="6. Cookies & Tracking">
          <p>We use the following types of cookies and similar technologies:</p>
          <ul>
            <li><strong>Essential Cookies:</strong> Required for authentication, session management, and core functionality. These cannot be disabled.</li>
            <li><strong>Functional Cookies:</strong> Remember your preferences (theme, notification settings, watchlist).</li>
            <li><strong>Analytics Cookies:</strong> Help us understand how users interact with the Service to improve features and performance.</li>
          </ul>
          <p>
            We do not use third-party advertising cookies or tracking pixels. You can manage cookie preferences
            through your browser settings. Disabling essential cookies may prevent you from using the Service.
          </p>
        </Section>

        <Section title="7. Data Retention">
          <ul>
            <li><strong>Account Data:</strong> Retained for the duration of your account and for 90 days after deletion to allow for recovery.</li>
            <li><strong>Agent Reports & Signals:</strong> Retained based on your plan (Free: 24 hours, Platinum: unlimited, Enterprise: unlimited + archival).</li>
            <li><strong>Chat History:</strong> Retained for 30 days on Free plans, unlimited on paid plans.</li>
            <li><strong>Portfolio Data:</strong> Retained for the duration of your account.</li>
            <li><strong>Uploaded Documents:</strong> Retained until you delete them or your account is terminated.</li>
            <li><strong>Server Logs:</strong> Retained for 90 days for security and debugging purposes.</li>
            <li><strong>Billing Records:</strong> Retained for 7 years as required by tax and accounting regulations.</li>
          </ul>
        </Section>

        <Section icon={Trash2} title="8. Your Rights">
          <p>Depending on your jurisdiction, you may have the following rights:</p>
          <ul>
            <li><strong>Access:</strong> Request a copy of the personal data we hold about you.</li>
            <li><strong>Correction:</strong> Request correction of inaccurate or incomplete data.</li>
            <li><strong>Deletion:</strong> Request deletion of your personal data ("right to be forgotten").</li>
            <li><strong>Portability:</strong> Request a machine-readable export of your data.</li>
            <li><strong>Restriction:</strong> Request restriction of processing of your data.</li>
            <li><strong>Objection:</strong> Object to processing of your data for certain purposes.</li>
            <li><strong>Withdraw Consent:</strong> Withdraw previously given consent at any time.</li>
          </ul>
          <p>
            To exercise any of these rights, please contact us at{' '}
            <a href="mailto:privacy@blockview.com" className="text-indigo-400">privacy@blockview.com</a>.
            We will respond within 30 days. We may require identity verification before processing your request.
          </p>
        </Section>

        <Section icon={Globe} title="9. International Data Transfers">
          <p>
            BlockView is based in the United States. If you access the Service from outside the U.S., your data
            may be transferred to, stored, and processed in the United States or other countries where our service
            providers operate.
          </p>
          <p>
            For users in the European Economic Area (EEA), United Kingdom, or Switzerland, we rely on Standard
            Contractual Clauses (SCCs) approved by the European Commission to ensure adequate protection for
            international data transfers.
          </p>
        </Section>

        <Section title="10. Children's Privacy">
          <p>
            The Service is not intended for users under the age of 18. We do not knowingly collect personal
            information from children. If we become aware that we have collected data from a child under 18,
            we will take steps to delete that information promptly. If you believe a child has provided us with
            personal data, please contact us at{' '}
            <a href="mailto:privacy@blockview.com" className="text-indigo-400">privacy@blockview.com</a>.
          </p>
        </Section>

        <Section title="11. California Privacy Rights (CCPA)">
          <p>If you are a California resident, you have additional rights under the CCPA:</p>
          <ul>
            <li>Right to know what personal information we collect, use, and disclose</li>
            <li>Right to request deletion of your personal information</li>
            <li>Right to opt-out of the sale of personal information (we do not sell personal information)</li>
            <li>Right to non-discrimination for exercising your privacy rights</li>
          </ul>
        </Section>

        <Section title="12. Changes to This Policy">
          <p>
            We may update this Privacy Policy periodically. We will notify you of material changes by posting the
            updated policy on the Service, sending an email notification, or displaying a prominent notice. Your
            continued use of the Service after changes become effective constitutes acceptance of the revised policy.
          </p>
        </Section>

        <Section title="13. Contact Us">
          <p>For privacy-related questions, requests, or concerns:</p>
          <div className="bg-gray-800/40 rounded-xl p-4 mt-2 space-y-1 text-sm">
            <p className="text-white font-semibold">BlockView Inc. — Privacy Team</p>
            <p>Email: <a href="mailto:privacy@blockview.com" className="text-indigo-400">privacy@blockview.com</a></p>
            <p>General Support: <a href="mailto:support@blockview.com" className="text-indigo-400">support@blockview.com</a></p>
            <p className="text-gray-500 text-xs mt-2">We aim to respond to all privacy inquiries within 30 business days.</p>
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
      <div className="text-sm text-gray-300 leading-relaxed space-y-3 pl-0 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_li]:text-gray-400 [&_strong]:text-white [&_h4]:mt-3">
        {children}
      </div>
    </section>
  );
}
