
import React, { useEffect, useState } from 'react';
import { YouTubeVideo, YouTubeComment } from '../types';
import { formatCount, formatDate } from './Formatters';
import { X, ThumbsUp, MessageSquare, Share2, Youtube, Send, LogIn } from 'lucide-react';
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
  const [isLiking, setIsLiking] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);

  useEffect(() => {
    if (video) {
      setLoading(true);
      service.getVideoComments(video.id)
        .then(setComments)
        .catch(console.error)
        .finally(() => setLoading(false));
      
      // Reset interaction states
      setHasLiked(false);
      setNewComment("");
    }
  }, [video, service]);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) {
        onLogin();
        return;
    }
    if (!newComment.trim() || !video) return;

    try {
        await service.postComment(video.id, newComment);
        setNewComment("");
        // Optimistic update or refresh
        const updated = await service.getVideoComments(video.id);
        setComments(updated);
        alert("Comment posted successfully!");
    } catch (e) {
        alert("Failed to post comment. Check permissions.");
    }
  };

  const handleLike = async () => {
    if (!accessToken) {
        onLogin();
        return;
    }
    if (!video || isLiking) return;
    setIsLiking(true);
    try {
        await service.rateVideo(video.id, hasLiked ? 'none' : 'like');
        setHasLiked(!hasLiked);
    } catch (e) {
        alert("Action failed. Sync with Google to enable real likes.");
    } finally {
        setIsLiking(false);
    }
  };

  if (!video) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/98 p-4 backdrop-blur-2xl animate-in fade-in duration-300">
      <div className="relative flex h-full max-h-[96vh] w-full max-w-[1500px] flex-col overflow-hidden rounded-[3rem] border border-white/5 bg-[#080808] shadow-2xl lg:flex-row">
        
        {/* Playback Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="relative aspect-video w-full bg-black">
            <iframe
              className="h-full w-full"
              src={`https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0&modestbranding=1`}
              title={video.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>

          <div className="p-10">
            <h1 className="text-4xl font-black tracking-tighter text-white">{video.title}</h1>
            
            <div className="mt-10 flex flex-wrap items-center justify-between gap-8">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-red-600 to-red-800 text-white shadow-xl">
                  <Youtube size={28} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Official Video</h3>
                  <div className="flex items-center gap-2 text-sm text-neutral-500">
                    <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse"></span>
                    Portfolio Showcase
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={handleLike}
                  disabled={isLiking}
                  className={`flex items-center gap-2 rounded-2xl px-6 py-3.5 border transition-all ${
                    hasLiked 
                    ? 'bg-red-600 border-red-500 text-white' 
                    : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                  }`}
                >
                  <ThumbsUp size={20} className={hasLiked ? "fill-white" : ""} />
                  <span className="font-black">{formatCount(video.likeCount)}</span>
                </button>
                <button className="flex items-center gap-2 rounded-2xl bg-white/5 px-6 py-3.5 text-white hover:bg-white/10 transition-colors border border-white/10">
                  <Share2 size={20} />
                  <span className="hidden sm:inline font-bold">Share</span>
                </button>
                <a 
                  href={`https://youtu.be/${video.id}`}
                  target="_blank"
                  className="flex items-center justify-center rounded-2xl bg-white p-3.5 text-black hover:bg-neutral-200 transition-colors font-black px-8"
                >
                  Open in YouTube
                </a>
              </div>
            </div>

            <div className="mt-10 rounded-[2.5rem] border border-white/5 bg-white/5 p-8">
              <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-6">
                <span className="bg-white/10 px-3 py-1 rounded-lg">{formatCount(video.viewCount)} Impressions</span>
                <span className="bg-white/10 px-3 py-1 rounded-lg">Premiered {formatDate(video.publishedAt)}</span>
              </div>
              <p className="whitespace-pre-wrap text-base leading-relaxed text-neutral-300">
                {video.description}
              </p>
            </div>
          </div>
        </div>

        {/* Community Panel */}
        <div className="hidden w-[420px] flex-col border-l border-white/5 bg-[#050505] lg:flex">
          <div className="p-8 border-b border-white/5">
            <h2 className="flex items-center gap-3 font-black text-white uppercase tracking-tighter text-xl">
              <MessageSquare size={22} className="text-red-600" />
              Community Feedback
            </h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-red-600 border-t-transparent"></div>
              </div>
            ) : (
              <>
                {comments.length > 0 ? comments.map(comment => (
                  <div key={comment.id} className="group">
                    <div className="flex gap-4">
                      <img src={comment.authorProfileImageUrl} className="h-11 w-11 rounded-xl border border-white/10 shadow-lg" />
                      <div className="flex flex-col gap-1.5 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-white">{comment.authorName}</span>
                          <span className="text-[10px] text-neutral-600 font-bold">{formatDate(comment.publishedAt)}</span>
                        </div>
                        <p className="text-sm leading-relaxed text-neutral-400 group-hover:text-neutral-200 transition-colors" dangerouslySetInnerHTML={{ __html: comment.textDisplay }}></p>
                        <div className="mt-2 flex items-center gap-4 text-neutral-600">
                          <button className="flex items-center gap-1 hover:text-red-500 transition-colors">
                            <ThumbsUp size={14} />
                            <span className="text-[10px] font-black">{formatCount(comment.likeCount)}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )) : (
                   <div className="flex flex-col items-center justify-center h-64 text-center opacity-40">
                     <MessageSquare size={48} className="mb-4" />
                     <p className="text-sm font-black uppercase tracking-widest">Discussion Empty</p>
                   </div>
                )}
              </>
            )}
          </div>

          {/* Comment Input */}
          <div className="p-8 border-t border-white/5 bg-[#080808]">
            {!accessToken ? (
                <button 
                  onClick={onLogin}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl bg-white/5 border border-white/10 p-5 text-sm font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                >
                    <LogIn size={18}/> Sign In to Comment
                </button>
            ) : (
                <form onSubmit={handlePostComment} className="relative">
                    <textarea 
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Join the discussion..."
                        className="w-full rounded-[1.5rem] bg-white/5 border border-white/10 p-5 text-sm font-medium outline-none transition-all focus:border-red-600 focus:bg-white/10 custom-scrollbar h-32 resize-none"
                    />
                    <button 
                        type="submit"
                        disabled={!newComment.trim()}
                        className="absolute bottom-4 right-4 h-10 w-10 flex items-center justify-center rounded-xl bg-red-600 text-white shadow-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                    >
                        <Send size={18} />
                    </button>
                </form>
            )}
          </div>
        </div>

        {/* Dismiss Button */}
        <button 
          onClick={onClose}
          className="absolute right-8 top-8 z-[110] rounded-2xl bg-white/5 p-3 text-white backdrop-blur-3xl border border-white/10 hover:bg-red-600 transition-all active:scale-95 group"
        >
          <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
        </button>
      </div>
    </div>
  );
};
