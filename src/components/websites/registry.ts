/**
 * Website Registry
 *
 * Central registry of all fake websites available in yAMI OS Browser.
 * Add new websites here to make them accessible via the browser.
 */

import { Website } from './types';
import { WelcomePage } from './sites/WelcomePage';
import { AuroraUniversity } from './sites/AuroraUniversity';
import { TechBlog } from './sites/TechBlog';
import { SecureBank } from './sites/SecureBank';
import { SearchEngine } from './sites/SearchEngine';
import { HackWithJack } from "@/components/websites/sites/HackWithJack.tsx";
import { TrustMail } from "@/components/websites/sites/TrustMail.tsx";


/**
 * All registered websites
 */
export const websites: Website[] = [
  // Special pages
  {
    id: 'welcome',
    domain: 'browser://welcome',
    name: 'Welcome',
    description: 'Browser welcome page',
    category: 'other',
    security: 'secure',
    color: '#6366f1',
    component: WelcomePage,
    searchable: false,
  },
  {
    id: 'search-engine',
    domain: 'search://search',
    name: 'Search',
    description: 'Search the web',
    category: 'search',
    security: 'secure',
    color: '#4285f4',
    component: SearchEngine,
    searchable: false,
  },
  {
    id: 'search-engine-home',
    domain: 'search://home',
    name: 'Search - Home',
    description: 'Search the web',
    category: 'search',
    security: 'secure',
    color: '#4285f4',
    component: SearchEngine,
    searchable: false,
  },
  {
    id: 'aurora-university',
    domain: 'aurora.edu',
    name: 'Aurora University',
    description: 'Premier educational institution for technology and sciences',
    category: 'university',
    security: 'secure',
    color: '#1e3a8a',
    component: AuroraUniversity,
    searchable: true,
    keywords: ['university', 'education', 'college', 'student', 'courses', 'aurora'],
    aliases: ['www.aurora.edu', 'portal.aurora.edu'],
  },
  {
    id: 'techblog',
    domain: 'techblog.com',
    name: 'TechBlog',
    description: 'Latest technology news, tutorials, and insights',
    category: 'blog',
    security: 'secure',
    color: '#3b82f6',
    component: TechBlog,
    searchable: true,
    keywords: ['tech', 'blog', 'news', 'programming', 'tutorials', 'development'],
    aliases: ['www.techblog.com', 'blog.techblog.com'],
  },
  {
    id: 'hackwithjack',
    domain: 'hackwithjack.org',
    name: 'Hack with Jack',
    description: 'Hack fundementals with Jack H.',
    category: 'blog',
    security: 'insecure',
    color: '#792635',
    component: HackWithJack,
    searchable: true,
    keywords: ['tech', 'blog', 'news', 'programming', 'tutorials', 'development'],
    aliases: ['www.hackwithjack.org', 'blog.hackwithjack.org'],
  },
  {
    id: 'securebank',
    domain: 'securebank.com',
    name: 'SecureBank',
    description: 'Online banking and financial services',
    category: 'bank',
    security: 'secure',
    color: '#1e40af',
    component: SecureBank,
    searchable: true,
    keywords: ['bank', 'banking', 'finance', 'money', 'account', 'secure'],
    aliases: ['www.securebank.com', 'online.securebank.com']
  },
  {
    id: 'trustmail',
    domain: 'trustmail.com',
    name: 'TrustMail',
    description: 'Modern email service designed for speed, reliability and simplicity',
    category: 'mail',
    security: 'secure',
    color: '#1b7c0d',
    component: TrustMail,
    searchable: true,
    keywords: ['message', 'email', 'mail', 'account', 'secure'],
    aliases: ['www.trustmail.com', 'mail.trustmail.com']
  },

];

/**
 * Website lookup functions
 */
export function getWebsiteByDomain(domain: string): Website | null {
  // Normalize domain (remove protocol, www, trailing slashes)
  const normalized = domain
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/$/, '')
    .toLowerCase();

  // Check exact match
  let website = websites.find(
    (w) =>
      w.domain === normalized ||
      w.domain === `https://${normalized}` ||
      w.domain === `http://${normalized}`
  );

  // Check aliases
  if (!website) {
    website = websites.find((w) =>
      w.aliases?.some((alias) => alias === normalized || alias === `www.${normalized}`)
    );
  }

  return website || null;
}

export function searchWebsites(query: string): Website[] {
  if (!query.trim()) return [];

  const lowerQuery = query.toLowerCase();

  return websites
    .filter((w) => w.searchable !== false)
    .filter(
      (w) =>
        w.name.toLowerCase().includes(lowerQuery) ||
        w.description.toLowerCase().includes(lowerQuery) ||
        w.domain.toLowerCase().includes(lowerQuery) ||
        w.keywords?.some((k) => k.toLowerCase().includes(lowerQuery))
    )
    .slice(0, 10); // Limit results
}

export function getWebsitesByCategory(category: string): Website[] {
  return websites.filter((w) => w.category === category);
}

export function getAllWebsites(): Website[] {
  return websites.filter((w) => w.searchable !== false);
}
