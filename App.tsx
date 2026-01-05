
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  Play, 
  ThumbsUp, 
  Info,
  Youtube,
  Zap,
  LayoutGrid,
  Users,
  Eye,
  Video,
  ExternalLink,
  ChevronDown,
  Bell,
  Heart,
  LogIn,
  User,
  ArrowUpRight,
  Monitor,
  Menu,
  X as CloseIcon
} from 'lucide-react';
import { YouTubeChannel, YouTubeVideo, TabType } from './types';
import { YouTubeService } from './services/youtubeService';
import { formatCount } from './components/Formatters';
import { VideoCard } from './components/VideoCard';
import { VideoModal } from './components/VideoModal';

const YOUTUBE_API_KEY = "AIzaSyBS-Wa-CrRby-6yz7mqHtCu4-kSetzhsGA"; 
const PERSONAL_CHANNEL_ID = 'UCrZ9NaztjEVJXLtWENlvAJA';

export default function App() {
  const [channel, setChannel] = useState<YouTubeChannel | null>(null);
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Auth State
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);

  const service = useMemo(() => {
    const s = new YouTubeService(YOUTUBE_API_KEY);
    s.setAccessToken(accessToken);
    return s;
  }, [accessToken]);

  const loadChannelData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [details, vids] = await Promise.all([
        service.getChannelDetails(PERSONAL_CHANNEL_ID),
        service.getVideos(PERSONAL_CHANNEL_ID, 50)
      ]);
      setChannel(details);
      setVideos(vids);
    } catch (err: any) {
      console.error("Fetch error:", err);
      setError('Failed to sync with YouTube. Check API Key or Channel ID.');
    } finally {
      setLoading(false);
    }
  }, [service]);

  useEffect(() => {
    loadChannelData();
  }, [loadChannelData]);

  // Unified Reveal Animation Logic
  useEffect(() => {
    if (loading) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.1 });

    // Select all reveal elements including newly rendered ones
    const elements = document.querySelectorAll('.reveal');
    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, [loading, activeTab, videos]);

  const handleGoogleLogin = () => {
    // Note: redirect_uri_mismatch is caused by the domain not being in the Google Cloud Console list.
    // For this environment, we attempt a clean login but provide feedback.
    try {
      const client = (window as any).google?.accounts?.oauth2?.initTokenClient({
        client_id: '1018368080946-t236rel6stk4m93cvjhpb8cikp1dstvd.apps.googleusercontent.com',
        scope: 'https://www.googleapis.com/auth/youtube.force-ssl',
        callback: (tokenResponse: any) => {
          if (tokenResponse?.access_token) {
            setAccessToken(tokenResponse.access_token);
            fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
            }).then(res => res.json()).then(setUserData);
          }
        },
        error_callback: (err: any) => {
          console.error("Login Error:", err);
          alert("Login Failed: Likely a redirect_uri_mismatch. The current domain must be authorized in Google Cloud Console.");
        }
      });
      client ? client.requestAccessToken() : alert("Google Identity script not loaded.");
    } catch (e) {
      alert("Social features unavailable in this session.");
    }
  };

  const handleSubscribe = async () => {
    if (!accessToken) return handleGoogleLogin();
    try {
      await service.subscribe(PERSONAL_CHANNEL_ID);
      setIsSubscribed(true);
    } catch (e: any) { 
      alert("Action failed: Ensure your Google Account is authorized for YouTube API operations."); 
    }
  };

  const filteredVideos = useMemo(() => {
    if (activeTab === 'shorts') return videos.filter(v => v.isShort);
    if (activeTab === 'videos') return videos.filter(v => !v.isShort);
    return videos;
  }, [videos, activeTab]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Editorial Navigation */}
      <nav className="fixed top-0 z-[100] w-full px-4 sm:px-8 py-6 backdrop-blur-md bg-black/20">
        <div className="flex items-center justify-between mx-auto max-w-[1600px]">
          <div className="flex items-center gap-4 sm:gap-6">
            <span className="font-display text-xl sm:text-2xl font-black uppercase tracking-tighter cursor-pointer" onClick={() => window.scrollTo({top:0, behavior:'smooth'})}>
              {channel?.title?.split(' ')[0] || 'Studio'} <span className="text-[#ccff00]">.</span>
            </span>
            <div className="hidden h-8 w-px bg-white/10 md:block"></div>
            <span className="hidden text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-500 md:block">
              Digital Portfolio // v1.0
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {userData ? (
              <div className="flex items-center gap-2 sm:gap-3 rounded-full border border-white/10 bg-white/5 p-1 pr-3 sm:pr-4">
                <img src={userData.picture} className="h-6 w-6 sm:h-8 sm:h-8 rounded-full" alt="Profile" />
                <span className="text-[10px] sm:text-xs font-bold truncate max-w-[80px] sm:max-w-[120px]">{userData.name}</span>
              </div>
            ) : (
              <button onClick={handleGoogleLogin} className="group flex items-center gap-2 text-[10px] sm:text-xs font-black uppercase tracking-widest hover:text-[#ccff00] transition-colors">
                Connect <LogIn size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            )}
            <button 
              onClick={handleSubscribe}
              className={`rounded-full px-5 sm:px-8 py-2 sm:py-2.5 text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all ${
                isSubscribed ? 'bg-white/10 text-neutral-400' : 'btn-lime'
              }`}
            >
              {isSubscribed ? 'Subscribed' : 'Follow'}
            </button>
          </div>
        </div>
      </nav>

      {/* Modern Split Hero */}
      <header className="relative flex min-h-screen items-center px-4 sm:px-8 md:px-20 pt-20">
        <div className="grid w-full gap-10 lg:gap-20 lg:grid-cols-12 max-w-[1600px] mx-auto">
          <div className="flex flex-col justify-center lg:col-span-7 z-10">
            <div className="reveal active flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-[#ccff00]">
              <span className="h-px w-8 sm:w-12 bg-[#ccff00]"></span>
              Professional Creator
            </div>
            <h1 className="reveal active mt-6 sm:mt-10 font-display text-5xl sm:text-7xl md:text-8xl lg:text-[10rem] font-black uppercase leading-[0.9] tracking-tighter">
              {channel?.title.split(' ')[0] || 'Creative'} <br/>
              <span className="font-serif italic text-white/30">{channel?.title.split(' ').slice(1).join(' ') || 'Studio'}</span>
            </h1>
            <p className="reveal active mt-6 sm:mt-10 max-w-lg text-sm sm:text-lg font-medium leading-relaxed text-neutral-400">
              Directing digital narratives and crafting high-impact visual content. Browse my collection of <span className="text-white">{channel?.statistics.videoCount}</span> curated productions.
            </p>
            <div className="reveal active mt-8 sm:mt-12 flex flex-wrap gap-4 sm:gap-6">
              <button onClick={() => document.getElementById('work')?.scrollIntoView({behavior:'smooth'})} className="btn-lime px-8 sm:px-10 py-4 sm:py-5 rounded-none flex items-center gap-4 text-xs sm:text-base">
                Explore Work <ArrowUpRight size={20} />
              </button>
              <a href={`https://youtube.com/channel/${PERSONAL_CHANNEL_ID}`} target="_blank" className="flex items-center gap-4 px-8 py-4 sm:py-5 text-xs sm:text-base font-black border border-white/10 hover:bg-white/5 transition-colors">
                YouTube <Youtube size={20} />
              </a>
            </div>
          </div>

          <div className="reveal active relative flex items-center justify-center lg:col-span-5 order-first lg:order-last">
             <div className="relative aspect-[4/5] sm:aspect-[3/4] w-full max-w-md overflow-hidden bg-neutral-900 group">
                <div className="absolute inset-0 z-0 scale-110 blur-[100px] opacity-20 bg-gradient-to-br from-[#ccff00] to-red-500 animate-pulse"></div>
                {channel?.bannerImageUrl ? (
                    <img src={channel.bannerImageUrl} className="relative z-10 h-full w-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000" alt="Banner" />
                ) : (
                    <div className="h-full w-full bg-neutral-800" />
                )}
                <div className="absolute inset-0 z-20 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                <div className="absolute bottom-6 left-6 sm:bottom-10 sm:left-10 z-30">
                  <div className="font-display text-3xl sm:text-4xl font-black uppercase tracking-tighter leading-none">
                    Studio <br/> Profile
                  </div>
                </div>
             </div>
          </div>
        </div>
      </header>

      {/* Floating Stats Bar */}
      <div className="sticky top-24 z-40 mx-auto max-w-fit reveal mt-[-2rem] mb-20 px-4">
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12 rounded-2xl sm:rounded-full border border-white/5 bg-black/60 px-6 sm:px-12 py-4 sm:py-5 backdrop-blur-2xl">
          <Stat icon={<Users size={16}/>} label="Audience" value={formatCount(channel?.statistics.subscriberCount)} />
          <div className="hidden sm:block h-4 w-px bg-white/10"></div>
          <Stat icon={<Eye size={16}/>} label="Reach" value={formatCount(channel?.statistics.viewCount)} />
          <div className="hidden sm:block h-4 w-px bg-white/10"></div>
          <Stat icon={<Monitor size={16}/>} label="Assets" value={channel?.statistics.videoCount} />
        </div>
      </div>

      {/* Content Gallery */}
      <section id="work" className="px-4 sm:px-8 md:px-20 py-20 sm:py-32 bg-[#080808]">
        <div className="flex flex-col items-start lg:items-end justify-between gap-10 border-b border-white/5 pb-12 sm:pb-20 lg:flex-row max-w-[1600px] mx-auto">
          <div className="space-y-4">
            <h2 className="reveal font-display text-4xl sm:text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none">
              Featured <br/> <span className="text-[#ccff00]">Productions</span>
            </h2>
            <p className="reveal text-neutral-500 text-xs sm:text-sm font-bold tracking-[0.2em] uppercase">Curated Gallery // {filteredVideos.length} Items</p>
          </div>
          
          <div className="reveal flex flex-wrap gap-2 sm:gap-4 bg-white/5 p-1 rounded-sm">
            <TabBtn active={activeTab === 'home'} label="Mosaic" onClick={() => setActiveTab('home')} icon={<LayoutGrid size={14}/>}/>
            <TabBtn active={activeTab === 'videos'} label="Featured" onClick={() => setActiveTab('videos')} icon={<Play size={14}/>}/>
            <TabBtn active={activeTab === 'shorts'} label="Quick Cuts" onClick={() => setActiveTab('shorts')} icon={<Zap size={14}/>}/>
            <TabBtn active={activeTab === 'about'} label="Manifesto" onClick={() => setActiveTab('about')} icon={<Info size={14}/>}/>
          </div>
        </div>

        <div className="mt-12 sm:mt-20 max-w-[1600px] mx-auto min-h-[400px]">
          {loading ? (
             <div className="flex h-64 items-center justify-center">
               <div className="h-10 w-10 border-4 border-[#ccff00] border-t-transparent animate-spin rounded-full"></div>
             </div>
          ) : activeTab === 'about' ? (
             <div className="reveal grid gap-10 lg:gap-20 lg:grid-cols-2">
                <div className="font-serif text-3xl sm:text-4xl md:text-6xl italic leading-tight text-white/60">
                  "{channel?.description?.slice(0, 100)}..."
                </div>
                <div className="space-y-8 sm:space-y-12">
                   <p className="text-base sm:text-xl leading-relaxed text-neutral-400">
                     {channel?.description}
                   </p>
                   <div className="grid grid-cols-2 gap-8 pt-10 border-t border-white/5">
                      <div className="space-y-2">
                         <span className="text-[10px] font-black uppercase tracking-widest text-neutral-600">Active Since</span>
                         <p className="text-lg sm:text-xl font-bold">{new Date(channel?.publishedAt || '').getFullYear()}</p>
                      </div>
                      <div className="space-y-2">
                         <span className="text-[10px] font-black uppercase tracking-widest text-neutral-600">Region</span>
                         <p className="text-lg sm:text-xl font-bold">Global Presence</p>
                      </div>
                   </div>
                </div>
             </div>
          ) : (
            <div className={`grid gap-x-6 sm:gap-x-12 gap-y-12 sm:gap-y-20 ${activeTab === 'shorts' ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
              {filteredVideos.length > 0 ? filteredVideos.map((video, idx) => (
                <div key={`${video.id}-${activeTab}`} className="reveal opacity-0" style={{transitionDelay: `${(idx % 6) * 100}ms`}}>
                  <VideoCard video={video} onClick={setSelectedVideo} />
                </div>
              )) : (
                <div className="col-span-full py-20 text-center text-neutral-600 uppercase font-black tracking-widest">
                  No productions found in this category
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Video Modal Interface */}
      <VideoModal 
        video={selectedVideo} 
        onClose={() => setSelectedVideo(null)} 
        service={service}
        accessToken={accessToken}
        onLogin={handleGoogleLogin}
      />

      <footer className="border-t border-white/5 px-4 sm:px-8 md:px-20 py-16 sm:py-20 bg-black">
        <div className="flex flex-col items-center justify-between gap-10 lg:flex-row max-w-[1600px] mx-auto">
           <div className="font-display text-xl sm:text-2xl font-black uppercase tracking-tighter">
             {channel?.title || 'Studio'} <span className="text-[#ccff00]">©</span>
           </div>
           <div className="flex gap-8 sm:gap-12 text-[10px] font-black uppercase tracking-widest text-neutral-500">
             <a href="#" className="hover:text-white transition-colors">Social</a>
             <a href={`https://youtube.com/channel/${PERSONAL_CHANNEL_ID}`} target="_blank" className="hover:text-[#ccff00] transition-colors">YouTube</a>
             <a href="#" className="hover:text-white transition-colors">Connect</a>
           </div>
           <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-700 text-center">
             Built with YouTube API v3 // Optimized for Creative Professionals
           </p>
        </div>
      </footer>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode, label: string, value: any }) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-[#ccff00] shrink-0">{icon}</div>
      <div className="flex flex-col">
        <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-neutral-500 leading-none mb-1">{label}</span>
        <span className="text-xs sm:text-sm font-black text-white">{value || '...'}</span>
      </div>
    </div>
  );
}

function TabBtn({ active, label, onClick, icon }: { active: boolean, label: string, onClick: () => void, icon: React.ReactNode }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 sm:gap-3 rounded-none border border-transparent px-4 sm:px-8 py-3 sm:py-4 text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${
        active ? 'bg-[#ccff00] text-black' : 'text-neutral-500 hover:text-white hover:bg-white/5'
      }`}
    >
      {icon} {label}
    </button>
  );
}
