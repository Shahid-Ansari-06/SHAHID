
import React from 'react';
import { YouTubeVideo } from '../types';
import { formatCount, formatDate } from './Formatters';
// Add missing Eye import from lucide-react
import { Play, TrendingUp, Eye } from 'lucide-react';

interface VideoCardProps {
  video: YouTubeVideo;
  onClick: (video: YouTubeVideo) => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({ video, onClick }) => {
  if (video.isShort) {
    return (
      <div 
        onClick={() => onClick(video)}
        className="group relative cursor-pointer overflow-hidden rounded-[2rem] bg-neutral-900 transition-all duration-500 hover:-translate-y-4 hover:shadow-[0_20px_50px_rgba(220,38,38,0.2)]"
      >
        <div className="aspect-[9/16] overflow-hidden">
          <img 
            src={video.thumbnail} 
            alt={video.title}
            className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110 group-hover:rotate-1"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-500 group-hover:opacity-100">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-600/80 text-white backdrop-blur-xl shadow-2xl">
              <Play fill="white" size={24} />
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 w-full p-6">
          <h3 className="line-clamp-2 text-base font-black tracking-tight text-white drop-shadow-2xl">
            {video.title}
          </h3>
          <div className="mt-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-red-500">
            <TrendingUp size={12} /> {formatCount(video.viewCount)} Impressions
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={() => onClick(video)}
      className="group cursor-pointer space-y-6"
    >
      <div className="relative aspect-video overflow-hidden rounded-[2.5rem] border-4 border-white/5 bg-neutral-900 shadow-2xl transition-all duration-700 group-hover:border-red-600/40 group-hover:shadow-[0_20px_60px_rgba(220,38,38,0.15)]">
        <img 
          src={video.thumbnail} 
          alt={video.title}
          className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        
        <div className="absolute bottom-4 right-4 rounded-xl bg-black/60 px-3 py-1.5 text-[10px] font-black tracking-[0.2em] text-white backdrop-blur-2xl border border-white/10">
          {video.duration?.replace('PT', '').replace('H', ':').replace('M', ':').replace('S', '')}
        </div>

        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-700 group-hover:opacity-100">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-black shadow-2xl scale-50 transition-transform duration-500 group-hover:scale-100">
            <Play fill="black" size={32} />
          </div>
        </div>
      </div>

      <div className="px-2">
        <h3 className="line-clamp-2 text-2xl font-black leading-tight text-white transition-colors duration-300 group-hover:text-red-500">
          {video.title}
        </h3>
        <div className="mt-4 flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">
          <div className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5">
             <Eye size={12} /> {formatCount(video.viewCount)}
          </div>
          <span className="h-1.5 w-1.5 rounded-full bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.8)]"></span>
          <span className="opacity-60">{formatDate(video.publishedAt)}</span>
        </div>
      </div>
    </div>
  );
};
