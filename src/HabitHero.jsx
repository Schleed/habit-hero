// src/HabitHero.jsx
import React, { useState, useEffect } from 'react';
import toast, { Toaster } from "react-hot-toast";
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  signInWithCustomToken
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  setDoc,
  deleteDoc,
  doc,
  query,
  onSnapshot,
  serverTimestamp,
  orderBy,
  arrayUnion,
} from 'firebase/firestore';
import {
  CheckCircle,
  Circle,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  Target,
  User,
  LogOut,
  TrendingUp,
  Clock,
  Menu,
  X,
  AlertCircle,
  Settings,
  Shield,
  ShoppingBag,
  Coins,
  Save,
  XCircle,
  Trophy,
  Activity,
  Zap,
  BookOpen,
  Heart,
  Palette,
  Users,
  Dumbbell,
  BarChart2,
  Map,
  Sword,
  Flame,
  LayoutGrid,
  Shirt,
  Footprints,
  Smile,
  Scroll,
  Mail,
  Medal,
  Star
} from 'lucide-react';

// ==========================================
// 1. PURE LOGIC & GAME DATA
// ==========================================

export const ATTRIBUTES = {
  str: { label: 'Strength', icon: <Dumbbell size={16} />, color: 'text-red-500', bg: 'bg-red-100', bar: 'bg-red-500' },
  int: { label: 'Intelligence', icon: <BookOpen size={16} />, color: 'text-blue-500', bg: 'bg-blue-100', bar: 'bg-blue-500' },
  vit: { label: 'Vitality', icon: <Heart size={16} />, color: 'text-green-500', bg: 'bg-green-100', bar: 'bg-green-500' },
  cre: { label: 'Creativity', icon: <Palette size={16} />, color: 'text-purple-500', bg: 'bg-purple-100', bar: 'bg-purple-500' },
  soc: { label: 'Social', icon: <Users size={16} />, color: 'text-amber-500', bg: 'bg-amber-100', bar: 'bg-amber-500' },
};

export const ACHIEVEMENTS = [
  { id: 'first_step', title: 'First Steps', desc: 'Reach Level 2', icon: <Footprints size={20}/>, condition: (p) => calculateLevel(p.xp) >= 2 },
  { id: 'rich', title: 'Coin Collector', desc: 'Hold 200 Gold', icon: <Coins size={20}/>, condition: (p) => p.coins >= 200 },
  { id: 'scholar', title: 'Scholar', desc: 'Reach 20 Intelligence', icon: <BookOpen size={20}/>, condition: (p) => (p.attributes?.int || 0) >= 20 },
  { id: 'warrior', title: 'Warrior', desc: 'Reach 20 Strength', icon: <Dumbbell size={20}/>, condition: (p) => (p.attributes?.str || 0) >= 20 },
  { id: 'socialite', title: 'Socialite', desc: 'Reach 20 Social', icon: <Users size={20}/>, condition: (p) => (p.attributes?.soc || 0) >= 20 },
  { id: 'fashion', title: 'Fashionista', desc: 'Own 5 Items', icon: <Shirt size={20}/>, condition: (p) => (p.inventory?.length || 0) >= 5 },
  { id: 'dedicated', title: 'Dedicated', desc: 'Reach Level 5', icon: <Medal size={20}/>, condition: (p) => calculateLevel(p.xp) >= 5 },
  { id: 'legend', title: 'Living Legend', desc: 'Reach Level 10', icon: <Trophy size={20}/>, condition: (p) => calculateLevel(p.xp) >= 10 },
];

export const SKIN_TONES = [
  '#FFDFC4', '#F0D5BE', '#EECEB3', '#E2B98F', '#E0AC69', '#D3A186', 
  '#AE7D60', '#8D5524', '#7B4B28', '#5E3C23', '#3C2E28'
];

export const HAIR_COLORS = [
  '#fef3c7', '#fcd34d', '#f97316', '#ef4444', '#b91c1c', '#713f12', 
  '#451a03', '#000000', '#525252', '#d1d5db', '#ffffff',
  '#f472b6', '#db2777', '#c084fc', '#7c3aed', '#60a5fa', '#2563eb', '#2dd4bf', '#4ade80',
];

export const ITEMS = {
  // --- HATS ---
  hat_none: { id: 'hat_none', name: 'No Hat', type: 'hat', cost: 0, path: null },
  hat_beanie: { id: 'hat_beanie', name: 'Blue Beanie', type: 'hat', cost: 50, color: '#3b82f6' },
  hat_cap: { id: 'hat_cap', name: 'Red Cap', type: 'hat', cost: 100, color: '#ef4444' },
  hat_cowboy: { id: 'hat_cowboy', name: 'Cowboy Hat', type: 'hat', cost: 150, color: '#78350f' },
  hat_headphones: { id: 'hat_headphones', name: 'Headphones', type: 'hat', cost: 200, color: '#1f2937' },
  hat_wizard: { id: 'hat_wizard', name: 'Wizard Hat', type: 'hat', cost: 300, color: '#8b5cf6', special: true },
  hat_viking: { id: 'hat_viking', name: 'Viking Helm', type: 'hat', cost: 450, exclusive: "Stage 5 Drop", color: '#94a3b8' },
  hat_crown: { id: 'hat_crown', name: 'Gold Crown', type: 'hat', cost: 500, color: '#fbbf24', special: true },
  hat_dragon: { id: 'hat_dragon', name: 'Dragon Helm', type: 'hat', cost: 0, exclusive: "Boss Drop", color: '#b91c1c' },

  // --- SHIRTS ---
  shirt_basic: { id: 'shirt_basic', name: 'Grey Tee', type: 'shirt', cost: 0, color: '#94a3b8' },
  shirt_blue: { id: 'shirt_blue', name: 'Blue Hoodie', type: 'shirt', cost: 50, color: '#3b82f6' },
  shirt_graphic: { id: 'shirt_graphic', name: 'Graphic Tee', type: 'shirt', cost: 120, color: '#171717' },
  shirt_suit: { id: 'shirt_suit', name: 'Business Suit', type: 'shirt', cost: 150, color: '#1e293b' },
  shirt_striped: { id: 'shirt_striped', name: 'Striped Polo', type: 'shirt', cost: 180, color: '#dc2626' },
  shirt_tuxedo: { id: 'shirt_tuxedo', name: 'Tuxedo', type: 'shirt', cost: 800, color: '#000000' },
  shirt_hero: { id: 'shirt_hero', name: 'Hero Suit', type: 'shirt', cost: 300, color: '#ef4444' },
  shirt_mage: { id: 'shirt_mage', name: 'Mage Robe', type: 'shirt', cost: 250, color: '#8b5cf6' },
  shirt_gold: { id: 'shirt_gold', name: 'Golden Armor', type: 'shirt', cost: 1000, color: '#fbbf24' },
  shirt_void: { id: 'shirt_void', name: 'Void Armor', type: 'shirt', cost: 0, exclusive: "Boss Drop", color: '#312e81' },

  // --- PANTS ---
  pants_basic: { id: 'pants_basic', name: 'Blue Jeans', type: 'pants', cost: 0, color: '#1e3a8a' },
  pants_black: { id: 'pants_black', name: 'Black Slacks', type: 'pants', cost: 50, color: '#171717' },
  pants_khaki: { id: 'pants_khaki', name: 'Khaki Shorts', type: 'pants', cost: 75, color: '#d4d4d8' },
  pants_camo: { id: 'pants_camo', name: 'Camo Cargos', type: 'pants', cost: 150, color: '#3f6212' },
  pants_hero: { id: 'pants_hero', name: 'Hero Tights', type: 'pants', cost: 200, color: '#2563eb' },
  pants_disco: { id: 'pants_disco', name: 'Disco Flare', type: 'pants', cost: 600, color: '#8b5cf6' },
  pants_gold: { id: 'pants_gold', name: 'Gold Greaves', type: 'pants', cost: 800, color: '#d97706' },

  // --- SHOES ---
  shoes_basic: { id: 'shoes_basic', name: 'Sneakers', type: 'shoes', cost: 0, color: '#ef4444' },
  shoes_boots: { id: 'shoes_boots', name: 'Leather Boots', type: 'shoes', cost: 50, color: '#78350f' },
  shoes_black: { id: 'shoes_black', name: 'Dress Shoes', type: 'shoes', cost: 100, color: '#000000' },
  shoes_roller: { id: 'shoes_roller', name: 'Roller Skates', type: 'shoes', cost: 350, color: '#f472b6' },
  shoes_gold: { id: 'shoes_gold', name: 'Gold Boots', type: 'shoes', cost: 500, color: '#b45309' },
};

export const CAMPAIGN_CHAPTERS = [
  { level: 1, title: "The Awakening", text: "You wake up in a world where productivity is magic.", reward: { coins: 50 } },
  { level: 2, title: "The First Goblin", text: "A Procrastination Goblin is blocking the bridge!", reward: { coins: 100, xp: 50 } },
  { level: 3, title: "The Library", text: "You find an ancient library of knowledge.", reward: { coins: 150, xp: 100 } },
  { level: 5, title: "The Shadow Beast", text: "A massive beast made of missed deadlines looms.", reward: { coins: 300, xp: 200 } },
  { level: 10, title: "Hero of the Realm", text: "You have mastered your habits.", reward: { coins: 1000, xp: 500 } }
];

// -- Logic Functions --

export const formatDateLocal = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const getFrequencyDays = (freq) => {
  switch (freq) {
    case 'daily': return 1;
    case 'weekly': return 7;
    case 'biweekly': return 14;
    case 'monthly': return 30;
    default: return 1;
  }
};

export const getNextDueDate = (habit) => {
  if (!habit.lastCompleted) return new Date();
  const last = new Date(habit.lastCompleted);
  const freqDays = getFrequencyDays(habit.frequency);
  const next = new Date(last);
  next.setDate(next.getDate() + freqDays);
  return next;
};

export const isHabitDoneThisPeriod = (habit) => {
  if (!habit.lastCompleted) return false;
  return habit.lastCompleted === formatDateLocal(new Date());
};

export const calculateLevel = (xp) => Math.floor(Math.sqrt(xp / 100)) + 1;

export const calculateProgress = (xp = 0) => {
  const level = calculateLevel(xp);
  const currentLevelXp = 100 * Math.pow(level - 1, 2);
  const nextLevelXp = 100 * Math.pow(level, 2);
  return Math.min(100, Math.max(0, ((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100));
};

// ==========================================
// 2. FIREBASE INITIALIZATION
// ==========================================

const localConfig = {
  apiKey: "AIzaSyDmwnn27u9OZ5_0IKrnD-liHX3nYMsYLqE",
  authDomain: "habit-hero-1f275.firebaseapp.com",
  projectId: "habit-hero-1f275",
  storageBucket: "habit-hero-1f275.firebasestorage.app",
  messagingSenderId: "708471992742",
  appId: "1:708471992742:web:d9fff3c4771f4aff295f67",
  measurementId: "G-GH03WMWBWD"
};

let firebaseConfig = localConfig;
if (typeof window !== 'undefined' && window.__firebase_config) {
  try {
    firebaseConfig = JSON.parse(window.__firebase_config);
  } catch (e) {
    console.warn('Parsing preview config failed, using local config.');
  }
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : '1:708471992742:web:d9fff3c4771f4aff295f67';

// ==========================================
// 3. REACT COMPONENTS
// ==========================================

const PixelHeroAvatar = ({ equipped, skinColor, hairColor, size = 128 }) => {
  const shirt = ITEMS[equipped?.shirt || 'shirt_basic'];
  const pants = ITEMS[equipped?.pants || 'pants_basic'];
  const shoes = ITEMS[equipped?.shoes || 'shoes_basic'];
  const hat = ITEMS[equipped?.hat || 'hat_none'];
  
  const skin = skinColor || '#E2B98F'; 
  const hair = hairColor || '#451a03';

  const R = ({ x, y, w, h, fill }) => <rect x={x} y={y} width={w} height={h} fill={fill} shapeRendering="crispEdges" />;

  return (
    <div style={{ width: size, height: size }} className="bg-blue-50 border-4 border-slate-900 rounded-lg overflow-hidden shadow-lg relative flex-shrink-0">
      <svg viewBox="0 0 32 32" className="w-full h-full">
        <ellipse cx="16" cy="29" rx="10" ry="2" fill="rgba(0,0,0,0.2)" />
        <R x="10" y="2" w="12" h="10" fill={skin} />
        <R x="13" y="12" w="6" h="1" fill={skin} />
        <R x="11" y="13" w="10" h="10" fill={skin} />
        <R x="7" y="13" w="3" h="9" fill={skin} />
        <R x="22" y="13" w="3" h="9" fill={skin} />
        <R x="11" y="23" w="4" h="7" fill={skin} />
        <R x="17" y="23" w="4" h="7" fill={skin} />
        <R x="11" y="21" w="10" h="2" fill={pants.color} /> 
        <R x="11" y="23" w="4" h="6" fill={pants.color} /> 
        <R x="17" y="23" w="4" h="6" fill={pants.color} /> 
        {pants.id === 'pants_camo' && (
            <>
                <R x="12" y="24" w="1" h="1" fill="#14532d" />
                <R x="18" y="26" w="2" h="1" fill="#14532d" />
                <R x="11" y="27" w="1" h="1" fill="#14532d" />
            </>
        )}
        {pants.id === 'pants_disco' && (
            <>
                <R x="12" y="23" w="2" h="6" fill="rgba(255,255,255,0.2)" />
                <R x="18" y="23" w="2" h="6" fill="rgba(255,255,255,0.2)" />
                <R x="10" y="28" w="1" h="1" fill={pants.color} />
                <R x="21" y="28" w="1" h="1" fill={pants.color} />
            </>
        )}
        <R x="10" y="29" w="5" h="2" fill={shoes.color} />
        <R x="17" y="29" w="5" h="2" fill={shoes.color} />
        {shoes.id === 'shoes_roller' && (
            <>
                <R x="10" y="31" w="1" h="1" fill="#475569" />
                <R x="14" y="31" w="1" h="1" fill="#475569" />
                <R x="17" y="31" w="1" h="1" fill="#475569" />
                <R x="21" y="31" w="1" h="1" fill="#475569" />
            </>
        )}
        <R x="11" y="13" w="10" h="9" fill={shirt.color} /> 
        <R x="7" y="13" w="3" h="5" fill={shirt.color} /> 
        <R x="22" y="13" w="3" h="5" fill={shirt.color} /> 
        {shirt.id === 'shirt_graphic' && (
             <R x="14" y="15" w="4" h="4" fill="#ef4444" />
        )}
        {shirt.id === 'shirt_striped' && (
             <>
                <R x="11" y="16" w="10" h="1" fill="rgba(255,255,255,0.3)" />
                <R x="11" y="19" w="10" h="1" fill="rgba(255,255,255,0.3)" />
             </>
        )}
        {shirt.id === 'shirt_tuxedo' && (
             <>
                <R x="15" y="13" w="2" h="9" fill="#ffffff" />
                <R x="15" y="14" w="2" h="1" fill="#ef4444" />
                <R x="14" y="14" w="1" h="1" fill="#ef4444" />
                <R x="17" y="14" w="1" h="1" fill="#ef4444" />
             </>
        )}
        {!['shirt_graphic', 'shirt_tuxedo', 'shirt_striped', 'shirt_void', 'shirt_mage'].includes(shirt.id) && (
            <R x="15" y="15" w="2" h="2" fill="rgba(255,255,255,0.3)" />
        )}
        <R x="12" y="6" w="2" h="2" fill="#1e293b" />
        <R x="18" y="6" w="2" h="2" fill="#1e293b" />
        <R x="11" y="8" w="1" h="1" fill="rgba(255,0,0,0.1)" />
        <R x="20" y="8" w="1" h="1" fill="rgba(255,0,0,0.1)" />
        <R x="10" y="1" w="12" h="3" fill={hair} />
        <R x="9" y="2" w="1" h="6" fill={hair} />
        <R x="22" y="2" w="1" h="6" fill={hair} />
        <R x="10" y="2" w="3" h="2" fill={hair} />
        <R x="19" y="2" w="3" h="2" fill={hair} />
        {hat.id !== 'hat_none' && (
           <>
             {hat.id === 'hat_headphones' ? (
                 <>
                    <R x="8" y="4" w="3" h="6" fill={hat.color} />
                    <R x="21" y="4" w="3" h="6" fill={hat.color} />
                    <R x="10" y="2" w="12" h="1" fill={hat.color} />
                 </>
             ) : (
                 <>
                    <R x="8" y="0" w="16" h="3" fill={hat.color} />
                    <R x="10" y="-2" w="12" h="2" fill={hat.color} />
                 </>
             )}
             
             {hat.id === 'hat_cowboy' && (
                 <R x="6" y="2" w="20" h="1" fill={hat.color} />
             )}
             {hat.id === 'hat_crown' && (
                <>
                  <R x="10" y="-4" w="2" h="2" fill="#fbbf24" />
                  <R x="15" y="-4" w="2" h="2" fill="#fbbf24" />
                  <R x="20" y="-4" w="2" h="2" fill="#fbbf24" />
                  <R x="15" y="1" w="2" h="2" fill="#b45309" />
                </>
             )}
             {hat.id === 'hat_wizard' && <polygon points="8,3 24,3 16,-8" fill={hat.color} />}
             {hat.id === 'hat_cap' && <R x="10" y="3" w="12" h="1" fill="rgba(0,0,0,0.2)" />}
             {hat.id === 'hat_viking' && (
                <>
                  <path d="M8 3 L6 -2 L8 -1 Z" fill="#fff" />
                  <path d="M24 3 L26 -2 L24 -1 Z" fill="#fff" />
                </>
             )}
           </>
        )}
      </svg>
    </div>
  );
};

const Auth = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGuest = async () => {
    setLoading(true);
    try { await signInAnonymously(auth); } catch (e) { setError(e.message); setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      let user;
      if (isRegister) {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        user = cred.user;
        await updateProfile(user, { displayName: username });
      } else {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        user = cred.user;
      }
      
      const userRef = doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'main');
      await setDoc(userRef, { lastLogin: serverTimestamp(), email: user.email }, { merge: true });

    } catch (err) {
      setError(err.message.replace('Firebase: ', ''));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-slate-100">
        <div className="flex justify-center mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-2xl shadow-lg shadow-blue-200">
            <Target className="w-10 h-10 text-white" />
          </div>
        </div>
        <h2 className="text-3xl font-black text-center text-slate-800 mb-1">Habit Hero</h2>
        <p className="text-center text-slate-500 mb-8 font-medium">Quest & Conquer</p>
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm font-medium flex gap-2"><AlertCircle size={16}/>{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">Hero Name</label>
              <input value={username} onChange={e=>setUsername(e.target.value)} className="w-full p-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-700" placeholder="e.g. Sir Productivity" required />
            </div>
          )}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Email</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full p-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-700" placeholder="hero@example.com" required />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Password</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full p-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-700" placeholder="••••••••" required />
          </div>
          <button disabled={loading} className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-all flex justify-center items-center gap-2 mt-4 shadow-lg shadow-slate-200">
            {loading ? 'Loading...' : isRegister ? 'Create Hero' : 'Login'}
          </button>
        </form>
        <div className="mt-6 flex flex-col gap-3 text-center">
          <button onClick={() => setIsRegister(!isRegister)} className="text-sm font-bold text-blue-600 hover:text-blue-700">
            {isRegister ? 'Already have a hero? Login' : 'New here? Create account'}
          </button>
          <button onClick={handleGuest} className="text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-wide">
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
};

const WeeklyChart = ({ stats }) => {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return { date: formatDateLocal(d), label: d.toLocaleDateString('en-US', { weekday: 'short' }) };
  });
  const maxVal = Math.max(...days.map(d => stats[d.date] || 0), 5);
  return (
    <div className="w-full h-48 flex items-end justify-between gap-2 pt-4">
      {days.map((d) => {
        const val = stats[d.date] || 0;
        const height = (val / maxVal) * 100;
        return (
          <div key={d.date} className="flex flex-col items-center flex-1 group">
             <div className="relative w-full flex justify-end flex-col items-center h-full bg-slate-50 rounded-lg overflow-hidden">
                <div 
                  className="w-full bg-blue-500 hover:bg-blue-600 transition-all duration-500 rounded-t-sm"
                  style={{ height: `${height}%` }}
                >
                  {val > 0 && <div className="text-[10px] text-white font-bold text-center mt-1">{val}</div>}
                </div>
             </div>
             <div className="text-[10px] text-slate-400 font-bold mt-2 uppercase">{d.label}</div>
          </div>
        )
      })}
    </div>
  );
};

const HabitConsistencyChart = ({ habits }) => {
    return (
        <div className="space-y-3">
            {habits.map(h => {
                const freqDays = getFrequencyDays(h.frequency);
                const targetCompletions = Math.ceil(30 / freqDays);
                let actualCompletions = 0;
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                h.history?.forEach(dateStr => {
                    if (new Date(dateStr) >= thirtyDaysAgo) actualCompletions++;
                });
                const percentage = Math.min(100, Math.round((actualCompletions / targetCompletions) * 100));
                let color = 'bg-red-500';
                if (percentage > 40) color = 'bg-amber-500';
                if (percentage > 80) color = 'bg-green-500';
                return (
                    <div key={h.id} className="flex items-center gap-3 text-xs">
                        <div className="w-24 font-bold truncate text-slate-600">{h.name}</div>
                        <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div className={`h-full ${color} transition-all duration-1000`} style={{width: `${percentage}%`}}></div>
                        </div>
                        <div className="w-8 text-right font-mono text-slate-400">{percentage}%</div>
                    </div>
                )
            })}
        </div>
    )
}

const TaskBreakdownChart = ({ tasks }) => {
    const active = tasks.filter(t => !t.completed);
    const low = active.filter(t => t.priority === 'Low').length;
    const med = active.filter(t => t.priority === 'Medium').length;
    const high = active.filter(t => t.priority === 'High').length;
    const total = active.length || 1;
    const pLow = (low / total) * 100;
    const pMed = (med / total) * 100;
    return (
        <div className="flex items-center gap-6">
            <div className="relative w-24 h-24 rounded-full border-4 border-slate-50 shadow-inner" style={{
                background: `conic-gradient(#4ade80 0% ${pLow}%, #fbbf24 ${pLow}% ${pLow + pMed}%, #f87171 ${pLow + pMed}% 100%)`
            }}>
                <div className="absolute inset-0 m-6 bg-white rounded-full flex items-center justify-center font-black text-slate-700 text-lg shadow-sm">
                    {active.length}
                </div>
            </div>
            <div className="space-y-1 text-xs font-bold">
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-400 rounded-full"/> High: {high}</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-amber-400 rounded-full"/> Med: {med}</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-400 rounded-full"/> Low: {low}</div>
            </div>
        </div>
    )
}

export default function HabitHero() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sentReminders, setSentReminders] = useState({});
  
  const [tasks, setTasks] = useState([]);
  const [habits, setHabits] = useState([]);
  const [profile, setProfile] = useState({
    xp: 0, coins: 0, inventory: ['hat_none','shirt_basic'], equipped: {hat:'hat_none',shirt:'shirt_basic',pants:'pants_basic',shoes:'shoes_basic'},
    attributes: { str: 0, int: 0, vit: 0, cre: 0, soc: 0 },
    unlockedAchievements: [],
    unlockedChapters: [],
    trainingStage: 1,
    stats: {},
    skinColor: '#E2B98F',
    hairColor: '#451a03',
    displayName: '',
    age: '',
    occupation: '',
    motivation: ''
  });

  useEffect(() => {
    const initAuth = async () => {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        try { await signInWithCustomToken(auth, __initial_auth_token); } catch (err) { console.error(err); }
      }
    };
    initAuth();
    return onAuthStateChanged(auth, (u) => { setUser(u); setAuthLoading(false); });
  }, []);

  useEffect(() => {
    if (!user) return;
    const uid = user.uid;

    // REMOVED 'orderBy' from query to prevent Firestore Index Error
    // We sort it manually in Javascript instead.
    const unsubTasks = onSnapshot(collection(db, 'artifacts', appId, 'users', uid, 'tasks'), 
      (s) => {
        const raw = s.docs.map(d => ({id:d.id, ...d.data()}));
        // Sort: Newest first
        raw.sort((a,b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setTasks(raw);
      },
      (err) => console.error("Tasks Listener Error:", err)
    );

    const unsubHabits = onSnapshot(collection(db, 'artifacts', appId, 'users', uid, 'habits'), 
      (s) => {
        const raw = s.docs.map(d => ({id:d.id, ...d.data()}));
        // Sort: Newest first
        raw.sort((a,b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setHabits(raw);
      },
      (err) => console.error("Habits Listener Error:", err)
    );

    const unsubProfile = onSnapshot(doc(db, 'artifacts', appId, 'users', uid, 'profile', 'main'), async (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        const newEquipped = { ...data.equipped };
        if (data.equipped?.head) { newEquipped.hat = data.equipped.head; delete newEquipped.head; }
        if (data.equipped?.body) { newEquipped.shirt = data.equipped.body; delete newEquipped.body; }
        if (!newEquipped.pants) newEquipped.pants = 'pants_basic';
        if (!newEquipped.shoes) newEquipped.shoes = 'shoes_basic';

        setProfile({
          ...data,
          xp: data.xp || 0,
          coins: data.coins || 0,
          inventory: data.inventory || ['hat_none','shirt_basic', 'pants_basic', 'shoes_basic'],
          equipped: newEquipped,
          attributes: data.attributes || { str: 0, int: 0, vit: 0, cre: 0, soc: 0 },
          unlockedAchievements: data.unlockedAchievements || [],
          unlockedChapters: data.unlockedChapters || [],
          trainingStage: data.trainingStage || 1,
          stats: data.stats || {},
          skinColor: data.skinColor || '#E2B98F',
          hairColor: data.hairColor || '#451a03',
          displayName: data.displayName || user.displayName || 'Hero',
          age: data.age || '',
          occupation: data.occupation || '',
          motivation: data.motivation || ''
        });
      } else {
        await setDoc(doc(db, 'artifacts', appId, 'users', uid, 'profile', 'main'), {
          xp: 0, coins: 50, createdAt: serverTimestamp(),
          inventory: ['hat_none','shirt_basic', 'pants_basic', 'shoes_basic'], 
          equipped: {hat:'hat_none',shirt:'shirt_basic',pants:'pants_basic',shoes:'shoes_basic'},
          attributes: { str: 0, int: 0, vit: 0, cre: 0, soc: 0 },
          unlockedAchievements: [],
          unlockedChapters: [],
          trainingStage: 1,
          stats: {},
          skinColor: '#E2B98F',
          hairColor: '#451a03',
          displayName: user.displayName || 'Hero',
          age: '',
          occupation: '',
          motivation: ''
        }, { merge: true });
      }
    });

    return () => { unsubTasks(); unsubHabits(); unsubProfile(); };
  }, [user]);

  // NOTIFICATION & ACHIEVEMENT LOGIC
  useEffect(() => {
    if (!user) return;
    
    // 1. Reminders
    const runReminderChecks = () => {
      setSentReminders((prev) => {
        const updated = { ...prev };
        const now = new Date();
        const todayStr = formatDateLocal(now);

        habits.forEach((habit) => {
          const nextDue = getNextDueDate(habit);
          if (!nextDue) return;
          const diffMs = nextDue - now;
          const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
          const baseKey = `${habit.id}_${nextDue.toDateString()}`;

          if (diffDays <= 1) {
            const key = `${baseKey}_due`;
            if (!updated[key]) {
              toast(`habit "${habit.name}" is due soon!`, { icon: '⏰' });
              updated[key] = true;
            }
          }
        });

        tasks.forEach((task) => {
            if (task.completed || !task.dueDate) return;
            if (task.dueDate === todayStr) {
                const key = `${task.id}_today`;
                if (!updated[key]) {
                    toast(`Quest "${task.title}" is due today!`, { icon: '📜' });
                    updated[key] = true;
                }
            }
        });
        return updated;
      });
    };

    // 2. Achievement Checker
    const checkAchievements = async () => {
        const newlyUnlocked = [];
        const currentUnlocked = profile.unlockedAchievements || [];

        ACHIEVEMENTS.forEach(ach => {
            if (!currentUnlocked.includes(ach.id) && ach.condition(profile)) {
                newlyUnlocked.push(ach);
            }
        });

        if (newlyUnlocked.length > 0) {
            newlyUnlocked.forEach(ach => {
                toast(`Achievement Unlocked: ${ach.title}!`, { icon: '🏆', duration: 4000 });
            });
            await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'main'), {
                unlockedAchievements: arrayUnion(...newlyUnlocked.map(a => a.id))
            });
        }
    };

    const id = setInterval(runReminderChecks, 60 * 1000); 
    
    // Run checks immediately when data changes
    checkAchievements();
    
    return () => clearInterval(id);
  }, [habits, tasks, user, profile]);

  const recordActivity = async (amount = 1) => {
    if (!user) return;
    const today = formatDateLocal(new Date());
    await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'main'), {
      [`stats.${today}`]: (profile.stats[today] || 0) + amount
    });
  };

  const handleTaskComplete = async (task) => {
    if (!user) return;
    const isCompleting = !task.completed;
    await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'tasks', task.id), { completed: isCompleting });
    if (isCompleting) {
      const updates = {
          xp: (profile.xp || 0) + 10,
          coins: (profile.coins || 0) + 5
      };
      if (task.attribute) {
          updates[`attributes.${task.attribute}`] = (profile.attributes?.[task.attribute] || 0) + 10;
          toast.success(`Complete! +10 XP, +10 ${ATTRIBUTES[task.attribute].label}`);
      } else {
          toast.success(`Quest Complete! +10 XP, +5 Gold`);
      }
      await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'main'), updates);
      await recordActivity(1);
    }
  };

  const handleHabitCheckIn = async (habit) => {
    if (!user) return;
    const todayStr = formatDateLocal(new Date());
    if (habit.lastCompleted === todayStr) { toast.error("Already done today!"); return; }

    const freqDays = getFrequencyDays(habit.frequency || 'daily');
    let newStreak = habit.streak || 0;
    
    if (habit.lastCompleted) {
      const last = new Date(habit.lastCompleted);
      const today = new Date();
      const diffDays = Math.ceil(Math.abs(today - last) / (1000 * 60 * 60 * 24)); 
      if (diffDays <= freqDays + 1) newStreak += 1;
      else newStreak = 1;
    } else {
      newStreak = 1;
    }

    const attrKey = habit.attribute || 'vit';
    await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'habits', habit.id), {
      lastCompleted: todayStr, streak: newStreak, history: arrayUnion(todayStr)
    });
    
    await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'main'), {
      xp: (profile.xp || 0) + 15, coins: (profile.coins || 0) + 10, [`attributes.${attrKey}`]: (profile.attributes?.[attrKey] || 0) + 10
    });
    await recordActivity(1);
    toast.success(`Habit Done! +15 XP, +10 ${ATTRIBUTES[attrKey].label} XP`);
  };

  const unlockChapter = async (level) => {
     await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'main'), {
         unlockedChapters: arrayUnion(level)
     });
     const chapter = CAMPAIGN_CHAPTERS.find(c => c.level === level);
     if (chapter) {
        await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'main'), {
            coins: (profile.coins || 0) + chapter.reward.coins,
            xp: (profile.xp || 0) + (chapter.reward.xp || 0)
        });
        toast.success(`Chapter Unlocked! +${chapter.reward.coins} Gold`);
     }
  };

  if (authLoading) return <div className="h-screen flex items-center justify-center text-slate-400">Loading Profile...</div>;
  if (!user) return <Auth />;

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      <Toaster position="top-center" toastOptions={{ style: { background: '#1e293b', color: '#fff' }}} />
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={()=>setSidebarOpen(false)}/>}
      <aside className={`fixed inset-y-0 left-0 z-30 w-72 bg-slate-900 text-white transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 flex flex-col shadow-2xl`}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl"><Target className="w-6 h-6 text-white" /></div>
            <div>
              <h1 className="text-xl font-black tracking-tight">Habit Hero</h1>
              <span className="text-xs text-blue-400 font-bold tracking-widest uppercase">Version 2.9</span>
            </div>
          </div>
          <button onClick={()=>setSidebarOpen(false)} className="md:hidden text-slate-400"><X/></button>
        </div>
        <div className="px-6 pb-6">
          <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50 flex items-center gap-4">
            <PixelHeroAvatar equipped={profile.equipped} skinColor={profile.skinColor} hairColor={profile.hairColor} size={60} />
            <div className="flex-1 min-w-0">
              <div className="font-bold truncate">{profile.displayName}</div>
              <div className="text-xs text-slate-400 mb-1">Level {calculateLevel(profile.xp)}</div>
              <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full" style={{width: `${calculateProgress(profile.xp)}%`}}></div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-2 flex items-center justify-center gap-2">
              <Coins size={14} className="text-amber-400"/>
              <span className="text-sm font-bold text-amber-400">{profile.coins}</span>
            </div>
            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-2 flex items-center justify-center gap-2">
              <Zap size={14} className="text-indigo-400"/>
              <span className="text-sm font-bold text-indigo-400">{profile.xp} XP</span>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          <NavBtn id="dashboard" icon={<TrendingUp size={20}/>} label="Dashboard" active={activeTab} set={setActiveTab}/>
          <NavBtn id="stats" icon={<BarChart2 size={20}/>} label="Statistics" active={activeTab} set={setActiveTab}/>
          <NavBtn id="tasks" icon={<CheckCircle size={20}/>} label="Quest Log" active={activeTab} set={setActiveTab}/>
          <NavBtn id="habits" icon={<Activity size={20}/>} label="Habits" active={activeTab} set={setActiveTab}/>
          <NavBtn id="hero" icon={<User size={20}/>} label="Hero & Gear" active={activeTab} set={setActiveTab}/>
          <NavBtn id="journey" icon={<Map size={20}/>} label="Journey" active={activeTab} set={setActiveTab}/>
          <NavBtn id="game" icon={<Sword size={20}/>} label="Training Grounds" active={activeTab} set={setActiveTab}/>
        </nav>
        <div className="p-4 border-t border-slate-800">
           <button onClick={()=>signOut(auth)} className="flex items-center gap-3 text-slate-400 hover:text-white px-4 py-3 rounded-xl hover:bg-slate-800 w-full transition-colors font-medium"><LogOut size={20}/> Sign Out</button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto h-full w-full relative">
        <header className="md:hidden bg-white p-4 shadow-sm flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button onClick={()=>setSidebarOpen(true)} className="text-slate-600"><Menu/></button>
            <h1 className="font-bold text-lg capitalize">{activeTab}</h1>
          </div>
          <PixelHeroAvatar equipped={profile.equipped} skinColor={profile.skinColor} hairColor={profile.hairColor} size={32} />
        </header>
        <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
          {activeTab === 'dashboard' && <DashboardView user={user} profile={profile} tasks={tasks} habits={habits} handleTaskComplete={handleTaskComplete} handleHabitCheckIn={handleHabitCheckIn} setActiveTab={setActiveTab} />}
          {activeTab === 'stats' && <StatisticsView profile={profile} habits={habits} tasks={tasks} />}
          {activeTab === 'tasks' && <TasksView user={user} tasks={tasks} handleTaskComplete={handleTaskComplete} />}
          {activeTab === 'habits' && <HabitsView user={user} habits={habits} handleHabitCheckIn={handleHabitCheckIn} />}
          {activeTab === 'hero' && <HeroView user={user} profile={profile} items={ITEMS} habits={habits} />}
          {activeTab === 'journey' && <JourneyView profile={profile} unlockChapter={unlockChapter} />}
          {activeTab === 'game' && <MiniGameView profile={profile} user={user} />}
        </div>
      </main>
    </div>
  );
}

// --- SUB VIEWS ---

const NavBtn = ({ id, icon, label, active, set }) => (
  <button onClick={()=>set(id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${active === id ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
    {icon} <span>{label}</span>
  </button>
);

const StatisticsView = ({ profile, habits, tasks }) => {
    return (
        <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold flex items-center gap-2"><BarChart2 className="text-blue-500"/> Hero Analytics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <h3 className="font-bold text-lg mb-4 text-slate-800">Weekly Productivity</h3>
                    <WeeklyChart stats={profile.stats || {}} />
                </div>
                
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <h3 className="font-bold text-lg mb-4 text-slate-800">Task Priority Breakdown</h3>
                    <div className="flex items-center justify-center h-48">
                        <TaskBreakdownChart tasks={tasks} />
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <h3 className="font-bold text-lg mb-4 text-slate-800">Habit Consistency (Last 30 Days)</h3>
                <HabitConsistencyChart habits={habits} />
            </div>

            {/* NEW: ACHIEVEMENTS SECTION */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <h3 className="font-bold text-lg mb-4 text-slate-800 flex items-center gap-2"><Trophy className="text-amber-500"/> Hall of Achievements</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {ACHIEVEMENTS.map(ach => {
                        const isUnlocked = profile.unlockedAchievements?.includes(ach.id);
                        return (
                            <div key={ach.id} className={`p-4 rounded-xl border flex items-center gap-4 transition-all ${isUnlocked ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
                                <div className={`p-3 rounded-full ${isUnlocked ? 'bg-amber-100 text-amber-600' : 'bg-slate-200 text-slate-400'}`}>
                                    {ach.icon}
                                </div>
                                <div>
                                    <div className="font-bold text-sm text-slate-800">{ach.title}</div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase">{isUnlocked ? 'Completed' : 'Locked'}</div>
                                    <div className="text-xs text-slate-500 leading-tight mt-1">{ach.desc}</div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
}

const DashboardView = ({ profile, tasks, habits, handleTaskComplete, handleHabitCheckIn, setActiveTab }) => {
  const pendingTasks = tasks.filter(t => !t.completed);
  const todaysHabits = habits.filter(h => h.lastCompleted !== formatDateLocal(new Date()));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center gap-8">
        <div className="relative z-10 flex-1">
          <h2 className="text-4xl font-black mb-2">Welcome, Hero!</h2>
          <p className="opacity-90 text-lg mb-6">You have {pendingTasks.length} active quests and {todaysHabits.length} habits awaiting you.</p>
          <div className="flex flex-wrap gap-3">
             <button onClick={()=>setActiveTab('tasks')} className="bg-white text-indigo-700 px-6 py-2 rounded-xl font-bold shadow-sm hover:shadow-md transition-all flex items-center gap-2"><CheckCircle size={18}/> Quest Log</button>
             <button onClick={()=>setActiveTab('stats')} className="bg-indigo-800/50 text-white border border-white/20 px-6 py-2 rounded-xl font-bold hover:bg-indigo-800/70 transition-all flex items-center gap-2"><BarChart2 size={18}/> View Stats</button>
          </div>
        </div>
        <div className="relative z-10 hidden md:block">
          <PixelHeroAvatar equipped={profile.equipped} skinColor={profile.skinColor} hairColor={profile.hairColor} size={140} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
             <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg flex items-center gap-2"><Activity className="text-blue-500"/> Recent Activity</h3>
             </div>
             <div className="opacity-80">
                <WeeklyChart stats={profile.stats || {}} />
             </div>
          </div>
          
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
             <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><CheckCircle className="text-green-500"/> Priority Quests</h3>
             {pendingTasks.slice(0, 3).map(t => (
               <div key={t.id} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-colors border-b border-slate-50 last:border-0">
                 <button onClick={()=>handleTaskComplete(t)} className="text-slate-300 hover:text-green-500 transition-colors"><Circle size={24}/></button>
                 <span className="font-medium flex-1">{t.title}</span>
                 {t.priority === 'High' && <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded-lg">HIGH</span>}
               </div>
             ))}
             {pendingTasks.length === 0 && <div className="text-slate-400 text-sm text-center py-4">No active quests.</div>}
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 h-fit">
           <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Zap className="text-amber-500"/> Quick Habits</h3>
           <div className="space-y-3">
             {todaysHabits.slice(0,5).map(h => (
               <div key={h.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex flex-col">
                    <span className="font-bold text-sm">{h.name}</span>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">{h.attribute || 'General'}</span>
                  </div>
                  <button onClick={()=>handleHabitCheckIn(h)} className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-lg hover:border-green-500 hover:text-green-500 shadow-sm transition-all"><Plus size={16}/></button>
               </div>
             ))}
             {todaysHabits.length === 0 && <div className="text-slate-400 text-sm text-center py-8">All habits done for today!</div>}
           </div>
        </div>
      </div>
    </div>
  );
};

const TasksView = ({ user, tasks, handleTaskComplete }) => {
  const [newTask, setNewTask] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [date, setDate] = useState('');
  const [attr, setAttr] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const add = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    try {
        await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'tasks'), {
            title: newTask, priority, attribute: attr || null, completed: false, createdAt: serverTimestamp(), dueDate: date || formatDateLocal(new Date())
        });
        setNewTask(''); setDate(''); setAttr('');
        toast.success("Quest Added!");
    } catch (err) {
        console.error(err);
        toast.error("Failed to add task: " + err.message);
    }
  };

  const del = async (id) => await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'tasks', id));
  
  const startEdit = (t) => {
      setEditingId(t.id);
      setEditForm({ title: t.title, priority: t.priority, dueDate: t.dueDate, attribute: t.attribute });
  };

  const saveEdit = async () => {
      await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'tasks', editingId), editForm);
      setEditingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Quest Log</h2>
        <span className="bg-slate-200 text-slate-600 text-xs font-bold px-3 py-1 rounded-full">{tasks.filter(t=>!t.completed).length} Active</span>
      </div>

      <form onSubmit={add} className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap gap-2 items-center">
        <input value={newTask} onChange={e=>setNewTask(e.target.value)} placeholder="Add a new quest..." className="flex-1 p-2 outline-none text-slate-700 font-medium bg-transparent min-w-[200px]" required />
        <select value={attr} onChange={e=>setAttr(e.target.value)} className="bg-slate-50 text-slate-600 text-xs font-bold rounded-xl px-2 py-2 outline-none border-none">
          <option value="">No Stat</option>
          {Object.entries(ATTRIBUTES).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="bg-slate-50 text-slate-600 text-xs font-bold rounded-xl px-2 py-2 outline-none border-none"/>
        <select value={priority} onChange={e=>setPriority(e.target.value)} className="bg-slate-50 text-slate-600 text-xs font-bold rounded-xl px-2 py-2 outline-none border-none">
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-xl transition-colors"><Plus size={20}/></button>
      </form>

      <div className="space-y-2">
        {tasks.map(t => (
          <div key={t.id} className={`group flex items-center gap-4 bg-white p-4 rounded-2xl border transition-all ${t.completed ? 'opacity-50 bg-slate-50' : 'hover:border-blue-300 shadow-sm'}`}>
            {editingId === t.id ? (
                <div className="flex-1 flex gap-2 items-center flex-wrap">
                    <input className="border p-1 rounded flex-1" value={editForm.title} onChange={e=>setEditForm({...editForm, title: e.target.value})}/>
                    <select className="border p-1 rounded" value={editForm.priority} onChange={e=>setEditForm({...editForm, priority: e.target.value})}>
                        <option>Low</option><option>Medium</option><option>High</option>
                    </select>
                    <select className="border p-1 rounded" value={editForm.attribute || ''} onChange={e=>setEditForm({...editForm, attribute: e.target.value})}>
                         <option value="">No Stat</option>
                         {Object.entries(ATTRIBUTES).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                    <input type="date" className="border p-1 rounded" value={editForm.dueDate} onChange={e=>setEditForm({...editForm, dueDate: e.target.value})}/>
                    <button onClick={saveEdit} className="bg-green-100 text-green-600 p-2 rounded"><Save size={16}/></button>
                    <button onClick={()=>setEditingId(null)} className="bg-slate-100 text-slate-600 p-2 rounded"><XCircle size={16}/></button>
                </div>
            ) : (
                <>
                <button onClick={()=>handleTaskComplete(t)} className={`${t.completed ? 'text-green-500' : 'text-slate-300 hover:text-blue-500'}`}>
                {t.completed ? <CheckCircle className="fill-current"/> : <Circle/>}
                </button>
                <div className="flex-1">
                <div className={`font-bold ${t.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>{t.title}</div>
                <div className="flex gap-2 mt-1 items-center">
                    <span className={`text-[10px] uppercase font-bold px-2 rounded ${t.priority==='High'?'bg-red-100 text-red-600':t.priority==='Medium'?'bg-amber-100 text-amber-600':'bg-green-100 text-green-600'}`}>{t.priority}</span>
                    {t.attribute && <span className="text-[10px] bg-slate-100 text-slate-500 px-2 rounded font-bold uppercase">{ATTRIBUTES[t.attribute].label}</span>}
                    {t.dueDate && <span className="text-[10px] text-slate-400 flex items-center gap-1"><Calendar size={10}/> {t.dueDate}</span>}
                </div>
                </div>
                <button onClick={()=>startEdit(t)} className="text-slate-300 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"><Edit2 size={18}/></button>
                <button onClick={()=>del(t.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={18}/></button>
                </>
            )}
          </div>
        ))}
        {tasks.length === 0 && <div className="text-center py-12 text-slate-400">Your quest log is empty.</div>}
      </div>
    </div>
  );
};

const HabitsView = ({ user, habits, handleHabitCheckIn }) => {
  const [newHabit, setNewHabit] = useState('');
  const [freq, setFreq] = useState('daily');
  const [attr, setAttr] = useState('str');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const add = async (e) => {
    e.preventDefault();
    if (!newHabit.trim()) return;
    try {
        await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'habits'), {
            name: newHabit, frequency: freq, attribute: attr, streak: 0, lastCompleted: null, history: [], createdAt: serverTimestamp()
        });
        setNewHabit('');
        toast.success("Habit Created!");
    } catch (err) {
        console.error(err);
        toast.error("Failed to add habit: " + err.message);
    }
  };

  const del = async (id) => await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'habits', id));
  
  const startEdit = (h) => {
      setEditingId(h.id);
      setEditForm({ name: h.name, frequency: h.frequency, attribute: h.attribute });
  };
  
  const saveEdit = async () => {
      await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'habits', editingId), editForm);
      setEditingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Habit Tracker</h2>
      </div>

      <form onSubmit={add} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-center">
        <div className="flex-1 w-full">
           <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-1 block">Habit Name</label>
           <input value={newHabit} onChange={e=>setNewHabit(e.target.value)} placeholder="e.g. Morning Jog" className="w-full p-2 bg-slate-50 rounded-lg outline-none font-medium" required />
        </div>
        <div className="w-full md:w-32">
           <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-1 block">Frequency</label>
           <select value={freq} onChange={e=>setFreq(e.target.value)} className="w-full p-2 bg-slate-50 rounded-lg outline-none text-sm font-bold">
             <option value="daily">Daily</option>
             <option value="weekly">Weekly</option>
           </select>
        </div>
        <div className="w-full md:w-40">
           <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-1 block">Attribute</label>
           <select value={attr} onChange={e=>setAttr(e.target.value)} className="w-full p-2 bg-slate-50 rounded-lg outline-none text-sm font-bold">
             {Object.entries(ATTRIBUTES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
           </select>
        </div>
        <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white h-10 px-6 rounded-lg font-bold transition-colors w-full md:w-auto mt-4 md:mt-0">Add</button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {habits.map(h => {
          const isDone = h.lastCompleted === formatDateLocal(new Date());
          const att = ATTRIBUTES[h.attribute || 'vit'];
          
          if(editingId === h.id) {
              return (
                  <div key={h.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-3">
                      <input className="border p-2 rounded" value={editForm.name} onChange={e=>setEditForm({...editForm, name: e.target.value})}/>
                      <select className="border p-2 rounded" value={editForm.frequency} onChange={e=>setEditForm({...editForm, frequency: e.target.value})}>
                          <option value="daily">Daily</option><option value="weekly">Weekly</option>
                      </select>
                      <select className="border p-2 rounded" value={editForm.attribute} onChange={e=>setEditForm({...editForm, attribute: e.target.value})}>
                          {Object.entries(ATTRIBUTES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                      </select>
                      <div className="flex gap-2 mt-2">
                        <button onClick={saveEdit} className="bg-green-500 text-white p-2 rounded flex-1">Save</button>
                        <button onClick={()=>setEditingId(null)} className="bg-slate-200 text-slate-600 p-2 rounded flex-1">Cancel</button>
                      </div>
                  </div>
              )
          }

          return (
            <div key={h.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative group overflow-hidden">
               <div className={`absolute top-0 right-0 p-2 rounded-bl-2xl bg-slate-50 text-slate-400 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity`}>
                 <button onClick={()=>startEdit(h)} className="hover:text-blue-500 transition-colors"><Edit2 size={16}/></button>
                 <button onClick={()=>del(h.id)} className="hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
               </div>
               
               <div className="flex items-start gap-4 mb-4">
                 <div className={`p-3 rounded-2xl ${att.bg} ${att.color}`}>{att.icon}</div>
                 <div>
                   <h3 className="font-bold text-slate-800 leading-tight">{h.name}</h3>
                   <div className="text-xs text-slate-400 font-medium mt-1 uppercase tracking-wide">{att.label} • {h.frequency}</div>
                 </div>
               </div>

               <div className="flex items-center justify-between mt-6">
                 <div>
                   <div className="text-3xl font-black text-slate-800">{h.streak || 0}</div>
                   <div className="text-[10px] font-bold text-slate-400 uppercase">Streak Days</div>
                 </div>
                 <button onClick={()=>handleHabitCheckIn(h)} disabled={isDone} className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all shadow-lg ${isDone ? 'bg-green-500 text-white scale-90 opacity-50 cursor-default' : 'bg-slate-900 text-white hover:bg-blue-600 hover:scale-110'}`}>
                   {isDone ? <CheckCircle size={24}/> : <Plus size={24}/>}
                 </button>
               </div>
               <div className="flex gap-1 mt-4 justify-end">
                 {[...Array(7)].map((_, i) => {
                   const d = new Date(); d.setDate(d.getDate() - (6-i));
                   const dStr = formatDateLocal(d);
                   const didIt = h.history?.includes(dStr);
                   return <div key={i} className={`w-2 h-2 rounded-full ${didIt ? att.bar : 'bg-slate-100'}`} title={dStr}></div>
                 })}
               </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const JourneyView = ({ profile, unlockChapter }) => {
    const currentLevel = calculateLevel(profile.xp);
    
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2"><Map className="text-blue-500"/> Campaign Map</h2>
            <div className="space-y-4">
                {CAMPAIGN_CHAPTERS.map((chapter) => {
                    const isUnlocked = currentLevel >= chapter.level;
                    const isClaimed = profile.unlockedChapters?.includes(chapter.level);

                    return (
                        <div key={chapter.level} className={`p-6 rounded-3xl border transition-all ${isUnlocked ? 'bg-white border-slate-200' : 'bg-slate-100 border-slate-200 opacity-60'}`}>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-lg">{chapter.title}</h3>
                                {isUnlocked ? (
                                    isClaimed ? <span className="text-green-500 font-bold text-sm flex items-center gap-1"><CheckCircle size={14}/> Completed</span> 
                                    : <button onClick={()=>unlockChapter(chapter.level)} className="bg-amber-500 text-white px-4 py-2 rounded-xl text-sm font-bold animate-pulse">Claim Reward</button>
                                ) : (
                                    <span className="text-slate-400 font-bold text-sm flex items-center gap-1"><Shield size={14}/> Unlocks at Lvl {chapter.level}</span>
                                )}
                            </div>
                            <p className="text-slate-600 mb-4">{isUnlocked ? chapter.text : "Keep training to reveal this chapter of your story..."}</p>
                            <div className="flex gap-4 text-xs font-bold text-slate-400 uppercase">
                                <span>Reward:</span>
                                <span className="flex items-center gap-1 text-amber-500"><Coins size={12}/> {chapter.reward.coins}</span>
                                {chapter.reward.xp && <span className="flex items-center gap-1 text-indigo-500"><Zap size={12}/> {chapter.reward.xp} XP</span>}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

const MiniGameView = ({ profile, user }) => {
    // Current Stage
    const stage = profile.trainingStage || 1;
    const isBoss = stage % 5 === 0;

    // Monster Logic
    const getMonster = (s) => {
        if (s % 5 === 0) {
            if(s === 5) return { name: "Goblin King", hp: 300, icon: "👹" };
            if(s === 10) return { name: "Ancient Dragon", hp: 600, icon: "🐉" };
            if(s === 15) return { name: "Void Lord", hp: 1000, icon: "🌑" };
            return { name: "Mega Boss", hp: s * 100, icon: "💀" };
        }
        return { name: "Training Dummy", hp: 100 + (s * 20), icon: "🪵" };
    };

    const monster = getMonster(stage);
    
    // We use local state for HP to make it responsive, but we reset it if stage changes in DB
    const [hp, setHp] = useState(monster.hp);
    const [logs, setLogs] = useState([]);

    // Reset HP if stage changes from external sync
    useEffect(() => {
        setHp(monster.hp);
        setLogs(prev => [`Entered ${isBoss ? 'BOSS ARENA' : 'Stage ' + stage}...`, ...prev].slice(0, 5));
    }, [stage, isBoss, monster.hp]); // monster.hp is derived from stage so it's stable

    const attack = async () => {
        if(hp <= 0) return;
        
        // Damage based on STR
        const damage = Math.floor(Math.random() * 5) + 5 + Math.floor((profile.attributes?.str || 0) / 5);
        const newHp = Math.max(0, hp - damage);
        setHp(newHp);
        setLogs(prev => [`Hit for ${damage} damage!`, ...prev].slice(0, 5));

        if (newHp === 0) {
            // Victory!
            const isBossKill = stage % 5 === 0;
            let updates = {
                trainingStage: stage + 1,
            };
            
            let rewardMsg = "Stage Cleared!";

            if (isBossKill) {
                rewardMsg = `BOSS DEFEATED!`;
                
                // Add Coins Loot
                const coinLoot = 50;
                updates.coins = (profile.coins || 0) + coinLoot;
                rewardMsg += ` +${coinLoot} Gold`;

                // Exclusive Item Drops
                let dropItem = null;
                if (stage === 5) dropItem = 'hat_viking';
                if (stage === 10) dropItem = 'hat_dragon';
                if (stage === 15) dropItem = 'shirt_void';

                if (dropItem && !profile.inventory?.includes(dropItem)) {
                    updates.inventory = arrayUnion(dropItem);
                    rewardMsg += ` & Dropped ${ITEMS[dropItem].name}!`;
                }
            } else {
                 // Regular stage gold loot
                 const coinLoot = 5;
                 updates.coins = (profile.coins || 0) + coinLoot;
                 rewardMsg += ` +${coinLoot} Gold`;
            }

            toast.success(rewardMsg);
            await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'main'), updates);
        }
    };

    return (
        <div className="max-w-xl mx-auto text-center space-y-6">
            <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
                <Sword className="text-red-500"/> Training Grounds <span className="text-sm bg-slate-200 text-slate-600 px-2 py-1 rounded-lg">Mission {stage}</span>
            </h2>
            
            <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs p-3 rounded-lg flex items-center gap-2 text-left">
                <AlertCircle size={16} className="shrink-0"/>
                <span>Missions no longer grant XP or Stats. Your strength comes from your habits! Loot monsters for Gold.</span>
            </div>
            
            {isBoss && <div className="bg-red-100 text-red-700 p-2 rounded-lg font-bold text-sm animate-pulse">⚠️ BOSS BATTLE DETECTED ⚠️</div>}

            <div 
                className={`bg-white p-8 rounded-3xl shadow-lg border-b-4 ${isBoss ? 'border-red-500' : 'border-slate-200'} relative overflow-hidden select-none cursor-pointer active:scale-95 transition-transform`} 
                onClick={attack}
            >
                <div className="flex justify-center mb-8 relative">
                     <div className={`text-7xl ${isBoss ? 'animate-bounce' : ''}`}>{monster.icon}</div>
                     {isBoss && <Flame className="absolute -top-4 -right-4 text-red-500 opacity-50 w-12 h-12"/>}
                </div>
                
                <h3 className="font-bold text-xl text-slate-800 mb-2">{monster.name}</h3>
                
                <div className="w-full bg-slate-100 h-6 rounded-full overflow-hidden mb-2 relative">
                    <div className={`h-full transition-all duration-200 ${isBoss ? 'bg-red-500' : 'bg-blue-500'}`} style={{width: `${(hp/monster.hp)*100}%`}}></div>
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white shadow-sm">{hp} / {monster.hp} HP</div>
                </div>
                <p className="text-xs text-slate-400 font-bold uppercase">Click to Attack (Uses Strength)</p>
            </div>

            <div className="h-40 overflow-hidden space-y-1 text-sm text-slate-500 font-mono bg-slate-100 p-4 rounded-xl text-left">
                {logs.map((l, i) => <div key={i} className="border-b border-slate-200/50 pb-1 last:border-0">{l}</div>)}
            </div>
        </div>
    )
}

const HeroView = ({ user, profile, items }) => {
    const [activeCategory, setActiveCategory] = useState('hat');
    const [isEditingBio, setIsEditingBio] = useState(false);
    const [bioForm, setBioForm] = useState({ displayName: '', age: '', occupation: '', motivation: '' });

    useEffect(() => {
        setBioForm({
            displayName: profile.displayName || '',
            age: profile.age || '',
            occupation: profile.occupation || '',
            motivation: profile.motivation || ''
        });
    }, [profile]);

    const buy = async (item) => {
      if (profile.coins < item.cost) { toast.error("Not enough gold!"); return; }
      await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'main'), {
        coins: profile.coins - item.cost, inventory: arrayUnion(item.id)
      });
      toast.success("Item purchased!");
    };
  
    const equip = async (type, id) => {
      await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'main'), { [`equipped.${type}`]: id });
      toast.success("Equipped!");
    };

    const updateAppearance = async (key, val) => {
        await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'main'), { [key]: val });
    };

    const saveBio = async () => {
        await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'main'), bioForm);
        setIsEditingBio(false);
        toast.success("Profile Updated!");
    };

    const maxAttr = Math.max(100, ...Object.values(profile.attributes || {}));
  
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* LEFT: AVATAR & STATS */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center">
                 <PixelHeroAvatar equipped={profile.equipped} skinColor={profile.skinColor} hairColor={profile.hairColor} size={200} />
                 
                 {/* BIO SECTION - RESTORED FROM V1 */}
                 <div className="w-full mt-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2"><User size={16}/> Identity</h3>
                        <button onClick={() => setIsEditingBio(!isEditingBio)} className="text-xs text-blue-500 font-bold hover:underline">
                            {isEditingBio ? 'Cancel' : 'Edit'}
                        </button>
                    </div>

                    {isEditingBio ? (
                        <div className="space-y-3">
                            <div>
                                <label className="text-[10px] font-bold uppercase text-slate-400">Hero Name</label>
                                <input className="w-full p-2 border rounded text-sm" value={bioForm.displayName} onChange={e => setBioForm({...bioForm, displayName: e.target.value})} />
                            </div>
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <label className="text-[10px] font-bold uppercase text-slate-400">Age</label>
                                    <input type="number" className="w-full p-2 border rounded text-sm" value={bioForm.age} onChange={e => setBioForm({...bioForm, age: e.target.value})} />
                                </div>
                                <div className="flex-1">
                                    <label className="text-[10px] font-bold uppercase text-slate-400">Job</label>
                                    <input className="w-full p-2 border rounded text-sm" value={bioForm.occupation} onChange={e => setBioForm({...bioForm, occupation: e.target.value})} />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold uppercase text-slate-400">Motivation</label>
                                <textarea rows="2" className="w-full p-2 border rounded text-sm" value={bioForm.motivation} onChange={e => setBioForm({...bioForm, motivation: e.target.value})} />
                            </div>
                            <button onClick={saveBio} className="w-full bg-green-500 text-white py-2 rounded font-bold text-sm">Save Profile</button>
                        </div>
                    ) : (
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between border-b border-slate-200 pb-1">
                                <span className="text-slate-500">Name</span>
                                <span className="font-bold text-slate-800">{profile.displayName}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-200 pb-1">
                                <span className="text-slate-500">Lvl</span>
                                <span className="font-bold text-slate-800">{calculateLevel(profile.xp)}</span>
                            </div>
                            {profile.age && (
                                <div className="flex justify-between border-b border-slate-200 pb-1">
                                    <span className="text-slate-500">Age</span>
                                    <span className="font-bold text-slate-800">{profile.age}</span>
                                </div>
                            )}
                            {profile.occupation && (
                                <div className="flex justify-between border-b border-slate-200 pb-1">
                                    <span className="text-slate-500">Job</span>
                                    <span className="font-bold text-slate-800">{profile.occupation}</span>
                                </div>
                            )}
                            {profile.motivation && (
                                <div className="pt-1">
                                    <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Motivation</span>
                                    <p className="text-slate-600 italic">"{profile.motivation}"</p>
                                </div>
                            )}
                        </div>
                    )}
                 </div>

                 {/* Appearance Customization */}
                 <div className="w-full mt-6 space-y-4">
                    <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400 mb-2 block">Skin Tone</label>
                        <div className="flex gap-2 flex-wrap justify-center">
                            {SKIN_TONES.map(c => (
                                <button 
                                    key={c} 
                                    onClick={()=>updateAppearance('skinColor', c)}
                                    className={`w-6 h-6 rounded-full border-2 ${profile.skinColor === c ? 'border-blue-500 scale-110' : 'border-slate-200'}`}
                                    style={{backgroundColor: c}}
                                />
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400 mb-2 block">Hair Color</label>
                        <div className="flex gap-2 flex-wrap justify-center">
                            {HAIR_COLORS.map(c => (
                                <button 
                                    key={c} 
                                    onClick={()=>updateAppearance('hairColor', c)}
                                    className={`w-6 h-6 rounded-full border-2 ${profile.hairColor === c ? 'border-blue-500 scale-110' : 'border-slate-200'}`}
                                    style={{backgroundColor: c}}
                                />
                            ))}
                        </div>
                    </div>
                 </div>

                 <div className="w-full h-px bg-slate-100 my-6"></div>

                 <div className="w-full space-y-4">
                     {Object.entries(ATTRIBUTES).map(([key, info]) => {
                        const val = profile.attributes?.[key] || 0;
                        const percent = (val / maxAttr) * 100;
                        return (
                            <div key={key}>
                            <div className="flex justify-between mb-1 text-xs font-bold">
                                <span className="text-slate-600 flex items-center gap-1">{info.icon} {info.label}</span>
                                <span className="text-slate-900">{val} XP</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div className={`h-full ${info.bar} transition-all duration-1000`} style={{width: `${percent}%`}}></div>
                            </div>
                            </div>
                        );
                     })}
                 </div>
            </div>

            {/* RIGHT: SHOP */}
            <div className="space-y-6">
                 <div className="flex justify-between items-center bg-slate-900 text-white p-4 rounded-2xl">
                    <h2 className="font-bold">Gear Shop</h2>
                    <div className="text-amber-400 font-bold flex items-center gap-1"><Coins size={16}/> {profile.coins}</div>
                 </div>

                 {/* Category Tabs */}
                 <div className="flex gap-2 overflow-x-auto pb-2">
                    {[
                        {id: 'hat', icon: <Smile size={16}/>, label: 'Hats'},
                        {id: 'shirt', icon: <Shirt size={16}/>, label: 'Shirts'},
                        {id: 'pants', icon: <LayoutGrid size={16}/>, label: 'Pants'},
                        {id: 'shoes', icon: <Footprints size={16}/>, label: 'Shoes'},
                    ].map(cat => (
                        <button 
                            key={cat.id}
                            onClick={()=>setActiveCategory(cat.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeCategory === cat.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                        >
                            {cat.icon} {cat.label}
                        </button>
                    ))}
                 </div>

                 <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {Object.values(items).filter(i => i.type === activeCategory).map(item => {
                        const owned = profile.inventory?.includes(item.id);
                        const equipped = profile.equipped?.[item.type] === item.id;
                        const isExclusive = item.exclusive;
                        const canAfford = profile.coins >= item.cost;

                        if (item.cost === 0 && !isExclusive && !item.id.includes('basic') && !item.id.includes('none')) return null;

                        return (
                            <div key={item.id} className={`bg-white p-3 rounded-xl border flex flex-col items-center text-center ${isExclusive && !owned ? 'opacity-50 grayscale border-slate-100' : 'border-slate-100'}`}>
                                {isExclusive && !owned && <div className="absolute top-2 right-2 text-[8px] bg-red-100 text-red-600 px-1 rounded font-bold">DROP</div>}
                                
                                <div className="w-12 h-12 bg-slate-50 rounded-lg mb-2 flex items-center justify-center overflow-hidden relative">
                                    {/* Mini Preview of Item */}
                                    <div className="scale-50">
                                        <svg width="32" height="32" viewBox="0 0 32 32">
                                            {item.type === 'hat' && item.path && (
                                                <g transform="translate(0, 10) scale(1)">{item.path}</g>
                                            )}
                                            {item.type === 'hat' && !item.path && item.color && (
                                                <rect x="8" y="10" width="16" height="4" fill={item.color} />
                                            )}
                                            {item.type === 'shirt' && <rect x="8" y="8" width="16" height="16" fill={item.color} rx="2" />}
                                            {item.type === 'pants' && <path d="M10 8 L22 8 L22 24 L18 24 L18 14 L14 14 L14 24 L10 24 Z" fill={item.color} />}
                                            {item.type === 'shoes' && <g><rect x="6" y="12" width="8" height="6" fill={item.color} rx="2"/><rect x="18" y="12" width="8" height="6" fill={item.color} rx="2"/></g>}
                                        </svg>
                                    </div>
                                </div>
                                
                                <div className="font-bold text-xs truncate w-full">{item.name}</div>
                                <div className="mt-auto w-full pt-2">
                                    {owned ? (
                                        <button onClick={()=>equip(item.type, item.id)} disabled={equipped} className={`w-full py-1.5 rounded-lg text-[10px] font-bold ${equipped ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{equipped ? 'Equipped' : 'Equip'}</button>
                                    ) : (
                                        isExclusive ? 
                                        <div className="text-[9px] text-slate-400 font-bold py-1">{item.exclusive}</div>
                                        : <button disabled={!canAfford} onClick={()=>buy(item)} className={`w-full py-1.5 rounded-lg text-[10px] font-bold shadow-sm flex justify-center items-center gap-1 ${canAfford ? 'bg-amber-500 text-white hover:bg-amber-600' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}><Coins size={10}/> {item.cost}</button>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                 </div>
            </div>
        </div>
      </div>
    );
};