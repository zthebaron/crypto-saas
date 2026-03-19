import { BookOpen, AlertTriangle, Ban, Gauge, Shield, Scale, Users, Cpu } from 'lucide-react';

const LAST_UPDATED = 'March 19, 2026';

export default function UsagePolicy() {
  return (
    <div className="max-w-4xl mx-auto space-y-10">
      {/* Header */}
      <div className="text-center space-y-3 pb-6 border-b border-gray-800">
        <div className="w-14 h-14 bg-indigo-600/15 rounded-2xl flex items-center justify-center mx-auto">
          <BookOpen size={28} className="text-indigo-400" />
        </div>
        <h1 className="text-3xl font-bold text-white">Usage Policy</h1>
        <p className="text-sm text-gray-500">Last updated: {LAST_UPDATED}</p>
      </div>

      {/* Intro */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
        <p className="text-sm text-gray-300 leading-relaxed">
          This Usage Policy outlines the rules and guidelines for using the BlockView platform responsibly.
          It supplements our <a href="/terms" className="text-indigo-400 hover:text-indigo-300">Terms of Service</a> and
          is designed to ensure a fair, safe, and productive experience for all users. Violations of this policy
          may result in account suspension or termination.
        </p>
      </div>

      <div className="space-y-8">
        <Section icon={Gauge} title="1. Rate Limits & Fair Usage">
          <p>
            To ensure platform stability and fair access for all users, the following rate limits apply:
          </p>

          <div className="overflow-x-auto mt-3">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-2.5 pr-4 text-gray-400 font-semibold">Feature</th>
                  <th className="text-center py-2.5 px-4 text-gray-400 font-semibold">Free</th>
                  <th className="text-center py-2.5 px-4 text-indigo-400 font-semibold">Platinum</th>
                  <th className="text-center py-2.5 px-4 text-yellow-400 font-semibold">Enterprise</th>
                </tr>
              </thead>
              <tbody className="text-gray-300">
                <tr className="border-b border-gray-800">
                  <td className="py-2.5 pr-4">Agent Pipeline Runs</td>
                  <td className="text-center py-2.5 px-4">5/day</td>
                  <td className="text-center py-2.5 px-4">50/day</td>
                  <td className="text-center py-2.5 px-4">Unlimited</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-2.5 pr-4">Coins Analyzed</td>
                  <td className="text-center py-2.5 px-4">Top 50</td>
                  <td className="text-center py-2.5 px-4">Top 200</td>
                  <td className="text-center py-2.5 px-4">500+</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-2.5 pr-4">Report History</td>
                  <td className="text-center py-2.5 px-4">24 hours</td>
                  <td className="text-center py-2.5 px-4">Unlimited</td>
                  <td className="text-center py-2.5 px-4">Unlimited</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-2.5 pr-4">Knowledge Base Documents</td>
                  <td className="text-center py-2.5 px-4">—</td>
                  <td className="text-center py-2.5 px-4">50</td>
                  <td className="text-center py-2.5 px-4">Unlimited</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-2.5 pr-4">Document Upload Size</td>
                  <td className="text-center py-2.5 px-4">—</td>
                  <td className="text-center py-2.5 px-4">10 MB</td>
                  <td className="text-center py-2.5 px-4">50 MB</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-2.5 pr-4">Alert Rules</td>
                  <td className="text-center py-2.5 px-4">3</td>
                  <td className="text-center py-2.5 px-4">25</td>
                  <td className="text-center py-2.5 px-4">Unlimited</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-2.5 pr-4">Chatbot Messages</td>
                  <td className="text-center py-2.5 px-4">25/day</td>
                  <td className="text-center py-2.5 px-4">500/day</td>
                  <td className="text-center py-2.5 px-4">Unlimited</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-2.5 pr-4">API Requests</td>
                  <td className="text-center py-2.5 px-4">—</td>
                  <td className="text-center py-2.5 px-4">—</td>
                  <td className="text-center py-2.5 px-4">10,000/day</td>
                </tr>
                <tr>
                  <td className="py-2.5 pr-4">PDF Exports</td>
                  <td className="text-center py-2.5 px-4">—</td>
                  <td className="text-center py-2.5 px-4">50/day</td>
                  <td className="text-center py-2.5 px-4">Unlimited</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="mt-3">
            Rate limits reset daily at 00:00 UTC. Exceeding rate limits will result in temporary throttling
            (HTTP 429 responses). Persistent abuse may result in account restrictions.
          </p>
        </Section>

        <Section icon={Ban} title="2. Prohibited Activities">
          <p>The following activities are strictly prohibited on the BlockView platform:</p>

          <h4 className="text-white font-semibold text-sm mt-3">2.1 Market Manipulation</h4>
          <ul>
            <li>Using BlockView signals or analysis to coordinate pump-and-dump schemes</li>
            <li>Sharing AI-generated signals on social media to artificially influence market sentiment</li>
            <li>Using the platform to facilitate wash trading, spoofing, or layering</li>
            <li>Creating misleading or deceptive content based on BlockView analysis</li>
          </ul>

          <h4 className="text-white font-semibold text-sm mt-3">2.2 Unauthorized Access & Scraping</h4>
          <ul>
            <li>Accessing the Service using automated bots, scrapers, or crawlers without authorization</li>
            <li>Circumventing rate limits through multiple accounts, proxies, or other means</li>
            <li>Attempting to access other users' accounts, data, or private information</li>
            <li>Probing, scanning, or testing the vulnerability of the Service infrastructure</li>
            <li>Reverse engineering, decompiling, or disassembling any part of the Service</li>
          </ul>

          <h4 className="text-white font-semibold text-sm mt-3">2.3 Content Violations</h4>
          <ul>
            <li>Uploading malicious files, malware, or executable code to the Knowledge Base</li>
            <li>Uploading copyrighted materials you do not have rights to</li>
            <li>Using the chatbot to generate harmful, illegal, or misleading financial advice to share with others</li>
            <li>Storing personally identifiable information (PII) of third parties without consent</li>
          </ul>

          <h4 className="text-white font-semibold text-sm mt-3">2.4 Account Abuse</h4>
          <ul>
            <li>Creating multiple free accounts to circumvent plan limitations</li>
            <li>Sharing paid account credentials with unauthorized users</li>
            <li>Reselling or sublicensing access to the Service</li>
            <li>Using referral or promotion systems fraudulently</li>
          </ul>
        </Section>

        <Section icon={Cpu} title="3. AI & Chatbot Usage Guidelines">
          <p>When interacting with BlockView's AI chatbot and agent pipeline:</p>
          <ul>
            <li><strong>No Prompt Injection:</strong> Do not attempt to manipulate the AI through adversarial prompts, jailbreaking, or social engineering techniques.</li>
            <li><strong>Appropriate Queries:</strong> Use the chatbot for cryptocurrency research, market analysis, and platform-related questions. The AI is not designed for unrelated topics.</li>
            <li><strong>Understand Limitations:</strong> AI-generated analysis is not infallible. Always cross-reference signals with your own research before making investment decisions.</li>
            <li><strong>Slash Commands:</strong> Use slash commands (/signals, /portfolio, /compare, /knowledge, /run) as documented. Abuse of command functionality may trigger rate limiting.</li>
            <li><strong>Knowledge Base Context:</strong> Documents uploaded to the Knowledge Base may be used by the AI to inform responses. Only upload content you want the AI to reference.</li>
          </ul>
        </Section>

        <Section icon={Shield} title="4. Data Usage & Responsibilities">
          <h4 className="text-white font-semibold text-sm">4.1 Your Responsibilities</h4>
          <ul>
            <li>Keep your login credentials secure and do not share them</li>
            <li>Use strong, unique passwords for your BlockView account</li>
            <li>Log out of shared or public devices after use</li>
            <li>Report any suspected security breaches immediately to <a href="mailto:security@blockview.com" className="text-indigo-400">security@blockview.com</a></li>
            <li>Ensure uploaded documents comply with applicable laws and do not contain malicious content</li>
          </ul>

          <h4 className="text-white font-semibold text-sm mt-3">4.2 Data Accuracy</h4>
          <ul>
            <li>Market data is sourced from third-party providers and may experience delays or inaccuracies</li>
            <li>AI-generated signals and confidence scores are algorithmic estimates, not guarantees</li>
            <li>Portfolio P&L calculations are based on available market data and may not reflect exact values</li>
            <li>Signal accuracy metrics are historical measurements and do not predict future performance</li>
          </ul>
        </Section>

        <Section icon={Users} title="5. Enterprise & Team Usage">
          <p>Enterprise plan customers with team collaboration features must additionally:</p>
          <ul>
            <li>Designate a team administrator responsible for managing member access and permissions</li>
            <li>Ensure all team members have read and agree to these policies</li>
            <li>Not exceed the licensed number of seats (5 per Enterprise subscription; additional seats available for purchase)</li>
            <li>Maintain appropriate internal controls over team usage and data access</li>
            <li>Use white-label reporting features only for internal or client-facing reports where BlockView is properly attributed or a white-label license is active</li>
          </ul>
        </Section>

        <Section title="6. API Usage (Enterprise)">
          <p>Enterprise customers with API access must:</p>
          <ul>
            <li>Authenticate all API requests using provided API keys</li>
            <li>Respect rate limits of 10,000 requests per day (higher limits available by request)</li>
            <li>Not share API keys publicly or embed them in client-side code</li>
            <li>Implement proper error handling and exponential backoff for failed requests</li>
            <li>Not use the API to build a competing service or replicate core BlockView functionality</li>
            <li>Cache API responses locally where appropriate to minimize unnecessary calls</li>
          </ul>
        </Section>

        <Section icon={AlertTriangle} title="7. Enforcement & Consequences">
          <p>Violations of this Usage Policy may result in the following actions, depending on severity:</p>
          <div className="space-y-3 mt-2">
            <div className="flex items-start gap-3 bg-yellow-500/5 border border-yellow-500/15 rounded-lg p-3">
              <span className="text-yellow-400 font-bold text-xs mt-0.5 w-16 flex-shrink-0">Level 1</span>
              <div>
                <p className="text-white text-sm font-medium">Warning</p>
                <p className="text-gray-400 text-xs">Email notification of the violation with a request to cease the prohibited activity. Applies to first-time, minor violations.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-orange-500/5 border border-orange-500/15 rounded-lg p-3">
              <span className="text-orange-400 font-bold text-xs mt-0.5 w-16 flex-shrink-0">Level 2</span>
              <div>
                <p className="text-white text-sm font-medium">Temporary Suspension</p>
                <p className="text-gray-400 text-xs">Account suspended for 7-30 days. Applies to repeated violations or moderate offenses. Access to data is preserved.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-red-500/5 border border-red-500/15 rounded-lg p-3">
              <span className="text-red-400 font-bold text-xs mt-0.5 w-16 flex-shrink-0">Level 3</span>
              <div>
                <p className="text-white text-sm font-medium">Permanent Termination</p>
                <p className="text-gray-400 text-xs">Account permanently terminated. Applies to severe violations, illegal activity, or repeated Level 2 offenses. Data export available for 30 days.</p>
              </div>
            </div>
          </div>
          <p className="mt-3">
            We reserve the right to take immediate action (including Level 3) for severe violations without
            prior warning. All enforcement decisions can be appealed by contacting{' '}
            <a href="mailto:appeals@blockview.com" className="text-indigo-400">appeals@blockview.com</a> within
            14 days of the action.
          </p>
        </Section>

        <Section icon={Scale} title="8. Reporting Violations">
          <p>
            If you become aware of any user violating this Usage Policy, please report it to us:
          </p>
          <div className="bg-gray-800/40 rounded-xl p-4 mt-2 space-y-1 text-sm">
            <p className="text-white font-semibold">Report a Violation</p>
            <p>Email: <a href="mailto:abuse@blockview.com" className="text-indigo-400">abuse@blockview.com</a></p>
            <p className="text-gray-500 text-xs mt-2">Include relevant details: the user involved (if known), description of the violation, and any supporting evidence. All reports are investigated confidentially.</p>
          </div>
        </Section>

        <Section title="9. Changes to This Policy">
          <p>
            We may update this Usage Policy as the platform evolves. Material changes will be communicated
            through the Service and/or email notification. Continued use of the Service after changes take effect
            constitutes acceptance of the updated policy.
          </p>
        </Section>

        <Section title="10. Contact">
          <p>For questions about this Usage Policy:</p>
          <div className="bg-gray-800/40 rounded-xl p-4 mt-2 space-y-1 text-sm">
            <p className="text-white font-semibold">BlockView Inc.</p>
            <p>Email: <a href="mailto:support@blockview.com" className="text-indigo-400">support@blockview.com</a></p>
            <p>Legal: <a href="mailto:legal@blockview.com" className="text-indigo-400">legal@blockview.com</a></p>
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
