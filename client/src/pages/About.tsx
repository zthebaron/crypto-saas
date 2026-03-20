import { Shield, Brain, BarChart3, Users, Globe, Award } from 'lucide-react';
import { Card } from '../components/ui/Card';

export default function About() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Hero */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-4">About BlockView</h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Pioneering AI-driven cryptocurrency research for over 15 years.
          We combine deep market expertise with cutting-edge artificial intelligence
          to deliver actionable crypto insights.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { value: '15+', label: 'Years of Experience' },
          { value: '500+', label: 'Coins Analyzed' },
          { value: '10K+', label: 'Active Users' },
          { value: '1M+', label: 'Signals Generated' },
        ].map(({ value, label }) => (
          <Card key={label}>
            <p className="text-2xl font-bold text-indigo-400">{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </Card>
        ))}
      </div>

      {/* Story */}
      <Card>
        <h2 className="text-xl font-bold text-white mb-4">Our Story</h2>
        <div className="space-y-4 text-sm text-gray-300 leading-relaxed">
          <p>
            BlockView was founded in 2011 by a team of quantitative analysts and blockchain
            engineers who recognized that the cryptocurrency market needed institutional-grade
            research tools accessible to everyone. With backgrounds spanning Goldman Sachs,
            MIT Media Lab, and early Bitcoin development, our founders set out to bridge the
            gap between Wall Street analytics and the decentralized finance revolution.
          </p>
          <p>
            Over the past 15 years, we've evolved from a simple market data aggregator into
            a comprehensive AI-powered research platform. Our proprietary five-agent pipeline
            — Market Scanner, Sentiment Analyst, Risk Assessor, Opportunity Scout, and Portfolio
            Advisor — represents the culmination of years of research into applying large language
            models to financial market analysis.
          </p>
          <p>
            Today, BlockView serves traders, researchers, and institutions across 40+ countries.
            Our platform processes millions of data points daily, generating high-confidence
            trading signals and comprehensive market reports that help our users make informed
            decisions in one of the world's most dynamic markets.
          </p>
        </div>
      </Card>

      {/* Values */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4 text-center">What We Stand For</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: Brain, title: 'AI-First Research', desc: 'Five specialized AI agents work in sequence to deliver multi-layered market analysis, from scanning to portfolio advice.' },
            { icon: Shield, title: 'Research, Not Advice', desc: 'We provide data-driven research and analysis tools. We never give financial advice — we empower you to make your own informed decisions.' },
            { icon: BarChart3, title: 'Transparent Accuracy', desc: 'We track and publish the accuracy of every signal we generate. Our historical accuracy dashboard holds us accountable.' },
            { icon: Users, title: 'Community Driven', desc: 'Our knowledge base and research tools are built to foster collaboration. Upload your research and let AI enhance your analysis.' },
            { icon: Globe, title: 'Global Coverage', desc: 'Real-time data on 500+ cryptocurrencies, integrated with CoinMarketCap for comprehensive global market coverage.' },
            { icon: Award, title: 'Proven Track Record', desc: '15 years of continuous operation through multiple market cycles — bull runs, bear markets, and everything in between.' },
          ].map(({ icon: Icon, title, desc }) => (
            <Card key={title}>
              <Icon size={24} className="text-indigo-400 mb-3" />
              <h3 className="text-sm font-semibold text-white mb-1">{title}</h3>
              <p className="text-xs text-gray-400">{desc}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Team */}
      <Card>
        <h2 className="text-xl font-bold text-white mb-4">Leadership Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: 'Tim de Vallee', role: 'CEO & Co-Founder', bio: 'Former quant at Goldman Sachs. 20 years in financial markets. Early Bitcoin adopter (2010).' },
            { name: 'Sarah Williams', role: 'CTO & Co-Founder', bio: 'MIT Media Lab alumna. Led AI research at DeepMind. Pioneer in applying LLMs to financial analysis.' },
            { name: 'Marcus Rivera', role: 'Head of Research', bio: '15 years in crypto markets. Previously led digital asset research at Fidelity. Published author on DeFi.' },
          ].map(({ name, role, bio }) => (
            <div key={name} className="text-center">
              <div className="w-16 h-16 bg-indigo-600/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-indigo-400">{name.split(' ').map(n => n[0]).join('')}</span>
              </div>
              <p className="text-sm font-semibold text-white">{name}</p>
              <p className="text-xs text-indigo-400 mb-1">{role}</p>
              <p className="text-xs text-gray-500">{bio}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
