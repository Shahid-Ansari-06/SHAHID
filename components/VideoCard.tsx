
import React from 'react';
import { YouTubeVideo } from '../types';
import { formatCount, formatDate } from './Formatters';
import { ArrowUpRight, Play } from 'lucide-react';

interface VideoCardProps {
  video: YouTubeVideo;
  onClick: (video: YouTubeVideo) => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({ video, onClick }) => {
  if (video.isShort) {
    return (
      <div 
        onClick={() => onClick(video)}
        className="group relative cursor-pointer overflow-hidden border border-white/5 bg-neutral-900 transition-all duration-500"
      >
        <div className="aspect-[9/16] overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700">
          <img 
            src={video.thumbnail} 
            alt={video.title}
            className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
             <div className="h-16 w-16 rounded-full border border-[#ccff00] flex items-center justify-center text-[#ccff00]">
                <Play fill="currentColor" size={24} />
             </div>
          </div>
        </div>
        <div className="p-4 bg-black">
          <h3 className="line-clamp-2 text-xs font-black uppercase tracking-tight leading-snug">
            {video.title}
          </h3>
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={() => onClick(video)}
      className="group cursor-pointer space-y-6"
    >
      <div className="relative aspect-video overflow-hidden border border-white/10 bg-neutral-900 transition-all duration-700 group-hover:border-[#ccff00]/50">
        <img 
          src={video.thumbnail} 
          alt={video.title}
          className="h-full w-full object-cover grayscale opacity-80 transition-all duration-700 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
        <div className="absolute bottom-4 left-4">
           <div className="rounded-none bg-[#ccff00] px-3 py-1 text-[9px] font-black uppercase tracking-widest text-black">
              {formatCount(video.viewCount)} Reach
           </div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
           <div className="h-20 w-20 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white scale-75 group-hover:scale-100 transition-transform">
              <Play fill="white" size={28} />
           </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <h3 className="line-clamp-2 font-display text-2xl font-black uppercase leading-[0.9] tracking-tighter group-hover:text-[#ccff00] transition-colors">
            {video.title}
          </h3>
          <ArrowUpRight className="shrink-0 text-white/20 group-hover:text-[#ccff00] group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" size={24} />
        </div>
        <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-[0.2em] text-neutral-500">
           <span>Published // {formatDate(video.publishedAt)}</span>
           <span className="h-1 w-1 bg-[#ccff00] rounded-full"></span>
           <span className="text-white">Studio Archive</span>
        </div>
      </div>
    </div>
  );
};
