
import React, { useEffect, useState } from 'react';
import { YouTubeVideo, YouTubeComment } from '../types';
import { formatCount, formatDate } from './Formatters';
import { X, ThumbsUp, MessageSquare, Share2, Send, LogIn, ArrowUpRight } from 'lucide-react';
import { YouTubeService } from '../services/youtubeService';

interface VideoModalProps {
  video: YouTubeVideo | null;
  onClose: () => void;
  service: YouTubeService;
  accessToken: string | null;
  onLogin: () => void;
}

export const VideoModal: React.FC<VideoModalProps> = ({ video, onClose, service, accessToken, onLogin }) => {
  const [comments, setComments] = useState<YouTubeComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [hasLiked, setHasLiked] = useState(false);

  useEffect(() => {
    if (video) {
      setLoading(true);
      service.getVideoComments(video.id)
        .then(setComments)
        .catch(console.error)
        .finally(() => setLoading(false));
      setHasLiked(false);
      setNewComment("");
    }
  }, [video, service]);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return onLogin();
    if (!newComment.trim() || !video) return;
    try {
        await service.postComment(video.id, newComment);
        setNewComment("");
        const updated = await service.getVideoComments(video.id);
        setComments(updated);
    } catch (e) { alert("Comment failed."); }
  };

  const handleLike = async () => {
    if (!accessToken) return onLogin();
    if (!video) return;
    try {
        await service.rateVideo(video.id, hasLiked ? 'none' : 'like');
        setHasLiked(!hasLiked);
    } catch (e) { alert("Action restricted."); }
  };

  if (!video) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/98 p-0 md:p-12 animate-in fade-in duration-500">
      <div className="relative flex h-full w-full max-w-[1600px] flex-col overflow-hidden border border-white/10 bg-[#0a0a0a] lg:flex-row">
        
        {/* Playback Section */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="relative aspect-video w-full bg-black border-b border-white/10">
            <iframe
              className="h-full w-full"
              src={`https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0&modestbranding=1`}
              title={video.title}
              frameBorder="0"
              allowFullScreen
            ></iframe>
          </div>

          <div className="p-12">
            <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-[#ccff00] mb-6">
                    <span className="h-px w-8 bg-[#ccff00]"></span>
                    Studio Master Release
                </div>
                <h1 className="font-display text-4xl font-black uppercase tracking-tighter md:text-6xl">{video.title}</h1>
              </div>

              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={handleLike}
                  className={`flex items-center gap-3 border px-8 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${
                    hasLiked ? 'bg-[#ccff00] border-[#ccff00] text-black' : 'border-white/10 text-white hover:bg-white/5'
                  }`}
                >
                  <ThumbsUp size={16} fill={hasLiked ? "black" : "none"} />
                  {formatCount(video.likeCount)}
                </button>
                <button className="flex items-center gap-3 border border-white/10 px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/5">
                  <Share2 size={16} /> Share
                </button>
                <a 
                  href={`https://youtu.be/${video.id}`} target="_blank"
                  className="bg-white px-8 py-4 text-[10px] font-black uppercase tracking-widest text-black flex items-center gap-3 hover:bg-neutral-200"
                >
                  Project Link <ArrowUpRight size={16} />
                </a>
              </div>
            </div>

            <div className="mt-20 grid gap-20 lg:grid-cols-12">
               <div className="lg:col-span-8">
                  <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-600 mb-10">Production Notes</h2>
                  <p className="text-xl font-medium leading-relaxed text-neutral-400">
                    {video.description}
                  </p>
               </div>
               <div className="lg:col-span-4 space-y-12">
                  <div className="space-y-4">
                     <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-600">Metric Breakdown</h2>
                     <div className="grid grid-cols-2 gap-px bg-white/5 border border-white/5">
                        <div className="p-6 bg-[#0a0a0a]">
                           <span className="block text-[9px] font-black text-neutral-600 uppercase mb-2">Impressions</span>
                           <span className="text-xl font-black">{formatCount(video.viewCount)}</span>
                        </div>
                        <div className="p-6 bg-[#0a0a0a]">
                           <span className="block text-[9px] font-black text-neutral-600 uppercase mb-2">Date</span>
                           <span className="text-xl font-black">{new Date(video.publishedAt).toLocaleDateString()}</span>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Interaction Sidebar */}
        <div className="hidden w-[450px] flex-col border-l border-white/10 bg-[#080808] lg:flex">
          <div className="p-10 border-b border-white/10">
            <h2 className="font-display text-2xl font-black uppercase tracking-tighter">Feedback Loop</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-12">
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <div className="h-8 w-8 animate-spin border-2 border-[#ccff00] border-t-transparent rounded-full"></div>
              </div>
            ) : (
              <>
                {comments.length > 0 ? comments.map(comment => (
                  <div key={comment.id} className="space-y-4">
                    <div className="flex items-center gap-3">
                      <img src={comment.authorProfileImageUrl} className="h-8 w-8 rounded-none border border-white/10" />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase text-white">{comment.authorName}</span>
                        <span className="text-[8px] font-bold uppercase text-neutral-600">{formatDate(comment.publishedAt)}</span>
                      </div>
                    </div>
                    <p className="text-sm font-medium leading-relaxed text-neutral-400 pl-11" dangerouslySetInnerHTML={{ __html: comment.textDisplay }}></p>
                  </div>
                )) : (
                   <div className="flex flex-col items-center justify-center h-64 text-center opacity-20">
                     <MessageSquare size={40} className="mb-4" />
                     <p className="text-[10px] font-black uppercase tracking-widest">Awaiting Discussion</p>
                   </div>
                )}
              </>
            )}
          </div>

          <div className="p-10 border-t border-white/10 bg-[#0a0a0a]">
            {!accessToken ? (
                <button 
                  onClick={onLogin}
                  className="w-full border border-white/10 py-6 text-[10px] font-black uppercase tracking-widest hover:bg-[#ccff00] hover:text-black transition-all"
                >
                    Connect Google Identity
                </button>
            ) : (
                <form onSubmit={handlePostComment} className="relative">
                    <textarea 
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Contribute to the project..."
                        className="w-full bg-white/5 border border-white/10 p-6 text-sm font-medium outline-none transition-all focus:border-[#ccff00] h-32 resize-none"
                    />
                    <button 
                        type="submit"
                        disabled={!newComment.trim()}
                        className="absolute bottom-6 right-6 h-10 w-10 flex items-center justify-center bg-[#ccff00] text-black transition-all hover:scale-105 active:scale-95 disabled:opacity-20"
                    >
                        <Send size={18} />
                    </button>
                </form>
            )}
          </div>
        </div>

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute right-10 top-10 z-[1100] h-14 w-14 bg-white text-black flex items-center justify-center hover:bg-[#ccff00] transition-colors"
        >
          <X size={24} />
        </button>
      </div>
    </div>
  );
};
