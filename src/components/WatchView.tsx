import React from 'react';
import { fetchWatch } from '../lib/api';
import { Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

export function WatchView({ url, onBack }: { url: string, onBack: () => void }) {
    const [data, setData] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);
    const [activeServer, setActiveServer] = React.useState<string>('');

    React.useEffect(() => {
        let mounted = true;
        setLoading(true);
        fetchWatch(url).then(res => {
            if (!mounted) return;
            setData(res);
            if (res.streams && res.streams.length > 0) {
                setActiveServer(res.streams[0].url);
            }
            setLoading(false);
        }).catch(() => {
            if (mounted) setLoading(false);
        });
        return () => { mounted = false; };
    }, [url]);

    if (loading) {
        return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-brand w-8 h-8" /></div>;
    }

    if (!data || !data.streams || data.streams.length === 0) {
        return (
            <div className="p-10 text-center max-w-xl mx-auto">
                <button onClick={onBack} className="text-gray-400 hover:text-white mb-6 text-sm font-medium flex items-center gap-2 justify-center mx-auto">
                    <span>&larr;</span> Kembali
                </button>
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-xl">
                    Maaf, stream belum tersedia untuk episode ini. Coba lagi nanti.
                </div>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pb-24 w-full flex flex-col min-h-screen bg-[#0a0a0a]">
            {/* Header */}
            <div className="p-3 sm:p-4 flex items-center gap-3 sm:gap-4 shrink-0 bg-[#050505]">
                <button onClick={onBack} className="p-2 sm:p-2.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-full transition-all shrink-0 group flex items-center justify-center active:scale-95">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300 group-hover:text-white transition-colors"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
                </button>
                <h1 className="text-sm sm:text-lg font-medium truncate font-sans text-gray-200">{data.title}</h1>
            </div>

            {/* Video Container */}
            <div className="w-full bg-black aspect-video shrink-0 relative overflow-hidden flex items-center justify-center shadow-2xl z-10 border-b border-white/10 group">
                {(() => {
                    if (!activeServer) {
                        return <div className="flex items-center justify-center w-full h-full bg-[#111] text-gray-400 font-medium tracking-wide">Pilih Server Tontonan</div>;
                    }
                    
                    return (
                        <>
                            <iframe src={activeServer} className="w-full h-full border-0 absolute inset-0 bg-black" allowFullScreen allow="autoplay; fullscreen"></iframe>
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                <a href={activeServer} target="_blank" rel="noopener noreferrer" className="bg-black/60 hover:bg-brand backdrop-blur-sm border border-white/10 text-white text-[10px] px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                                    Buka di Browser
                                </a>
                            </div>
                        </>
                    );
                })()}
            </div>

            {/* Servers and Controls */}
            <div className="p-4 sm:p-6 overflow-y-auto max-w-5xl mx-auto w-full">
                {activeServer && (
                    <div className="mb-4 bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 sm:p-4 flex items-start gap-3">
                        <span className="text-xl">ℹ️</span>
                        <div className="flex-1">
                            <h4 className="text-blue-400 font-bold text-xs sm:text-sm mb-1 uppercase tracking-wider">Layar Hitam atau Eror?</h4>
                            <p className="text-gray-300 text-[10px] sm:text-xs">Jika video tidak muncul atau eror, klik <a href={activeServer} target="_blank" rel="noopener noreferrer" className="text-white underline font-bold px-1 rounded hover:text-brand">di sini untuk buka video di browser baru</a> karena beberapa server memblokir penayangan langsung.</p>
                        </div>
                    </div>
                )}
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm text-gray-400 font-medium uppercase tracking-wider">Pilih Server:</h3>
                    <span className="text-[10px] sm:text-xs text-yellow-500/80 bg-yellow-500/10 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg max-w-[200px] sm:max-w-none text-right">💡 Lag,eror? Coba pilih server lain Dan pilih 360p/480p</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {[...data.streams]
                        .sort((a, b) => {
                            const getRes = (name: string) => {
                                const n = name.toLowerCase();
                                if (n.includes('1080')) return 1080;
                                if (n.includes('720')) return 720;
                                if (n.includes('480')) return 480;
                                if (n.includes('360')) return 360;
                                return 0; // VIP, dsb
                            };
                            const resA = getRes(a.server);
                            const resB = getRes(b.server);
                            if (resA !== resB) return resA - resB;
                            return a.server.localeCompare(b.server);
                        })
                        .map((stream: any, i: number) => (
                        <button 
                            key={i} 
                            onClick={() => setActiveServer(stream.url)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                activeServer === stream.url 
                                ? 'bg-brand text-white border border-brand' 
                                : 'bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300'
                            }`}
                        >
                            {stream.server}
                        </button>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
