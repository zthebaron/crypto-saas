import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BlockViewLogo } from '../components/ui/BlockViewLogo';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [sent, setSent] = useState(false);

  const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (data.token) {
        setResetToken(data.token);
      }
      setSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset request');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-crypto-dark flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <BlockViewLogo size="lg" showText={true} showSubtext={true} />
        </div>

        <div className="card">
          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-100 mb-2">Check Your Email</h2>
              <p className="text-gray-400 text-sm mb-6">
                If an account with <span className="text-gray-200">{email}</span> exists, a password reset link has been generated.
              </p>

              {resetToken && (
                <div className="mb-6">
                  <Link
                    to={`/reset-password?token=${resetToken}`}
                    className="btn-primary inline-block px-6 py-2.5"
                  >
                    Reset Password Now
                  </Link>
                  <p className="text-[11px] text-gray-600 mt-2">This link expires in 1 hour</p>
                </div>
              )}

              <Link to="/login" className="text-indigo-400 hover:text-indigo-300 text-sm flex items-center justify-center gap-1.5">
                <ArrowLeft size={14} /> Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-gray-100 mb-2">Forgot Password</h2>
              <p className="text-gray-400 text-sm mb-6">
                Enter your email address and we'll send you a link to reset your password.
              </p>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg mb-4 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Email Address</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="you@example.com"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-gray-200 focus:outline-none focus:border-indigo-500 placeholder:text-gray-600"
                    />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>

              <p className="text-center text-sm text-gray-500 mt-4">
                <Link to="/login" className="text-indigo-400 hover:text-indigo-300 flex items-center justify-center gap-1.5">
                  <ArrowLeft size={14} /> Back to Sign In
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
