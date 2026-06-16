import { useState } from 'react';
import MatchList from '../components/MatchList';
import BannerAd from '../components/BannerAd';
import { Match } from '../types';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { makeMatchSlug } from '../utils/slugify';
import { cn } from '../lib/utils';

interface HomePageProps {
  matches: Match[];
  loading: boolean;
  error: Error | null;
  lang: 'en' | 'ar';
  theme: 'light' | 'dark';
  filter: string;
  setFilter: (f: string) => void;
  pageLoading?: boolean;
}

export default function HomePage({ matches, loading, error, lang, theme, filter, setFilter, pageLoading }: HomePageProps) {
  const navigate = useNavigate();
  
  const handleMatchClick = (match: Match) => {
    navigate(`/match/${makeMatchSlug(match)}`);
  };

  return (
    <>
      <Helmet>
        <title>{lang === 'ar' ? 'بث مباشر كأس العالم 2026 - LiveFootball365' : 'LiveFootball365 - World Cup 2026 Live Streams'}</title>
        <meta name="description" content={lang === 'ar' ? 'شاهد مباريات كأس العالم 2026 بث مباشر مجاني وبجودة عالية' : 'Watch FIFA World Cup 2026 live stream for free in high quality'} />
      </Helmet>

      <div className="flex-1 w-full flex justify-center max-w-[800px] mx-auto relative z-10">
        <main role="main" aria-label="قائمة المباريات" className="flex-1 w-full relative flex flex-col pt-4 mx-2 lg:mx-4 pb-4">
          <h1 className="sr-only">بث مباشر كأس العالم 2026 - LiveFootball365</h1>
          
          <div className="flex justify-center mb-6 w-full overflow-hidden">
            <BannerAd adKey="7c620cdf0641c01a146c38a235345706" width={468} height={60} />
          </div>
          
          {(loading && matches.length === 0) || pageLoading ? (
             <div className="flex-1 flex flex-col items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-[#9D4EDD] border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className={cn("font-bold tracking-widest", theme === 'dark' ? 'text-white' : 'text-[#4B0082]')}>
                  {lang === 'ar' ? 'جاري التحضير...' : 'LOADING...'}
                </p>
             </div>
          ) : error && matches.length === 0 ? (
             <div className="flex-1 flex flex-col items-center justify-center py-20 text-center gap-3">
               <span className="text-5xl">⚠️</span>
               <p className={cn("font-bold text-lg drop-shadow-md", theme === 'dark' ? 'text-white' : 'text-[#4B0082]')}>
                 {lang === 'ar' ? 'حدث خطأ في جلب البيانات' : 'Error fetching data'}
               </p>
             </div>
          ) : (
             <MatchList 
                matches={matches} 
                selectedMatch={null} 
                lang={lang}
                onSelect={handleMatchClick}
                filter={filter}
                setFilter={setFilter}
                theme={theme}
             />
          )}
        </main>
      </div>

      {!pageLoading && (
         <div className="w-full relative z-10 mx-auto px-2 lg:px-4 shrink-0 flex justify-center pb-4 overflow-hidden">
            <BannerAd adKey="7c620cdf0641c01a146c38a235345706" width={468} height={60} />
         </div>
      )}
    </>
  );
}
