import React, { useEffect, useState } from 'react';
import { fetchTiktok } from '../lib/api';
import { Loader2, Users, Heart, ExternalLink } from 'lucide-react';

export function DeveloperView() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        fetchTiktok('andrimanaa_').then(res => {
            if (mounted) {
                setData(res);
                setLoading(false);
            }
        }).catch(() => {
            if (mounted) setLoading(false);
        });
        return () => { mounted = false; };
    }, []);

    return (
        <div className="pb-24 px-4 sm:px-6 pt-10 max-w-2xl mx-auto flex flex-col items-center text-center">
            <h1 className="text-3xl font-bold font-sans mb-8">Developer</h1>
            
            <div className="w-full bg-[#111] border border-white/10 rounded-2xl p-6 sm:p-10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand/20 blur-[50px] -mr-10 -mt-10 rounded-full"></div>
                
                <div className="relative z-10 flex flex-col items-center">
                    {loading ? (
                         <div className="w-24 h-24 rounded-full bg-white/5 animate-pulse mb-4"></div>
                    ) : (
                        <div className="w-24 h-24 rounded-full border-4 border-[#1a1a1a] shadow-xl overflow-hidden mb-4 relative bg-gray-800">
                            {data?.avatar ? (
                                <img src={data.avatar} alt="Andrison" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-3xl font-bold bg-brand text-white">A</div>
                            )}
                        </div>
                    )}
                    
                    <h2 className="text-xl sm:text-2xl font-bold text-white">Andrison</h2>
                    <p className="text-gray-400 text-sm mb-6">@andrimanaa_</p>
                    
                    {!loading && data && (
                        <div className="flex items-center gap-6 mb-8 text-sm font-medium">
                            <div className="flex flex-col items-center">
                                <span className="text-xl text-white font-bold">{data.followers >= 1000 ? (data.followers/1000).toFixed(1) + 'K' : data.followers}</span>
                                <span className="text-gray-500 flex items-center gap-1"><Users className="w-3 h-3" /> Followers</span>
                            </div>
                            <div className="w-px h-8 bg-white/10"></div>
                            <div className="flex flex-col items-center">
                                <span className="text-xl text-white font-bold">{data.likes >= 1000 ? (data.likes/1000).toFixed(1) + 'K' : data.likes}</span>
                                <span className="text-gray-500 flex items-center gap-1"><Heart className="w-3 h-3" /> Likes</span>
                            </div>
                        </div>
                    )}

                    <a 
                        href="https://www.tiktok.com/@andrimanaa_?_r=1&_t=ZS-96nUEtrj41n" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bg-white text-black hover:bg-gray-200 px-6 py-3 rounded-full font-bold flex items-center gap-2 transition-transform hover:scale-105 active:scale-95"
                    >
                        Follow Akun TikTok Developer <ExternalLink className="w-4 h-4" />
                    </a>
                </div>
            </div>
            
            <div className="mt-8 text-sm text-gray-500 max-w-sm text-center">
                Dibuat dengan ❤️ oleh Andrison untuk mempermudah teman-teman menonton anime kesukaan.
            </div>
        </div>
    );
}
