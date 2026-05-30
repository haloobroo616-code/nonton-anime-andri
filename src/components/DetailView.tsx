import React from 'react';
import { Home, Compass, Clock, Heart, Code, Star, Play, PlayCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { fetchDetail, fetchWatch } from '../lib/api';
import { checkFavorite, toggleFavorite, saveHistory } from '../lib/db';

export function DetailView({ url, onBack, onWatch }: { url: string, onBack: () => void, onWatch: (url: string) => void }) {
    const [data, setData] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);
    const [isFav, setIsFav] = React.useState(false);

    React.useEffect(() => {
        let mounted = true;
        setLoading(true);
        fetchDetail(url).then(async res => {
            if (!mounted) return;
            setData(res);
            saveHistory({ url, title: res.title, image: res.image, score: res.info?.skor || res.info?.score || '0' });
            const fav = await checkFavorite(url);
            setIsFav(fav);
            setLoading(false);
        }).catch(() => {
            if (mounted) setLoading(false);
        });
        return () => { mounted = false; };
    }, [url]);

    const handleToggleFav = async () => {
        if (!data) return;
        const score = data.info?.skor || data.info?.score || '0';
        await toggleFavorite(url, data.title, data.image, score);
        setIsFav(await checkFavorite(url));
    };

    if (loading) {
        return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-brand w-8 h-8" /></div>;
    }
    if (!data) return <div className="p-10 text-center">Failed to load.</div>;

    const info = data.info || {};
    const status = info.status || 'Ongoing';
    const score = info.skor || info.score || 'N/A';
    const type = info.tipe || info.type || 'TV';
    const totalEps = info.total_episode || info.episode || '?';
    const duration = info.durasi || info.duration || '?';
    const seasonInfo = `${info.musim || ''} ${info.dirilis || ''}`.trim() || 'Unknown Date';
    const genreText = info.genre || info.genres || '';
    const genres = genreText ? genreText.split(',').map((g: string) => g.trim()) : ['Anime'];
    const isEpsExist = data.episodes && data.episodes.length > 0;
    const oldestEpUrl = isEpsExist ? data.episodes[data.episodes.length - 1].url : '';
    const newestEpUrl = isEpsExist ? data.episodes[0].url : '';

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="pb-24 max-w-4xl mx-auto px-4 sm:px-6 pt-6">
            <button onClick={onBack} className="text-gray-400 hover:text-white mb-6 text-sm font-medium flex items-center gap-2">
                <span>&larr;</span> Kembali
            </button>
            
            <div className="flex justify-between items-start mb-2 gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold font-sans">{data.title}</h1>
                <button onClick={handleToggleFav} className={`p-2 rounded-full flex-shrink-0 transition-colors ${isFav ? 'bg-red-500/20 text-red-500' : 'bg-white/5 text-gray-400 hover:text-white'}`}>
                    <Heart className="w-6 h-6" fill={isFav ? "currentColor" : "none"} />
                </button>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-6 mt-6">
                <div className="w-full sm:w-1/3 flex-shrink-0">
                    <img src={data.image} alt={data.title} className="w-full rounded-xl aspect-[3/4] object-cover shadow-xl shadow-black/50" />
                </div>
                
                <div className="flex-1 space-y-4">
                    <div className="flex flex-wrap gap-2 text-xs font-semibold">
                        <span className="px-2.5 py-1 rounded bg-white/10 text-white capitalize">{status.replace('_', ' ')}</span>
                        <span className="px-2.5 py-1 rounded bg-yellow-500/20 text-yellow-500 flex items-center gap-1"><Star className="w-3 h-3 fill-current" /> {score}</span>
                        <span className="px-2.5 py-1 rounded bg-brand/20 text-brand">{type}</span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {genres.map((g: string, i: number) => (
                            <span key={i} className="px-3 py-1 rounded-full border border-white/10 text-gray-300 text-xs">{g}</span>
                        ))}
                    </div>

                    <p className="text-sm text-gray-400 leading-relaxed max-h-40 overflow-y-auto pr-2 no-scrollbar">
                        {data.description || 'Tidak ada deskripsi tersedia.'}
                    </p>

                    <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                        <div className="bg-white/5 p-3 rounded-lg"><span className="block text-gray-400 text-xs mb-1">MUSIM</span><span className="font-medium">{seasonInfo}</span></div>
                        <div className="bg-white/5 p-3 rounded-lg"><span className="block text-gray-400 text-xs mb-1">TOTAL EPS</span><span className="font-medium">{totalEps}</span></div>
                        <div className="bg-white/5 p-3 rounded-lg col-span-2"><span className="block text-gray-400 text-xs mb-1">DURASI</span><span className="font-medium">{duration}</span></div>
                    </div>

                    <div className="flex gap-3 mt-6">
                        <button onClick={() => oldestEpUrl ? onWatch(oldestEpUrl) : alert('Belum ada')} className="flex-1 bg-brand hover:bg-brand-hover text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors">
                            <Play className="w-5 h-5 fill-current" /> Nonton Dari Awal
                        </button>
                        <button onClick={() => newestEpUrl ? onWatch(newestEpUrl) : alert('Belum ada')} className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors">
                            Terbaru
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-10">
                <h2 className="text-xl font-bold mb-4 flex items-center justify-between">
                    <span>Daftar Episode</span>
                    {isEpsExist && <span className="text-xs bg-white/10 px-3 py-1 rounded-full font-medium">{data.episodes.length} Eps</span>}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {data.episodes?.map((ep: any, i: number) => {
                        let displayTitle = '';
                        let epNumMatch = ep.title.match(/(?:Episode|Eps|Ep)\s*(\d+(\.\d+)?)/i);
                        if (epNumMatch) displayTitle = epNumMatch[1];
                        else { let nums = ep.title.match(/\d+/g); displayTitle = nums ? nums[nums.length - 1] : ep.title; }
                        
                        return (
                            <button key={i} onClick={() => onWatch(ep.url)} className="bg-white/5 hover:bg-brand/20 hover:text-brand border border-white/5 hover:border-brand/50 rounded-xl py-3 px-2 flex items-center justify-center overflow-hidden transition-colors group">
                                <span className="text-sm font-medium w-full truncate text-center" title={ep.title}>Eps {displayTitle}</span>
                            </button>
                        )
                    })}
                </div>
            </div>
        </motion.div>
    );
}
