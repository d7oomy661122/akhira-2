
import { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import SubscribeDialog from './components/SubscribeDialog';
import { Match } from './types';
import { useMatches } from './hooks/useMatches';
import { cn } from './lib/utils';
import { injectMatchListSchema } from './utils/seo';

const HomePage = lazy(() => import('./pages/HomePage'));
const MatchPage = lazy(() => import('./pages/MatchPage'));
const LivePage = lazy(() => import('./pages/LivePage'));

export default function App() {
  const { matches, loading, error } = useMatches();
  const [lang, setLang] = useState<'en' | 'ar'>('en');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (matches && matches.length > 0) {
      injectMatchListSchema(matches);
    }
  }, [matches]);

  useEffect(() => {
    if (theme === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [theme]);

  const liveCount = matches.filter(m => m.status === 'live').length;

  const Loader = () => (
    <div className="flex-1 w-full h-[100dvh] flex flex-col items-center justify-center py-20 relative z-10">
      <div className="w-12 h-12 border-4 border-[#9D4EDD] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-[100dvh] font-sans flex flex-col relative" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="fixed inset-0 bg-black/5 pointer-events-none" />

      {/* Show header on all routes except LivePage. Since LivePage is full screen, we let Routes manage visibility, or just hide it via CSS, but better to extract Header to only wrap Home and Match pages. Actually, LivePage covers the screen via fixed absolute, so we can just leave Header here. */}
      
      <Routes>
        <Route path="/live/:id" element={
          <Suspense fallback={<Loader />}>
            <LivePage matches={matches} lang={lang} theme={theme} />
          </Suspense>
        } />
        
        <Route path="*" element={
          <>
            <Header 
              liveCount={liveCount} 
              lang={lang} 
              toggleLang={() => setLang(l => l === 'en' ? 'ar' : 'en')} 
              theme={theme}
              toggleTheme={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
            />
            
            <div className="flex-1 w-full flex flex-col relative z-10">
              <Suspense fallback={<Loader />}>
                <Routes>
                  <Route path="/" element={
                    <HomePage 
                      matches={matches} loading={loading} error={error}
                      lang={lang} theme={theme}
                      filter={filter} setFilter={setFilter}
                    />
                  } />
                  <Route path="/match/:slug" element={
                    <MatchPage 
                      matches={matches} loading={loading} error={error}
                      lang={lang} theme={theme}
                      filter={filter} setFilter={setFilter}
                    />
                  } />
                </Routes>
              </Suspense>
            </div>
            
            {/* Hidden SEO content for crawlers */}
            <section className="sr-only" aria-hidden="true" id="seo-content">
              <h2>بث مباشر كأس العالم 2026</h2>
              <p>
                LiveFootball365 هو الموقع الأول لمشاهدة مباريات كأس العالم 2026 بث مباشر مجاني وبجودة عالية.
              </p>
              <h2>World Cup 2026 Live Stream Free</h2>
              <p>
                Watch FIFA World Cup 2026 live stream for free on LiveFootball365.
              </p>
            </section>
            
            <SubscribeDialog lang={lang} theme={theme} />
          </>
        } />
      </Routes>
    </div>
  );
}
