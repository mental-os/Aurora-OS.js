/**
 * Browser welcome page (browser://welcome)
 */

import { useState } from 'react';
import { WebsiteProps } from '../types';
import { Search } from 'lucide-react';
import { useI18n } from '../../../i18n';

// Simulated search delay in milliseconds
const SEARCH_DELAY_MS = 300;

const quickLinks: Array<{ id: number; name: string; url: string; color: string }> = [];

export function WelcomePage({ onNavigate }: WebsiteProps) {
  const { t } = useI18n();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Simulate search delay, then redirect to search engine
    setIsSearching(true);
    setTimeout(() => {
      onNavigate?.(`search://search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setIsSearching(false);
    }, SEARCH_DELAY_MS);
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Search Box */}
        <div className="mt-24 mb-16">
          <form onSubmit={handleSearch}>
            <div className="relative">
              {isSearching ? (
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              )}
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('browser.welcome.searchPlaceholder')}
                disabled={isSearching}
                className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>
          </form>

        </div>

        {/* Quick Links */}
        {quickLinks.length > 0 && (
          <>
            <h2 className="text-xl text-white/80 mb-6 font-light">{t('browser.welcome.favorites')}</h2>
            <div className="grid grid-cols-3 gap-4 mb-12">
              {quickLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => onNavigate?.(link.url)}
                  className="h-32 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all flex flex-col items-center justify-center gap-3 group"
                >
                  <div className={`w-12 h-12 ${link.color} rounded-lg shadow-lg group-hover:scale-110 transition-transform`} />
                  <span className="text-white/80 text-sm">{link.name}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {/* Recent Activity */}
        <h2 className="text-xl text-white/80 mb-4 font-light">{t('browser.welcome.recentActivity')}</h2>
        <div className="space-y-2">
          {[
            { name: 'Aurora University', url: 'https://aurora.edu' },
            { name: 'TechBlog - Latest News', url: 'https://techblog.com' },
            { name: 'SecureBank Online', url: 'https://securebank.com' },
          ].map((site, i) => (
            <button
              key={i}
              onClick={() => onNavigate?.(site.url)}
              className="w-full p-4 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-colors text-left flex items-center justify-between"
            >
              <div>
                <div className="text-white text-sm mb-1">{site.name}</div>
                <div className="text-white/40 text-xs">{site.url}</div>
              </div>
              <div className="text-white/20">→</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
