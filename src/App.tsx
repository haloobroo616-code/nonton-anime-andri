import React, { useState, useEffect } from 'react';
import { Home, Compass, Clock, Heart, Code, Search, Play, Star, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { fetchLatest, fetchSearch } from './lib/api';
import { getHistory, getFavorites } from './lib/db';
import { DetailView } from './components/DetailView';
import { WatchView } from './components/WatchView';
import { DeveloperView } from './components/DeveloperView';

// --- Home Components ---
function AnimeCard({ anime, onClick }: { anime: any, onClick: () => void }) {
    return (
        <div onClick={onClick} className="cursor-pointer group flex-shrink-0 w-36 sm:w-40 snap-start">
            <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-[#1a1a1a] mb-2">
                <img src={anime.image} alt={anime.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                <div className="absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-t from-black/80 to-transparent pointer-events-none"></div>
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded">
                    {anime.score && anime.score !== '?' ? `⭐ ${anime.score}` : (anime.episode ? `Ep ${anime.episode.replace(/[^0-9.]/g, '')}` : 'N/A')}
                </div>
            </div>
            <h3 className="text-sm font-medium text-gray-200 group-hover:text-brand line-clamp-2 transition-colors">{anime.title}</h3>
        </div>
    );
}

function Section({ title, data, onAnimeClick }: { title: string, data: any[], onAnimeClick: (url: string) => void }) {
    if (!data || data.length === 0) return null;
    return (
        <div className="mb-8">
            <h2 className="text-xl font-bold font-sans mb-4 flex items-center border-l-4 border-brand pl-3">{title}</h2>
            <div className="flex overflow-x-auto gap-4 no-scrollbar pb-4 snap-x pr-4">
                {data.map((anime, i) => <AnimeCard key={i} anime={anime} onClick={() => onAnimeClick(anime.url)} />)}
            </div>
        </div>
    );
}

// --- Views ---
function HomeView({ onAnimeClick }: { onAnimeClick: (url: string) => void }) {
    const [latest, setLatest] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[] | null>(null);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        let mounted = true;
        fetchLatest().then(res => {
            if (mounted) {
                setLatest(res);
                setLoading(false);
            }
        }).catch(() => {
            if (mounted) setLoading(false);
        });
        return () => { mounted = false; };
    }, []);

    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults(null);
            return;
        }
        
        const timeout = setTimeout(async () => {
            setIsSearching(true);
            try {
                const res = await fetchSearch(searchQuery);
                setSearchResults(res);
            } catch (e) {} finally {
                setIsSearching(false);
            }
        }, 500);
        
        return () => clearTimeout(timeout);
    }, [searchQuery]);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        // Since we have autocomplete, this can just act as a way to blur the keyboard on mobile
        (document.activeElement as HTMLElement)?.blur?.();
    };

    if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-brand w-8 h-8" /></div>;

    return (
        <div className="pb-24 px-4 sm:px-6 pt-6 max-w-7xl mx-auto flex flex-col min-h-screen">
            {/* Header & Search */}
            <div className="mb-8 relative z-50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between font-sans mb-6 gap-2">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold tracking-tight">Nime<span className="text-brand">Stream</span></h1>
                        <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
                            Website masih tahap pengembangan (Bila Error Wajar)
                        </span>
                    </div>
                </div>
                <div className="relative max-w-xl">
                    <form onSubmit={handleSearch} className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input 
                            type="text" 
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); if(!e.target.value) setSearchResults(null); }}
                            className="block w-full pl-10 pr-10 py-3 border border-white/10 rounded-xl leading-5 bg-white/5 text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand sm:text-sm transition-all" 
                            placeholder="Cari anime..." 
                        />
                        {isSearching && (
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <Loader2 className="w-4 h-4 text-brand animate-spin" />
                            </div>
                        )}
                    </form>

                    {/* Autocomplete Dropdown */}
                    {searchQuery.trim() && searchResults && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden max-h-[60vh] overflow-y-auto w-full z-50">
                            {searchResults.length === 0 ? (
                                <div className="p-4 text-center text-sm text-gray-400">Tidak ada anime ditemukan.</div>
                            ) : (
                                <ul className="flex flex-col">
                                    {searchResults.map((anime, i) => (
                                        <li key={i} className="border-b border-white/5 last:border-b-0">
                                            <button 
                                                onClick={() => {
                                                    setSearchQuery('');
                                                    setSearchResults(null);
                                                    onAnimeClick(anime.url);
                                                }}
                                                className="w-full flex items-center gap-3 p-3 outline-none text-left hover:bg-white/5 focus:bg-white/5 transition-colors group"
                                            >
                                                <img src={anime.image} alt="" className="w-10 h-14 object-cover rounded bg-white/5" loading="lazy" />
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-medium text-gray-200 group-hover:text-brand line-clamp-1 transition-colors">{anime.title}</h4>
                                                    <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-500">
                                                        {anime.type && <span className="bg-white/10 px-1.5 py-0.5 rounded">{anime.type}</span>}
                                                        {anime.score && anime.score !== '?' && <span>⭐ {anime.score}</span>}
                                                    </div>
                                                </div>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1">
                {/* Hero Slider Simple Layout */}
                {latest.length > 0 && (
                    <div className="mb-10 relative rounded-2xl overflow-hidden aspect-[16/9] sm:aspect-[21/9] bg-[#111] group cursor-pointer" onClick={() => onAnimeClick(latest[0].url)}>
                        <img src={latest[0].image} alt={latest[0].title} className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 p-4 sm:p-8 w-full md:w-2/3">
                            <span className="bg-brand text-white text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1 rounded-sm uppercase tracking-wider mb-2 sm:mb-3 inline-block">Terbaru</span>
                            <h1 className="text-xl sm:text-3xl md:text-4xl font-bold text-white mb-2 line-clamp-2">{latest[0].title}</h1>
                            <div className="flex items-center text-xs sm:text-sm font-medium text-gray-300 gap-3">
                               <span className="flex items-center gap-1"><Play className="w-4 h-4 fill-current text-white" /> Eps {latest[0].episode?.replace(/[^0-9.]/g, '') || '?'}</span>
                            </div>
                        </div>
                    </div>
                )}
                <Section title="Baru Ditambahkan" data={latest.slice(1, 15)} onAnimeClick={onAnimeClick} />
            </div>
        </div>
    );
}

function GridView({ title, fetchData, onAnimeClick, noDataMsg }: { title: string, fetchData: () => Promise<any[]>, onAnimeClick: (url: string) => void, noDataMsg: string }) {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData().then(res => { setData(res); setLoading(false); }).catch(() => setLoading(false));
    }, [fetchData]);

    if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-brand w-8 h-8" /></div>;

    return (
        <div className="pb-24 px-4 sm:px-6 pt-8 max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold font-sans mb-6 flex items-center border-l-4 border-brand pl-3">{title}</h2>
            {data.length === 0 ? (
                <div className="py-20 text-center">
                    <p className="text-gray-400 text-lg">{noDataMsg}</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {data.map((anime, i) => <AnimeCard key={i} anime={anime} onClick={() => onAnimeClick(anime.url)} />)}
                </div>
            )}
        </div>
    );
}

// --- Main App ---
export default function App() {
    // view stack: 'home', 'recent', 'favorite', 'developer', 'detail:{url}', 'watch:{url}'
    const [viewStack, setViewStack] = useState<string[]>(['home']);
    
    const currentView = viewStack[viewStack.length - 1];
    
    const navigate = (view: string) => {
        if (view === currentView) return;
        // If clicking a bottom nav item, we reset stack
        if (['home', 'recent', 'favorite', 'developer'].includes(view)) {
            setViewStack([view]);
        } else {
            setViewStack([...viewStack, view]);
        }
    };
    
    const goBack = () => {
        if (viewStack.length > 1) {
            setViewStack(viewStack.slice(0, -1));
        } else {
            setViewStack(['home']);
        }
    };

    const isMainNav = ['home', 'recent', 'favorite', 'developer'].includes(currentView);

    return (
        <div className="min-h-screen font-sans selection:bg-brand/30">
            <AnimatePresence mode="wait">
                {currentView === 'home' && (
                    <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <HomeView onAnimeClick={(url) => navigate(`detail:${url}`)} />
                    </motion.div>
                )}
                
                {currentView === 'recent' && (
                    <motion.div key="recent" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <GridView title="Riwayat Nonton" fetchData={getHistory} onAnimeClick={(url) => navigate(`detail:${url}`)} noDataMsg="Belum ada riwayat." />
                    </motion.div>
                )}

                {currentView === 'favorite' && (
                    <motion.div key="favorite" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                         <GridView title="Anime Favorit" fetchData={getFavorites} onAnimeClick={(url) => navigate(`detail:${url}`)} noDataMsg="Belum ada favorit." />
                    </motion.div>
                )}
                
                {currentView === 'developer' && (
                    <motion.div key="developer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                         <DeveloperView />
                    </motion.div>
                )}

                {currentView.startsWith('detail:') && (
                     <DetailView key={currentView} url={currentView.split('detail:')[1]} onBack={goBack} onWatch={(url) => navigate(`watch:${url}`)} />
                )}

                {currentView.startsWith('watch:') && (
                     <WatchView key={currentView} url={currentView.split('watch:')[1]} onBack={goBack} />
                )}
            </AnimatePresence>

            {/* Bottom Navigation */}
            {isMainNav && (
                <div className="fixed bottom-0 left-0 right-0 bg-[#0a0a0a]/90 backdrop-blur-md border-t border-white/10 pb-safe z-50">
                    <div className="max-w-md mx-auto grid grid-cols-4 items-center px-2 py-3">
                        <button onClick={() => navigate('home')} className={`flex flex-col items-center gap-1 transition-colors ${currentView === 'home' ? 'text-brand' : 'text-gray-500 hover:text-gray-300'}`}>
                            <Home className="w-6 h-6" />
                            <span className="text-[10px] font-medium">Beranda</span>
                        </button>
                        <button onClick={() => navigate('recent')} className={`flex flex-col items-center gap-1 transition-colors ${currentView === 'recent' ? 'text-brand' : 'text-gray-500 hover:text-gray-300'}`}>
                            <Clock className="w-6 h-6" />
                            <span className="text-[10px] font-medium">Riwayat</span>
                        </button>
                        <button onClick={() => navigate('favorite')} className={`flex flex-col items-center gap-1 transition-colors ${currentView === 'favorite' ? 'text-brand' : 'text-gray-500 hover:text-gray-300'}`}>
                            <Heart className="w-6 h-6" />
                            <span className="text-[10px] font-medium">Favorit</span>
                        </button>
                        <button onClick={() => navigate('developer')} className={`flex flex-col items-center gap-1 transition-colors ${currentView === 'developer' ? 'text-brand' : 'text-gray-500 hover:text-gray-300'}`}>
                            <Code className="w-6 h-6" />
                            <span className="text-[10px] font-medium">Developer</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

