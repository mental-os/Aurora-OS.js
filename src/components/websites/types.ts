/**
 * Website System Types
 *
 * Defines the structure for fake websites in yAMI OS Browser.
 * Each website can have its own UI, logic, and behavior.
 */

import { FC } from 'react';

/**
 * Category of the website
 */
export type WebsiteCategory =
  | 'blog'
  | 'ecommerce'
  | 'university'
  | 'bank'
  | 'social'
  | 'forum'
  | 'news'
  | 'government'
  | 'corporate'
  | 'search'
  | 'mail'
  | 'other';

/**
 * Security status indicator
 */
export type SecurityStatus =
  | 'secure'         // HTTPS, valid certificate
  | 'insecure'       // HTTP, no encryption
  | 'warning'        // Mixed content or suspicious
  | 'phishing';      // Known phishing site

/**
 * Props passed to each website component
 */
export interface WebsiteProps {
  domain: string;
  onNavigate?: (url: string) => void;
  params?: Record<string, string>;
  owner?: string;
}

/**
 * Website metadata and configuration
 */
export interface Website {
  id: string;
  domain: string;
  name: string;
  description: string;
  category: WebsiteCategory;
  security: SecurityStatus;
  color: string;
  component: FC<WebsiteProps>;
  searchable?: boolean;
  keywords?: string[];
  aliases?: string[];
}

/**
 * Navigation history entry
 */
export interface HistoryEntry {
  url: string;
  title: string;
  timestamp: Date;
  favicon?: string;
}

/**
 * Bookmark entry
 */
export interface Bookmark {
  id: string;
  url: string;
  title: string;
  folder?: string;
  tags?: string[];
  created: Date;
}
