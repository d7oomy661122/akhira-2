import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Match, Stream } from '../types';
import UniversalPlayer from '../components/UniversalPlayer';
import { makeMatchSlug } from '../utils/slugify';
import { cn } from '../lib/utils';

interface LivePageProps {
  matches: Match[];
  lang: 'en' | 'ar';
  theme: 'light' | 'dark';
}

export default function LivePage({ matches, lang, theme }: LivePageProps) {
  const { id: streamId } = useParams();
  const [searchParams] = useSearchParams();
  const matchSlug = searchParams.get('match');
  const navigate = useNavigate();

  const [activeStream, setActiveStream] = useState<Stream | null>(null);
  const [loadingStream, setLoadingStream] = useState(true);

  const activeMatch = useMemo(() => {
    if (!matchSlug) return null;
    return matches.find(m => makeMatchSlug(m) === matchSlug) || null;
  }, [matches, matchSlug]);

  useEffect(() => {
    let isMounted = true;
    
    // Fetch servers.json to find stream URL
    fetch('/servers.json?t=' + new Date().getTime())
      .then(res => res.json())
      .then(data => {
        if (!isMounted) return;
        
        let foundStream: Stream | null = null;
        if (data && data.matches) {
          for (const m of data.matches) {
            if (m.servers) {
              const stream = m.servers.find((s: any) => s.id === streamId);
              if (stream) {
                foundStream = stream;
                break;
              }
            }
          }
        }
        
        if (foundStream) {
          setActiveStream(foundStream);
        } else {
          // Fallback check in match object streams
          if (activeMatch && activeMatch.streams) {
            const stream = activeMatch.streams.find(s => s.id === streamId);
            if (stream) {
              setActiveStream(stream);
            }
          }
        }
        setLoadingStream(false);
      })
      .catch(err => {
        console.error('Error fetching servers:', err);
        if (isMounted) setLoadingStream(false);
      });

    return () => { isMounted = false; };
  }, [streamId, activeMatch]);

  const handleBack = () => {
    if (activeMatch) {
      navigate(`/match/${makeMatchSlug(activeMatch)}`);
    } else {
      navigate('/');
    }
  };

  const pageTitle = activeMatch ? `Live: ${activeMatch.homeTeam.name} vs ${activeMatch.awayTeam.name}` : 'Live Stream';
  const pageDesc = activeMatch ? `Watching ${activeMatch.homeTeam.name} vs ${activeMatch.awayTeam.name} live.` : 'Watch live stream';

  if (loadingStream) {
    return (
       <div className="flex-1 flex w-full h-[100dvh] flex-col items-center justify-center bg-[#09090b]">
          <div className="w-12 h-12 border-4 border-[#9D4EDD] border-t-transparent rounded-full animate-spin"></div>
       </div>
    );
  }

  if (!activeStream) {
    return (
       <div className="flex-1 flex w-full h-[100dvh] flex-col items-center justify-center bg-[#09090b] text-white">
          <p className="mb-4">Stream not found or offline.</p>
          <button onClick={handleBack} className="px-4 py-2 bg-[#9D4EDD] rounded">Go Back</button>
       </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDesc} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDesc} />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDesc} />
      </Helmet>
      
      <div className="flex-1 flex flex-col relative w-full h-full">
        <UniversalPlayer 
          streamUrl={activeStream.url}
          match={activeMatch || undefined}
          lang={lang}
          onBack={handleBack}
        />
      </div>
    </>
  );
}
