/**
 * SecureBank - Fake banking website
 * Potential use: Phishing scenarios, credential harvesting, social engineering
 * PERFECT for demonstrating security vulnerabilities
 */

import { useState } from 'react';
import { WebsiteProps } from '../types';
import { WebsiteLayout, WebsiteHeader, WebsiteContainer } from '../components/WebsiteLayout';
import { Lock, Shield, CreditCard, Eye, EyeOff, AlertCircle } from 'lucide-react';

export function SecureBank(_props: WebsiteProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      if (username && password) {
        setError('Invalid credentials. Please try again.');
        console.log('[SecureBank] Login attempt:', { username, password });
      } else {
        setError('Please enter both username and password.');
      }
    }, 1000);
  };

  return (
    <WebsiteLayout bg="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
      <WebsiteHeader
        bg="bg-white"
        logo={
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">SecureBank</div>
              <div className="text-xs text-gray-500">Your trusted partner</div>
            </div>
          </div>
        }
        nav={
          <div className="flex gap-8 text-gray-600 text-sm font-medium">
            <button className="hover:text-gray-900 transition-colors">Personal</button>
            <button className="hover:text-gray-900 transition-colors">Business</button>
            <button className="hover:text-gray-900 transition-colors">Investing</button>
            <button className="hover:text-gray-900 transition-colors">Help</button>
          </div>
        }
        actions={
          <div className="flex items-center gap-3">
            <Lock className="w-4 h-4 text-green-600" />
            <span className="text-sm text-gray-600 font-medium">Secure Connection</span>
          </div>
        }
      />

      <WebsiteContainer size="md" className="min-h-full flex items-center">
        <div className="w-full max-w-md mx-auto">
          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h1>
              <p className="text-gray-600">Sign in to access your account</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div className="text-sm text-red-800">{error}</div>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username or Account Number
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded" />
                  <span className="text-gray-600">Remember me</span>
                </label>
                <button type="button" className="text-blue-600 hover:text-blue-700 font-medium">
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Sign In
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <button className="text-blue-600 hover:text-blue-700 font-medium">
                  Open Account
                </button>
              </p>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-white/10 backdrop-blur-md rounded-lg border border-white/20">
            <div className="flex items-start gap-3 text-white">
              <Shield className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium mb-1">Security Notice</p>
                <p className="text-white/80">
                  SecureBank will never ask for your password via email or phone. Always verify the URL before entering credentials.
                </p>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          <div className="mt-8 text-center text-sm text-white/60 space-y-2">
            <div className="flex justify-center gap-6">
              <button className="hover:text-white transition-colors">Privacy Policy</button>
              <button className="hover:text-white transition-colors">Terms of Service</button>
              <button className="hover:text-white transition-colors">Security</button>
            </div>
            <p>© 2026 SecureBank. Member FDIC. Equal Housing Lender.</p>
          </div>
        </div>
      </WebsiteContainer>
    </WebsiteLayout>
  );
}
