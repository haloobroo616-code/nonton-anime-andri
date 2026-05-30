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
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pb-24 max-w-5xl mx-auto flex flex-col h-[calc(100vh-2rem)]">
            <div className="p-4 flex items-center gap-4 border-b border-white/10 shrink-0">
                <button onClick={onBack} className="text-gray-400 hover:text-white text-sm font-medium shrink-0">
                    &larr; Kembali
                </button>
                <h1 className="text-lg font-medium truncate font-sans">{data.title}</h1>
            </div>

            <div className="w-full max-w-6xl mx-auto bg-black aspect-video shrink-0 relative overflow-hidden sm:border sm:border-white/10 sm:rounded-lg shadow-2xl">
                {activeServer ? (
                    activeServer.endsWith('.mp4') ? (
                        <video 
                            src={activeServer} 
                            controls 
                            autoPlay 
                            playsInline
                            className="w-full h-full absolute inset-0 bg-black"
                        ></video>
                    ) : (
                        <iframe src={activeServer} className="w-full h-full border-0 absolute inset-0 bg-black" allowFullScreen allow="autoplay; fullscreen" referrerPolicy="no-referrer"></iframe>
                    )
                ) : (
                    <div className="flex items-center justify-center w-full h-full bg-[#111] text-gray-400">Pilih Server</div>
                )}
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto">
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
