/**
 * TechBlog - Fake tech blog/news website
 * Potential use: Social engineering, fake download links, XSS demonstrations
 */

import { useState } from 'react';
import { WebsiteProps } from '../types';
import { WebsiteLayout, WebsiteHeader, WebsiteContainer, WebsiteFooter } from '../components/WebsiteLayout';
import { Share2, Bookmark, Clock, X, Shield, ArrowRight, Download, TrendingUp, User, Star, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/components/ui/utils';

interface Article {
  id: number;
  title: string;
  excerpt: string;
  content?: string;
  links?: { label: string; url: string; variant?: 'default' | 'primary'; icon?: any }[];
  author: string;
  date: string;
  category: string;
  icon: any;
  color?: string;
  bg?: string;
  readTime?: string;
}

const articles: Article[] = [
  {
    id: 1,
    title: 'Aurora OS.js 0.8.5: Security Hardening & The Polish Pass',
    excerpt: 'The latest update brings critical security fixes, 100% localization parity across 12 languages, and a massive UI overhaul for the DevCenter.',
    author: 'Nova Republika',
    date: 'January 30, 2026',
    category: 'Changelog',
    icon: Shield,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    readTime: '1 min read',
    links: [
      { label: 'Download v0.8.5', url: 'https://github.com/mental-os/Aurora-OS.js/releases', variant: 'primary', icon: Download },
      { label: 'Star on GitHub', url: 'https://github.com/mental-os/Aurora-OS.js', variant: 'default', icon: Star },
    ],
    content: `
      <div class="space-y-6">
        <p class="text-xl text-gray-600 leading-relaxed font-light">
          We're excited to announce <strong class="text-gray-900 font-medium">Aurora OS.js 0.8.5</strong>, a release focused on stability, security, and refining the core experience. While our previous updates introduced major apps like Photos and Messages, this patch ensures the foundation is rock-solid.
        </p>

        <h3 class="text-2xl font-bold text-gray-900 mt-8 mb-4">Security First</h3>
        <p class="text-gray-600 leading-relaxed">
          The safety of your virtual environment is paramount. We've resolved high-severity vulnerabilities in our dependency chain, specifically targeting the <code>node-tar</code> package. By implementing a global override to <code>tar@^7.5.6</code>, we've mitigated potential risks (GHSA-8qq5-rm4j-mr97) before they could be exploited.
        </p>

        <h3 class="text-2xl font-bold text-gray-900 mt-8 mb-4">Global Localization</h3>
        <p class="text-gray-600 leading-relaxed">
          Aurora OS is for everyone. We have achieved <strong>100% translation parity</strong> across all 12 supported languages. Whether you're using the system in English, German, Romanian, or Japanese, every UI element—from the Bios settings to the DevCenter—is now fully localized.
        </p>
        
        <h3 class="text-2xl font-bold text-gray-900 mt-8 mb-4">DevCenter Overhaul</h3>
        <p class="text-gray-600 leading-relaxed">
          For the hackers and developers among you, the DevCenter has received a complete facelift. It now features a unified <strong>glassmorphism aesthetic</strong> that respects your system accent color. We've also added a new <em>Messages Debugger</em> to help you test notification flows and account creation without leaving the dashboard.
        </p>

        <h3 class="text-2xl font-bold text-gray-900 mt-8 mb-4">Quality of Life</h3>
        <ul class="list-disc pl-5 space-y-2 text-gray-600">
          <li><strong>Audio Immersion:</strong> A generic "Ambiance" channel has been added with independent volume controls, perfect for setting the mood while you code.</li>
          <li><strong>Smart Notifications:</strong> We've created a clear distinction between system alerts (bottom right) and app notifications (top right), reducing visual clutter.</li>
          <li><strong>Performance:</strong> Terminal input handling specifically has been optimized, making the command line feel snappier than ever.</li>
        </ul>

        <div class="bg-indigo-50 border border-indigo-100 rounded-xl p-6 mt-8">
          <h4 class="text-indigo-900 font-bold mb-2">What's Next?</h4>
          <p class="text-indigo-800 text-sm">
            We are paving the way for <strong>Stage 1 (1.x.x)</strong>, our first major milestone towards a full single-player campaign. Stay tuned for version 0.9.x, which will introduce the first gameplay loops.
          </p>
        </div>

      </div>
      </div>
    `
  },
  {
    id: 2,
    title: '400 Stars & Counting: Thank You!',
    excerpt: 'We just hit a major milestone on GitHub! A huge thank you to our growing community of developers, hackers, and cyberpunk enthusiasts.',
    author: 'mental.os()',
    date: 'January 30, 2026',
    category: 'Community',
    icon: Star,
    color: 'text-amber-500',
    bg: 'bg-amber-50',
    readTime: '2 min read',
    links: [
      { label: 'Star on GitHub', url: 'https://github.com/mental-os/Aurora-OS.js', variant: 'primary', icon: Star },
      { label: 'Join Discord', url: 'https://discord.gg/AtAVfRDYhG', variant: 'default', icon: MessageCircle }
    ],
    content: `
      <div class="space-y-6">
        <p class="text-xl text-gray-600 leading-relaxed font-light">
          We are incredibly humbled to announce that <strong>Aurora OS.js</strong> has reached 400 stars on GitHub.
        </p>
        
        <p class="text-gray-600 leading-relaxed">
           What started as a late-night experiment in emulating a desktop environment has grown into a passionate community project. Your bug reports, feature requests, and code contributions drive this project forward every single day.
        </p>

        <h3 class="text-2xl font-bold text-gray-900 mt-8 mb-4">Community Highlights</h3>
        <p class="text-gray-600 leading-relaxed">
            Special shoutout to our recent contributors who helped crush some critical bugs in the Filesystem and Terminal modules. We're building something special here—a web OS that feels real, responsive, and maybe a little bit <em>dangerous</em>.
        </p>
        
        <div class="bg-amber-50 border border-amber-100 rounded-xl p-6 mt-8">
            <h4 class="text-amber-900 font-bold mb-2">Join the Movement</h4>
            <p class="text-amber-800 text-sm">
                We're just getting started. If you haven't already, check out the roadmap for version 1.0 and see how you can help us build the ultimate web-based OS.
            </p>
        </div>
      </div>
    `
  },
];

export function TechBlog(_props: WebsiteProps) {
  const [selectedArticle, setSelectedArticle] = useState<typeof articles[0] | null>(null);

  // Prevent scroll propagation when modal is open
  // Ideally we'd lock body scroll but inside the browser app we just let the overlay cover it

  return (
    <WebsiteLayout bg="bg-gray-50">
      <WebsiteHeader
        bg="bg-white"
        logo={
          <div className="flex items-center gap-2">
            <div className="absolute -inset-1 bg-linear-to-r from-blue-600 to-cyan-600 rounded-full blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div><span className="text-xl font-bold text-gray-900">TechBlog</span>
          </div>
        }
        nav={
          <div className="flex gap-8 text-gray-600 text-sm font-medium">
            <button className="hover:text-gray-900 transition-colors">Latest</button>
            <button className="hover:text-gray-900 transition-colors">Tutorials</button>
            <button className="hover:text-gray-900 transition-colors">News</button>
            <button className="hover:text-gray-900 transition-colors">Security</button>
            <button className="hover:text-gray-900 transition-colors">Careers</button>
          </div>
        }
        actions={
          <div className="flex items-center gap-3">
            {/* 
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Search className="w-5 h-5 text-gray-600" />
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
              Subscribe
            </button>
            */}
          </div>
        }
      />

      {/* Hero Article */}
      <div className="bg-linear-to-r from-blue-900 to-purple-900 text-white py-16">
        <WebsiteContainer>
          <div className="flex items-center gap-2 text-blue-300 mb-4">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-medium">TRENDING NOW</span>
          </div>
          <h1 className="text-5xl font-bold mb-4 max-w-3xl">
            Critical Security Flaw Affects 80% of Web Applications
          </h1>
          <p className="text-xl text-blue-100 mb-6 max-w-2xl">
            Researchers warn that a widespread vulnerability in authentication systems could expose millions of user accounts.
          </p>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-blue-200">By Security Team</span>
            <span className="text-blue-300">•</span>
            <span className="text-blue-200">5 min read</span>
            <span className="text-blue-300">•</span>
            <span className="text-blue-200">January 5, 2026</span>
          </div>
        </WebsiteContainer>
      </div>

      <WebsiteContainer className="py-12">
        {/* Articles Grid */}
        <div className="grid grid-cols-1 @md:grid-cols-2 gap-8 mb-12">
          {articles.map((article) => {
            const Icon = article.icon;
            return (
              <div
                key={article.id}
                onClick={() => setSelectedArticle(article)}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer group flex flex-col"
              >
                <div className={`h-48 ${article.bg} flex items-center justify-center`}>
                  <Icon className={`w-16 h-16 ${article.color}`} />
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-xs font-semibold ${article.color} uppercase tracking-wide`}>
                      {article.category}
                    </span>
                    <span className="text-gray-300">•</span>
                    <span className="text-xs text-gray-500">{article.date}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center gap-3 mt-auto pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                      <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-none">
                        <User className="w-3 h-3 text-gray-500" />
                      </div>
                      <span>{article.author}</span>
                    </div>
                    <span className="text-gray-300">•</span>
                    <span className="text-xs text-gray-400 font-medium">{article.readTime}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Community / Discord Section */}
        <div className="bg-linear-to-r from-indigo-600 to-purple-600 rounded-2xl p-12 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-white/5 backdrop-blur-[1px]" />
          <div className="relative z-10">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-md">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Join our Community</h2>
            <p className="text-indigo-100 mb-8 max-w-md mx-auto text-lg">
              Connect with other developers, share your rices, and get direct support from the Aurora OS team.
            </p>
            <a
              href="https://discord.gg/AtAVfRDYhG"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
            >
              <MessageCircle className="w-5 h-5" />
              Join Discord Server
            </a>
            <p className="text-xs text-indigo-200 mt-6">
              100+ members • Active daily • Developer support
            </p>
          </div>
        </div>
      </WebsiteContainer>

      <WebsiteFooter>
        <div className="grid grid-cols-4 gap-8 mb-8">
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Categories</h4>
            {/* ... footer content same ... */}
            <div className="space-y-2 text-sm text-gray-600">
              <div>Web Development</div>
              <div>Mobile Apps</div>
              <div>Cloud Computing</div>
              <div>AI & Machine Learning</div>
              <div>DevOps</div>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Resources</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <div>Tutorials</div>
              <div>Cheat Sheets</div>
              <div>Tools</div>
              <div>Books</div>
              <div>Courses</div>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Company</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <div>About Us</div>
              <div>Write for Us</div>
              <div>Advertise</div>
              <div>Careers</div>
              <div>Contact</div>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Follow Us</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <div>Twitter</div>
              <div>GitHub</div>
              <div>LinkedIn</div>
              <div>YouTube</div>
              <div>Discord</div>
            </div>
          </div>
        </div>
        <div className="pt-6 border-t border-gray-300 text-sm text-gray-600 text-center">
          ©2026 TechBlog. A Nova Republika sponsored news outlet.
        </div>
      </WebsiteFooter>

      {/* Article Modal */}
      <AnimatePresence>
        {selectedArticle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 @md:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedArticle(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              onClick={(e: any) => e.stopPropagation()}
              onMouseDown={(e: any) => e.stopPropagation()}
              className="bg-white w-full max-w-4xl max-h-[90%] rounded-2xl shadow-2xl relative z-10 flex flex-col overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-100 flex-none bg-white flex items-start justify-between">
                <div className="pr-8">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-xs font-bold ${selectedArticle.color} px-2 py-1 bg-gray-100 rounded-md uppercase tracking-wide`}>
                      {selectedArticle.category}
                    </span>
                    <span className="text-gray-300">•</span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {selectedArticle.readTime}
                    </span>
                  </div>
                  <h2 className="text-2xl @md:text-3xl font-bold text-gray-900 leading-tight">
                    {selectedArticle.title}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-6 @md:p-10">
                <div className="flex items-center justify-between mb-8 pb-8 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{selectedArticle.author}</div>
                      <div className="text-xs text-gray-500">{selectedArticle.date}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Share2 className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Bookmark className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div
                  className="prose prose-blue max-w-none text-gray-600 prose-headings:font-bold prose-headings:text-gray-900 select-text cursor-text"
                  dangerouslySetInnerHTML={{ __html: selectedArticle.content! }}
                />

                {/* Action Links */}
                {(selectedArticle as any).links && (
                  <div className="flex flex-wrap gap-3 mt-10 pt-8 border-t border-gray-100">
                    {(selectedArticle as any).links.map((link: any, i: number) => (
                      <a
                        key={i}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          "px-5 py-2.5 font-medium rounded-xl text-sm inline-flex items-center gap-2 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5",
                          link.variant === 'primary'
                            ? "bg-gray-900 text-white hover:bg-gray-800 shadow-gray-900/20"
                            : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                        )}
                      >
                        {link.icon && <link.icon className="w-4 h-4" />}
                        <span>{link.label}</span>
                        {link.variant === 'primary' && <ArrowRight className="w-4 h-4 opacity-50" />}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </WebsiteLayout>
  );
}
