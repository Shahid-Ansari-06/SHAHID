
import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  LogOut,
  User
} from 'lucide-react';
import { YouTubeChannel, YouTubeVideo, TabType } from './types';
import { YouTubeService } from './services/youtubeService';
import { formatCount } from './components/Formatters';
import { VideoCard } from './components/VideoCard';
import { VideoModal } from './components/VideoModal';

// Using the provided API Key
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
  const [scrolled, setScrolled] = useState(false);
  
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
      setError(err.message || 'Failed to load portfolio. Please check your API configuration.');
    } finally {
      setLoading(false);
    }
  }, [service]);

  useEffect(() => {
    loadChannelData();
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadChannelData]);

  // Handle Google Login
  const handleGoogleLogin = () => {
    // Note: In a real production app, client_id must be registered for the domain.
    // For this environment, we provide the logic flow.
    const client = (window as any).google?.accounts?.oauth2?.initTokenClient({
      client_id: '1018368080946-t236rel6stk4m93cvjhpb8cikp1dstvd.apps.googleusercontent.com', // Placeholder
      scope: 'https://www.googleapis.com/auth/youtube.force-ssl',
      callback: (tokenResponse: any) => {
        if (tokenResponse && tokenResponse.access_token) {
          setAccessToken(tokenResponse.access_token);
          // Fetch user info for UI
          fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
          })
          .then(res => res.json())
          .then(setUserData);
        }
      },
    });
    
    if (client) {
        client.requestAccessToken();
    } else {
        alert("Interactions are currently in 'Preview Mode'. Connect a valid Google Client ID to enable real interactions.");
        // Mocking login for UI demo
        setAccessToken("MOCK_TOKEN");
        setUserData({ name: "Demo User", picture: null });
    }
  };

  const handleLogout = () => {
    setAccessToken(null);
    setUserData(null);
  };

  const handleSubscribe = async () => {
    if (!accessToken) {
        handleGoogleLogin();
        return;
    }
    try {
        await service.subscribe(PERSONAL_CHANNEL_ID);
        setIsSubscribed(true);
        alert("Subscribed successfully!");
    } catch (e: any) {
        console.error(e);
        alert(e.message || "Subscription failed. Check permissions.");
    }
  };

  const filteredVideos = useMemo(() => {
    if (activeTab === 'shorts') return videos.filter(v => v.isShort);
    if (activeTab === 'videos') return videos.filter(v => !v.isShort);
    return videos;
  }, [videos, activeTab]);

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-red-500 selection:text-white">
      {/* Premium Navigation */}
      <nav className={`fixed top-0 z-50 w-full transition-all duration-500 ${scrolled ? 'bg-black/80 py-3 backdrop-blur-2xl border-b border-white/5' : 'bg-transparent py-8'}`}>
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-red-600 to-orange-600 shadow-2xl shadow-red-600/30">
              <Youtube size={28} fill="white" strokeWidth={0} />
            </div>
            <div className="hidden flex-col sm:flex">
              <span className="text-lg font-black tracking-tight leading-none uppercase">Creator</span>
              <span className="text-[10px] font-bold tracking-[0.2em] text-red-500 uppercase">Portfolio</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {userData ? (
              <div className="flex items-center gap-4">
                <div className="hidden flex-col items-end sm:flex">
                  <span className="text-sm font-bold">{userData.name}</span>
                  <button onClick={handleLogout} className="text-[10px] text-neutral-500 hover:text-red-500">Sign Out</button>
                </div>
                {userData.picture ? (
                  <img src={userData.picture} className="h-10 w-10 rounded-full border border-white/10" alt="Profile" />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-neutral-800 flex items-center justify-center"><User size={20}/></div>
                )}
              </div>
            ) : (
              <button 
                onClick={handleGoogleLogin}
                className="flex items-center gap-2 rounded-2xl bg-white/5 border border-white/10 px-6 py-2.5 text-sm font-bold hover:bg-white/10 transition-all"
              >
                <LogIn size={18} /> Sign In
              </button>
            )}
            
            <button 
              onClick={handleSubscribe}
              className={`flex items-center gap-2 rounded-2xl px-8 py-3 text-sm font-black uppercase tracking-widest transition-all active:scale-95 ${
                isSubscribed 
                ? 'bg-neutral-800 text-neutral-400 border border-white/5' 
                : 'bg-red-600 text-white shadow-xl shadow-red-600/20 hover:bg-red-500 hover:shadow-red-600/40'
              }`}
            >
              {isSubscribed ? <Bell size={18} /> : null}
              {isSubscribed ? 'Subscribed' : 'Subscribe'}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Header */}
      <header className="relative flex min-h-[90vh] w-full flex-col items-center justify-center overflow-hidden">
        {channel?.bannerImageUrl ? (
          <div className="absolute inset-0 z-0">
            <img 
              src={channel.bannerImageUrl} 
              className="h-full w-full object-cover opacity-40 brightness-50" 
              alt="Banner" 
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/70 to-[#050505]" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 to-[#050505]" />
        )}
        
        <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
          {channel && (
            <div className="animate-in fade-in zoom-in duration-1000 slide-in-from-top-10">
              <div className="relative mx-auto mb-8 h-44 w-44 md:h-52 md:w-52">
                <div className="absolute -inset-4 animate-pulse rounded-full bg-red-600/10 blur-3xl" />
                <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-red-600 to-orange-500 p-1 shadow-2xl">
                  <img 
                    src={channel.thumbnails.high.url} 
                    className="h-full w-full rounded-full border-4 border-[#050505] object-cover" 
                    alt={channel.title} 
                  />
                </div>
              </div>
              
              <h1 className="text-6xl font-black uppercase tracking-tighter md:text-8xl lg:text-9xl">
                {channel.title}
              </h1>
              <div className="mt-4 flex items-center justify-center gap-4">
                <p className="text-xl font-bold tracking-widest text-red-500 uppercase">{channel.handle}</p>
                <div className="h-1.5 w-1.5 rounded-full bg-white/20"></div>
                <span className="text-sm font-bold text-neutral-400 uppercase tracking-widest">Media Producer</span>
              </div>
              
              <div className="mt-12 flex flex-wrap justify-center gap-4">
                <HeroStat icon={<Users size={20}/>} label="Audience" value={formatCount(channel.statistics.subscriberCount)} />
                <HeroStat icon={<Eye size={20}/>} label="Reach" value={formatCount(channel.statistics.viewCount)} />
                <HeroStat icon={<Video size={20}/>} label="Projects" value={formatCount(channel.statistics.videoCount)} />
              </div>

              <div className="mt-12 flex flex-col items-center gap-6 sm:flex-row sm:justify-center">
                <button 
                  onClick={() => {
                    const el = document.getElementById('portfolio-grid');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="group flex items-center gap-3 rounded-2xl bg-white px-10 py-5 text-lg font-black text-black transition-all hover:scale-105 active:scale-95"
                >
                  <Play fill="black" size={24} /> View Gallery
                </button>
                <button 
                  onClick={handleSubscribe}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-10 py-5 text-lg font-black backdrop-blur-md transition-all hover:bg-white/10 active:scale-95"
                >
                  <Heart className="text-red-500" /> Support My Work
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-20">
          <ChevronDown size={32} />
        </div>
      </header>

      {/* Grid Content */}
      <section id="portfolio-grid" className="relative z-10 bg-[#050505] px-6 py-24">
        <div className="mx-auto max-w-[1400px]">
          {/* Navigation */}
          <div className="mb-16 flex flex-col items-center justify-between gap-8 lg:flex-row">
            <h2 className="text-4xl font-black uppercase tracking-tighter md:text-5xl">Digital Archive</h2>
            <div className="flex flex-wrap justify-center gap-2 rounded-[2rem] border border-white/5 bg-white/5 p-2 backdrop-blur-xl">
              <TabButton active={activeTab === 'home'} label="Collection" onClick={() => setActiveTab('home')} icon={<LayoutGrid size={18}/>} />
              <TabButton active={activeTab === 'videos'} label="Main Films" onClick={() => setActiveTab('videos')} icon={<Play size={18}/>} />
              <TabButton active={activeTab === 'shorts'} label="Short Form" onClick={() => setActiveTab('shorts')} icon={<Zap size={18}/>} />
              <TabButton active={activeTab === 'about'} label="Vision" onClick={() => setActiveTab('about')} icon={<Info size={18}/>} />
            </div>
          </div>

          {loading ? (
            <div className="flex h-96 flex-col items-center justify-center gap-4">
              <div className="h-14 w-14 animate-spin rounded-full border-4 border-red-600 border-t-transparent"></div>
              <p className="font-bold uppercase tracking-widest text-red-500 text-xs">Loading Studio Assets...</p>
            </div>
          ) : error ? (
            <div className="rounded-[3rem] border border-red-500/20 bg-red-500/5 p-16 text-center">
              <h2 className="text-2xl font-black uppercase">Initialization Error</h2>
              <p className="mt-2 text-neutral-400">{error}</p>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000">
              {activeTab === 'about' ? (
                <div className="grid gap-16 lg:grid-cols-12">
                  <div className="lg:col-span-8">
                    <h3 className="mb-6 text-3xl font-black uppercase">Creative Vision</h3>
                    <div className="rounded-[2.5rem] border border-white/5 bg-white/5 p-10 text-xl font-medium leading-relaxed text-neutral-300">
                      {channel?.description || "Visual artist and digital storyteller creating immersive video content."}
                    </div>
                  </div>
                  <div className="lg:col-span-4">
                    <h3 className="mb-6 text-3xl font-black uppercase">Presence</h3>
                    <div className="space-y-4">
                      <MetaInfo label="Active Since" value={new Date(channel?.publishedAt || '').getFullYear().toString()} />
                      <MetaInfo label="Verified" value="Yes" color="text-green-500" />
                      <MetaInfo label="Location" value="Global" />
                      <div className="mt-8 overflow-hidden rounded-[2.5rem] border border-white/5 bg-gradient-to-br from-red-600 to-orange-600 p-8 text-center shadow-2xl">
                        <p className="text-xs font-black uppercase tracking-widest text-white/80">Collaborations</p>
                        <button className="mt-4 w-full rounded-2xl bg-white py-4 font-black text-black transition-transform hover:scale-105 active:scale-95">
                          Reach Out
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className={`grid gap-x-8 gap-y-16 ${activeTab === 'shorts' ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
                  {filteredVideos.map(video => (
                    <VideoCard key={video.id} video={video} onClick={setSelectedVideo} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Video Interaction Modal */}
      <VideoModal 
        video={selectedVideo} 
        onClose={() => setSelectedVideo(null)} 
        service={service}
        accessToken={accessToken}
        onLogin={handleGoogleLogin}
      />

      <footer className="border-t border-white/5 py-20 text-center">
        <div className="mx-auto max-w-4xl px-6">
          <div className="mb-8 flex justify-center gap-6">
             <a href={`https://youtube.com/channel/${PERSONAL_CHANNEL_ID}`} target="_blank" className="text-neutral-500 hover:text-red-500 transition-colors">
               <Youtube size={28} />
             </a>
             <a href="#" className="text-neutral-500 hover:text-white transition-colors">
               <ExternalLink size={28} />
             </a>
          </div>
          <p className="text-sm font-black uppercase tracking-widest text-white/20">© 2024 {channel?.title} Portfolio</p>
        </div>
      </footer>
    </div>
  );
}

// Internal Helper Components
function HeroStat({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-white/5 bg-white/5 px-8 py-5 backdrop-blur-xl">
      <div className="mb-1 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-500">
        {icon} {label}
      </div>
      <div className="text-3xl font-black">{value}</div>
    </div>
  );
}

function TabButton({ active, label, onClick, icon }: { active: boolean, label: string, onClick: () => void, icon: React.ReactNode }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 rounded-[1.5rem] px-8 py-3 text-xs font-black uppercase tracking-widest transition-all ${
        active 
        ? 'bg-red-600 text-white shadow-xl shadow-red-600/20' 
        : 'text-neutral-500 hover:text-white hover:bg-white/5'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function MetaInfo({ label, value, color }: { label: string, value: string, color?: string }) {
  return (
    <div className="flex justify-between rounded-2xl border border-white/5 bg-white/5 p-5 backdrop-blur-md">
      <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">{label}</span>
      <span className={`text-xs font-black uppercase tracking-widest ${color || 'text-white'}`}>{value}</span>
    </div>
  );
}
