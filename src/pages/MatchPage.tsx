import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Match, Stream } from '../types';
import { makeMatchSlug } from '../utils/slugify';
import HomePage from './HomePage';
import ServerDialog from '../components/ServerDialog';
import { AnimatePresence } from 'motion/react';

interface MatchPageProps {
  matches: Match[];
  loading: boolean;
  error: Error | null;
  lang: 'en' | 'ar';
  theme: 'light' | 'dark';
  filter: string;
  setFilter: (f: string) => void;
}

export default function MatchPage({ matches, loading, error, lang, theme, filter, setFilter }: MatchPageProps) {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  const match = useMemo(() => {
    return matches.find(m => makeMatchSlug(m) === slug);
  }, [matches, slug]);

  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (!loading && match) {
      setDialogOpen(true);
    } else if (!loading && !match && matches.length > 0) {
      // If match not found, redirect to home
      navigate('/', { replace: true });
    }
  }, [loading, match, matches.length, navigate]);

  const handleClose = () => {
    setDialogOpen(false);
    setTimeout(() => {
      navigate('/');
    }, 300);
  };

  const handleSelectStream = (stream: Stream) => {
    setDialogOpen(false);
    setTimeout(() => {
      navigate(`/live/${stream.id}?match=${slug}`);
    }, 300);
  };

  const pageTitle = match ? `${match.homeTeam.name} vs ${match.awayTeam.name} - Live Stream` : 'Match Live Stream';
  const pageDesc = match ? `Watch ${match.homeTeam.name} vs ${match.awayTeam.name} live stream. ${lang === 'ar' ? 'بث مباشر' : 'Live stream'} ${match.competition}.` : 'Watch match live stream';

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

      <HomePage 
        matches={matches}
        loading={loading}
        error={error}
        lang={lang}
        theme={theme}
        filter={filter}
        setFilter={setFilter}
      />

      <AnimatePresence>
        {dialogOpen && match && (
          <ServerDialog 
            match={match} 
            lang={lang}
            onSelectStream={handleSelectStream}
            onClose={handleClose}
            theme={theme}
          />
        )}
      </AnimatePresence>
    </>
  );
}
