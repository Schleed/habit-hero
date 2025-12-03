// src/HabitHero.jsx

import React, { useState, useEffect } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
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
  Mail,
  ShoppingBag,
  Coins,
  Scroll,
  Save,
  XCircle,
  UserPlus,
  LogIn,
} from 'lucide-react';

// --- FIREBASE SETUP ---
// Replace these values with your real Firebase config from the Firebase Console
const localConfig = {
  apiKey: "AIzaSyDmwnn27u9OZ5_0IKrnD-liHX3nYMsYLqE",
  authDomain: "habit-hero-1f275.firebaseapp.com",
  projectId: "habit-hero-1f275",
  storageBucket: "habit-hero-1f275.firebasestorage.app",
  messagingSenderId: "708471992742",
  appId: "1:708471992742:web:d9fff3c4771f4aff295f67",
  measurementId: "G-GH03WMWBWD"
};

// Use localConfig by default; optionally allow window.__firebase_config in hosted envs
let firebaseConfig = localConfig;

if (typeof window !== 'undefined' && window.__firebase_config) {
  try {
    firebaseConfig = JSON.parse(window.__firebase_config);
  } catch (e) {
    console.warn('Parsing preview config failed, using local config.');
  }
}

// Initialize Firebase safely (works with Vite HMR)
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- GAME DATA (ITEMS) ---
const ITEMS = {
  // HATS
  hat_none: { id: 'hat_none', name: 'No Hat', type: 'head', cost: 0, path: null },
  hat_beanie: {
    id: 'hat_beanie',
    name: 'Blue Beanie',
    type: 'head',
    cost: 50,
    path: (
      <path
        d="M40 35 C40 20 60 15 100 15 C140 15 160 20 160 35 L160 60 C160 60 40 60 40 60 Z"
        fill="#3b82f6"
        stroke="#1d4ed8"
        strokeWidth="3"
      />
    ),
  },
  hat_cap: {
    id: 'hat_cap',
    name: 'Red Cap',
    type: 'head',
    cost: 100,
    path: (
      <g>
        <path
          d="M45 45 C45 25 65 20 100 20 C135 20 155 25 155 45 L155 55 L45 55 Z"
          fill="#ef4444"
          stroke="#b91c1c"
          strokeWidth="3"
        />
        <rect
          x="150"
          y="50"
          width="40"
          height="8"
          rx="2"
          fill="#ef4444"
          stroke="#b91c1c"
          strokeWidth="2"
        />
      </g>
    ),
  },
  hat_crown: {
    id: 'hat_crown',
    name: 'Gold Crown',
    type: 'head',
    cost: 500,
    path: (
      <path
        d="M50 55 L50 25 L75 45 L100 15 L125 45 L150 25 L150 55 Z"
        fill="#fbbf24"
        stroke="#d97706"
        strokeWidth="3"
      />
    ),
  },
  hat_wizard: {
    id: 'hat_wizard',
    name: 'Wizard Hat',
    type: 'head',
    cost: 300,
    path: (
      <g>
        <path
          d="M30 55 L170 55 L100 5 L30 55"
          fill="#8b5cf6"
          stroke="#6d28d9"
          strokeWidth="3"
        />
        <ellipse cx="100" cy="55" rx="75" ry="10" fill="#7c3aed" />
      </g>
    ),
  },

  // SHIRTS
  shirt_basic: {
    id: 'shirt_basic',
    name: 'Grey Tee',
    type: 'body',
    cost: 0,
    color: '#94a3b8',
  },
  shirt_blue: {
    id: 'shirt_blue',
    name: 'Blue Hoodie',
    type: 'body',
    cost: 50,
    color: '#3b82f6',
  },
  shirt_suit: {
    id: 'shirt_suit',
    name: 'Business Suit',
    type: 'body',
    cost: 150,
    color: '#1e293b',
  },
  shirt_hero: {
    id: 'shirt_hero',
    name: 'Hero Suit',
    type: 'body',
    cost: 300,
    color: '#ef4444',
  },
  shirt_gold: {
    id: 'shirt_gold',
    name: 'Golden Armor',
    type: 'body',
    cost: 1000,
    color: '#fbbf24',
  },
};

// --- COMPONENTS ---

// 1. Hero Avatar Component
const HeroAvatar = ({ equipped, size = 64 }) => {
  const hat = ITEMS[equipped?.head || 'hat_none'];
  const shirt = ITEMS[equipped?.body || 'shirt_basic'];

  return (
    <div
      style={{ width: size, height: size }}
      className="relative bg-slate-200 rounded-full overflow-hidden border-2 border-white shadow-sm flex-shrink-0"
    >
      <svg viewBox="0 0 200 200" className="w-full h-full">
        <rect width="200" height="200" fill="#e2e8f0" />
        <path
          d="M40 200 L40 160 C40 130 160 130 160 160 L160 200 Z"
          fill={shirt?.color || '#94a3b8'}
        />
        {shirt?.id === 'shirt_suit' && (
          <path d="M100 160 L100 200" stroke="white" strokeWidth="2" />
        )}
        {shirt?.id === 'shirt_hero' && <circle cx="100" cy="170" r="10" fill="yellow" />}
        <circle cx="100" cy="90" r="50" fill="#fca5a5" />
        <circle cx="85" cy="85" r="5" fill="#334155" />
        <circle cx="115" cy="85" r="5" fill="#334155" />
        <path
          d="M90 110 Q100 120 110 110"
          fill="none"
          stroke="#334155"
          strokeWidth="3"
          strokeLinecap="round"
        />
        {hat?.path}
      </svg>
    </div>
  );
};

// 2. Simple Bar Chart (kept in case you want to use it later)
const SimpleBarChart = ({ data, color = '#3b82f6' }) => {
  if (!data || data.length === 0)
    return (
      <div className="text-gray-400 text-sm p-4 text-center">No data to display</div>
    );
  const maxVal = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="w-full h-40 flex items-end justify-between gap-2 pt-4">
      {data.map((d, i) => (
        <div key={i} className="flex flex-col items-center flex-1 group">
          <div className="relative w-full flex justify-end flex-col items-center">
            <div
              className="w-full rounded-t-md opacity-80 group-hover:opacity-100 transition-all duration-300"
              style={{
                height: `${(d.value / maxVal) * 100}px`,
                backgroundColor: color,
                minHeight: d.value > 0 ? '4px' : '0',
              }}
            ></div>
            {d.value > 0 && (
              <div className="absolute -top-6 text-xs font-bold text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                {d.value}
              </div>
            )}
          </div>
          <div className="text-xs text-gray-500 mt-2 font-medium truncate w-full text-center">
            {d.label}
          </div>
        </div>
      ))}
    </div>
  );
};

// 3. Auth Component
const Auth = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGuest = async () => {
    setLoading(true);
    setError('');
    try {
      await signInAnonymously(auth);
      // onAuthStateChanged in HabitHero will pick this up
    } catch (err) {
      console.error('Guest Auth Error:', err);
      setError('Guest login failed. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let currentUser = null;

      if (isRegister) {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password,
        );
        currentUser = userCredential.user;
        if (username) {
          await updateProfile(currentUser, { displayName: username });
        }
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        currentUser = userCredential.user;
      }

      if (currentUser) {
        const userRef = doc(db, 'users', currentUser.uid);
        const profileData = { lastLogin: serverTimestamp() };

        if (isRegister) {
          profileData.createdAt = serverTimestamp();
          profileData.xp = 0;
          profileData.coins = 100;
          profileData.level = 1;
          profileData.inventory = ['hat_none', 'shirt_basic'];
          profileData.equipped = { head: 'hat_none', body: 'shirt_basic' };
          profileData.age = '';
          profileData.occupation = '';
          profileData.motivation = '';
          if (username) profileData.displayName = username;
          if (email) profileData.email = email;
        } else {
          if (email) profileData.email = email;
        }

        await setDoc(userRef, profileData, { merge: true });
      }
      // onAuthStateChanged in HabitHero will handle redirect into app UI
    } catch (err) {
      console.error(err);
      let msg = err.message;
      if (
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/invalid-credential'
      ) {
        msg = 'Invalid email or password.';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'Account already exists for this email.';
      }
      setError(msg.replace('Firebase: ', ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-200">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-600 p-3 rounded-full">
            <Target className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-center text-slate-800 mb-2">
          Habit Hero
        </h2>
        <p className="text-center text-slate-500 mb-8">Gamified Productivity</p>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 mb-4 text-sm rounded flex items-start gap-2">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Hero Name
              </label>
              <div className="relative">
                <User
                  size={18}
                  className="absolute top-2.5 left-3 text-slate-400"
                />
                <input
                  type="text"
                  required
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Captain Productivity"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <div className="relative">
              <Mail
                size={18}
                className="absolute top-2.5 left-3 text-slate-400"
              />
              <input
                type="email"
                required
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="hero@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Shield
                size={18}
                className="absolute top-2.5 left-3 text-slate-400"
              />
              <input
                type="password"
                required
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
          >
            {loading
              ? 'Processing...'
              : isRegister
              ? (
                <>
                  <UserPlus size={20} /> Start Adventure
                </>
                )
              : (
                <>
                  <LogIn size={20} /> Login to HQ
                </>
                )}
          </button>
        </form>

        <div className="mt-6 flex flex-col gap-4 text-center">
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
            }}
            className="text-sm text-blue-600 font-medium hover:underline"
          >
            {isRegister ? 'Already a Hero? Login' : 'Need an account? Sign Up'}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-400">Or</span>
            </div>
          </div>

          <button
            onClick={handleGuest}
            className="text-sm text-slate-500 hover:text-slate-700 font-medium transition-colors"
          >
            Try as Guest (Local Session Only)
          </button>
        </div>
      </div>
    </div>
  );
};

// --- MAIN APPLICATION COMPONENT ---
export default function HabitHero() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [tasks, setTasks] = useState([]);
  const [habits, setHabits] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userProfile, setUserProfile] = useState({
    xp: 0,
    coins: 0,
    level: 1,
    displayName: '',
    email: '',
    age: '',
    occupation: '',
    motivation: '',
    inventory: ['hat_none', 'shirt_basic'],
    equipped: { head: 'hat_none', body: 'shirt_basic' },
  });

  const calculateLevel = (xp) => Math.floor(Math.sqrt(xp / 100)) + 1;
  const calculateProgress = (xp) => {
    const level = calculateLevel(xp || 0);
    const currentLevelXp = 100 * Math.pow(level - 1, 2);
    const nextLevelXp = 100 * Math.pow(level, 2);
    return ((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;
  };

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  // Data Sync when user is logged in
  useEffect(() => {
    if (!user) return;

    const uid = user.uid;

    const qTasks = query(
      collection(db, 'users', uid, 'tasks'),
      orderBy('createdAt', 'desc'),
    );
    const unsubTasks = onSnapshot(qTasks, (s) =>
      setTasks(s.docs.map((d) => ({ id: d.id, ...d.data() }))),
    );

    const qHabits = query(
      collection(db, 'users', uid, 'habits'),
      orderBy('createdAt', 'desc'),
    );
    const unsubHabits = onSnapshot(qHabits, (s) =>
      setHabits(s.docs.map((d) => ({ id: d.id, ...d.data() }))),
    );

    const userDocRef = doc(db, 'users', uid);
    const unsubProfile = onSnapshot(userDocRef, async (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserProfile({
          ...userProfile,
          ...data,
          coins: data.coins ?? 0,
          xp: data.xp ?? 0,
          level: data.level ?? calculateLevel(data.xp ?? 0),
          inventory: data.inventory || ['hat_none', 'shirt_basic'],
          equipped:
            data.equipped || { head: 'hat_none', body: 'shirt_basic' },
          age: data.age || '',
          occupation: data.occupation || '',
          motivation: data.motivation || '',
        });
      } else {
        // Create default profile
        await setDoc(
          userDocRef,
          {
            xp: 0,
            coins: 50,
            level: 1,
            displayName: user.displayName || 'Hero',
            email: user.email || '',
            inventory: ['hat_none', 'shirt_basic'],
            equipped: { head: 'hat_none', body: 'shirt_basic' },
            age: '',
            occupation: '',
            motivation: '',
            createdAt: serverTimestamp(),
          },
          { merge: true },
        );
      }
    });

    return () => {
      unsubTasks();
      unsubHabits();
      unsubProfile();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Actions
  const addRewards = async (xpAmount, coinAmount) => {
    if (!user) return;
    const uid = user.uid;
    const newXp = (userProfile.xp || 0) + xpAmount;
    const newCoins = (userProfile.coins || 0) + coinAmount;
    const userDocRef = doc(db, 'users', uid);
    await updateDoc(userDocRef, {
      xp: newXp,
      coins: newCoins,
      level: calculateLevel(newXp),
    });
  };

  const addTask = async (title, priority, date) => {
    if (!user || !title.trim()) return;
    const uid = user.uid;
    await addDoc(collection(db, 'users', uid, 'tasks'), {
      title,
      priority,
      dueDate: date,
      completed: false,
      createdAt: serverTimestamp(),
    });
    addRewards(10, 5);
  };

  const updateTask = async (id, newTitle, newPriority, newDate) => {
    if (!user) return;
    const uid = user.uid;
    const taskRef = doc(db, 'users', uid, 'tasks', id);
    await updateDoc(taskRef, {
      title: newTitle,
      priority: newPriority,
      dueDate: newDate,
    });
  };

  const toggleTask = async (task) => {
    if (!user) return;
    const uid = user.uid;
    const taskRef = doc(db, 'users', uid, 'tasks', task.id);
    await updateDoc(taskRef, { completed: !task.completed });
    if (!task.completed) addRewards(50, 20);
    else addRewards(-50, -20);
  };

  const deleteTask = async (id) => {
    if (!user) return;
    const uid = user.uid;
    await deleteDoc(doc(db, 'users', uid, 'tasks', id));
  };

  const addHabit = async (name) => {
    if (!user || !name.trim()) return;
    const uid = user.uid;
    await addDoc(collection(db, 'users', uid, 'habits'), {
      name,
      streak: 0,
      lastCompleted: null,
      createdAt: serverTimestamp(),
    });
  };

  const checkInHabit = async (habit) => {
    if (!user) return;
    const uid = user.uid;
    const today = new Date().toDateString();
    if (habit.lastCompleted === today) return;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    let newStreak = habit.streak || 0;
    if (habit.lastCompleted === yesterdayStr) newStreak += 1;
    else newStreak = 1;

    const habitRef = doc(db, 'users', uid, 'habits', habit.id);
    await updateDoc(habitRef, { streak: newStreak, lastCompleted: today });

    let coinBonus = 0;
    let xpBonus = 0;

    if (newStreak % 7 === 0) {
      coinBonus = 100;
      xpBonus = 100;
      alert(`🔥 7-DAY STREAK! +${coinBonus} Gold!`);
    } else if (newStreak % 3 === 0) {
      coinBonus = 50;
      xpBonus = 50;
    }

    addRewards(20 + xpBonus, 10 + coinBonus);
  };

  const deleteHabit = async (id) => {
    if (!user) return;
    const uid = user.uid;
    await deleteDoc(doc(db, 'users', uid, 'habits', id));
  };

  const buyItem = async (item) => {
    if (!user) return;
    if (userProfile.inventory.includes(item.id)) return;
    if (userProfile.coins < item.cost) return;

    const uid = user.uid;
    const userDocRef = doc(db, 'users', uid);
    await updateDoc(userDocRef, {
      coins: userProfile.coins - item.cost,
      inventory: [...userProfile.inventory, item.id],
    });
  };

  const equipItem = async (type, itemId) => {
    if (!user) return;
    const uid = user.uid;
    const newEquipped = { ...userProfile.equipped, [type]: itemId };
    const userDocRef = doc(db, 'users', uid);
    await updateDoc(userDocRef, { equipped: newEquipped });
  };

  const updateProfileData = async (updates) => {
    if (!user) return;
    const uid = user.uid;
    const userDocRef = doc(db, 'users', uid);
    await updateDoc(userDocRef, updates);
    if (updates.displayName) {
      await updateProfile(user, { displayName: updates.displayName });
    }
  };

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-100">
        <div className="flex flex-col items-center gap-3">
          <div className="bg-blue-600 p-3 rounded-full">
            <Target className="w-8 h-8 text-white animate-pulse" />
          </div>
          <p className="text-slate-500 font-medium">Loading your hero profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  const displayHeroName =
    userProfile.displayName || user.displayName || 'Hero';
  const displayEmail =
    userProfile.email ||
    user.email ||
    (user.isAnonymous ? 'Guest Session' : '');

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 text-white transform transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0 flex flex-col shadow-2xl`}
      >
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Target className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-wide">Habit Hero</h1>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-slate-400"
          >
            <X size={24} />
          </button>
        </div>

        <div className="px-6 pb-6">
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 flex flex-col items-center">
            <HeroAvatar equipped={userProfile.equipped} size={80} />
            <div className="mt-3 text-center w-full">
              <p className="font-bold text-sm truncate w-full">
                {displayHeroName}
              </p>
              <div className="flex items-center justify-center gap-2 mt-1">
                <span className="text-xs text-amber-400 font-bold flex items-center gap-1">
                  <Coins size={12} /> {userProfile.coins}
                </span>
                <span className="text-xs text-indigo-400 font-bold">
                  Lvl {calculateLevel(userProfile.xp || 0)}
                </span>
              </div>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2 mt-3">
              <div
                className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${calculateProgress(userProfile.xp || 0)}%`,
                }}
              ></div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <NavItem
            icon={<TrendingUp size={20} />}
            label="Dashboard"
            id="dashboard"
            active={activeTab}
            setActive={setActiveTab}
          />
          <NavItem
            icon={<CheckCircle size={20} />}
            label="Tasks"
            id="tasks"
            active={activeTab}
            setActive={setActiveTab}
          />
          <NavItem
            icon={<Clock size={20} />}
            label="Habits"
            id="habits"
            active={activeTab}
            setActive={setActiveTab}
          />
          <NavItem
            icon={<ShoppingBag size={20} />}
            label="Shop"
            id="shop"
            active={activeTab}
            setActive={setActiveTab}
          />
          <NavItem
            icon={<Settings size={20} />}
            label="Account"
            id="account"
            active={activeTab}
            setActive={setActiveTab}
          />
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={() => {
              signOut(auth);
            }}
            className="flex items-center gap-3 text-slate-400 hover:text-white w-full px-4 py-3 rounded-lg hover:bg-slate-800"
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto h-full w-full">
        <header className="md:hidden bg-white p-4 shadow-sm flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-slate-600"
            >
              <Menu size={24} />
            </button>
            <h1 className="font-bold text-lg capitalize text-slate-800">
              {activeTab}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <HeroAvatar equipped={userProfile.equipped} size={32} />
          </div>
        </header>

        <div className="p-4 md:p-8 max-w-5xl mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              tasks={tasks}
              habits={habits}
              setActiveTab={setActiveTab}
              checkInHabit={checkInHabit}
              displayName={displayHeroName}
            />
          )}
          {activeTab === 'tasks' && (
            <TasksView
              tasks={tasks}
              addTask={addTask}
              updateTask={updateTask}
              toggleTask={toggleTask}
              deleteTask={deleteTask}
            />
          )}
          {activeTab === 'habits' && (
            <HabitsView
              habits={habits}
              addHabit={addHabit}
              checkInHabit={checkInHabit}
              deleteHabit={deleteHabit}
            />
          )}
          {activeTab === 'shop' && (
            <ShopView userProfile={userProfile} buyItem={buyItem} />
          )}
          {activeTab === 'account' && (
            <AccountView
              user={user}
              userProfile={userProfile}
              updateProfileData={updateProfileData}
              calculateLevel={calculateLevel}
              displayEmail={displayEmail}
              equipItem={equipItem}
            />
          )}
        </div>
      </main>
    </div>
  );
}

// --- VIEWS ---

const NavItem = ({ icon, label, id, active, setActive }) => (
  <button
    onClick={() => setActive(id)}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
      active === id
        ? 'bg-blue-600 text-white shadow-lg'
        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`}
  >
    {icon}
    <span className="font-medium">{label}</span>
  </button>
);

const ShopView = ({ userProfile, buyItem }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Item Shop</h2>
        <div className="bg-amber-100 text-amber-800 px-4 py-2 rounded-full font-bold flex items-center gap-2">
          <Coins size={18} /> {userProfile.coins} Gold
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.values(ITEMS)
          .filter((i) => i.cost > 0)
          .map((item) => {
            const owned = userProfile.inventory.includes(item.id);
            const canAfford = userProfile.coins >= item.cost;
            return (
              <div
                key={item.id}
                className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center relative overflow-hidden"
              >
                {owned && (
                  <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                    OWNED
                  </div>
                )}
                <div className="w-24 h-24 mb-4 flex items-center justify-center bg-slate-50 rounded-full">
                  <div className="scale-150 transform">
                    <svg width="60" height="60" viewBox="0 0 200 200">
                      {item.type === 'head' && <>{item.path}</>}
                      {item.type === 'body' && (
                        <path
                          d="M40 100 L40 60 C40 30 160 30 160 60 L160 100 Z"
                          fill={item.color}
                        />
                      )}
                    </svg>
                  </div>
                </div>
                <h3 className="font-bold text-slate-800">{item.name}</h3>
                <p className="text-sm text-slate-500 mb-4 capitalize">
                  {item.type}
                </p>

                <button
                  disabled={owned || !canAfford}
                  onClick={() => buyItem(item)}
                  className={`w-full py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
                    owned
                      ? 'bg-slate-100 text-slate-400'
                      : canAfford
                      ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-200'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {owned ? (
                    'In Inventory'
                  ) : (
                    <>
                      <Coins size={16} /> {item.cost}
                    </>
                  )}
                </button>
              </div>
            );
          })}
      </div>
    </div>
  );
};

const AccountView = ({
  user,
  userProfile,
  updateProfileData,
  calculateLevel,
  displayEmail,
  equipItem,
}) => {
  const [form, setForm] = useState({
    displayName: '',
    age: '',
    occupation: '',
    motivation: '',
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    setForm({
      displayName: userProfile.displayName || '',
      age: userProfile.age || '',
      occupation: userProfile.occupation || '',
      motivation: userProfile.motivation || '',
    });
  }, [userProfile]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    await updateProfileData(form);
    setMsg('Profile updated!');
    setSaving(false);
  };

  const inventoryItems = userProfile.inventory
    .map((id) => ITEMS[id])
    .filter(Boolean);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-8 items-start">
        {/* LEFT COLUMN: AVATAR & STATS */}
        <div className="flex flex-col items-center gap-6 w-full md:w-auto md:min-w-[200px] border-b md:border-b-0 md:border-r border-slate-100 pb-6 md:pb-0 md:pr-6">
          <HeroAvatar equipped={userProfile.equipped} size={150} />
          <div className="text-center">
            <h3 className="text-xl font-black text-slate-800">
              Lvl {calculateLevel(userProfile.xp)}
            </h3>
            <p className="text-slate-500 text-sm mb-4">Hero Status</p>

            <div className="grid grid-cols-2 gap-2 w-full text-center">
              <div className="bg-amber-50 p-2 rounded-lg">
                <div className="text-amber-700 font-bold">
                  {userProfile.coins}
                </div>
                <div className="text-[10px] text-amber-500 uppercase">
                  Gold
                </div>
              </div>
              <div className="bg-indigo-50 p-2 rounded-lg">
                <div className="text-indigo-700 font-bold">
                  {userProfile.xp}
                </div>
                <div className="text-[10px] text-indigo-500 uppercase">
                  XP
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="flex-1 w-full space-y-8">
          {/* WARDROBE SECTION */}
          <div>
            <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
              <ShoppingBag size={20} className="text-blue-500" /> Wardrobe
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">
                  Headgear
                </label>
                <div className="flex flex-wrap gap-2">
                  {inventoryItems
                    .filter((i) => i.type === 'head')
                    .map((item) => (
                      <button
                        key={item.id}
                        onClick={() => equipItem('head', item.id)}
                        className={`p-2 rounded-lg border-2 transition-all ${
                          userProfile.equipped.head === item.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-slate-100 hover:border-blue-300'
                        }`}
                      >
                        <span className="text-xs font-medium">
                          {item.name}
                        </span>
                      </button>
                    ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">
                  Outfit
                </label>
                <div className="flex flex-wrap gap-2">
                  {inventoryItems
                    .filter((i) => i.type === 'body')
                    .map((item) => (
                      <button
                        key={item.id}
                        onClick={() => equipItem('body', item.id)}
                        className={`p-2 rounded-lg border-2 transition-all ${
                          userProfile.equipped.body === item.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-slate-100 hover:border-blue-300'
                        }`}
                      >
                        <span className="text-xs font-medium">
                          {item.name}
                        </span>
                      </button>
                    ))}
                </div>
              </div>
            </div>
          </div>

          {/* PROFILE FORM */}
          <form onSubmit={handleUpdate} className="space-y-5">
            <h3 className="font-bold text-lg text-slate-800 border-b pb-2 flex items-center gap-2">
              <User size={20} className="text-blue-500" /> Personal Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  Hero Name
                </label>
                <input
                  type="text"
                  value={form.displayName}
                  onChange={(e) =>
                    setForm({ ...form, displayName: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  Email (Read Only)
                </label>
                <div className="w-full px-4 py-2 border border-slate-100 bg-slate-50 text-slate-500 rounded-lg flex items-center gap-2">
                  <Mail size={14} /> {displayEmail}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  Age
                </label>
                <input
                  type="number"
                  placeholder="e.g. 24"
                  value={form.age}
                  onChange={(e) =>
                    setForm({ ...form, age: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  Occupation
                </label>
                <select
                  value={form.occupation}
                  onChange={(e) =>
                    setForm({ ...form, occupation: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white"
                >
                  <option value="">Select Occupation...</option>
                  <option value="Student">Student</option>
                  <option value="Professional">Working Professional</option>
                  <option value="Freelancer">Freelancer</option>
                  <option value="Retired">Retired</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">
                My Hero&apos;s Oath (Motivation)
              </label>
              <div className="relative">
                <Scroll
                  size={16}
                  className="absolute top-3 left-3 text-slate-400"
                />
                <textarea
                  rows="3"
                  placeholder="I am building habits because..."
                  value={form.motivation}
                  onChange={(e) =>
                    setForm({ ...form, motivation: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              {msg && (
                <span className="text-green-600 text-sm font-bold animate-pulse">
                  {msg}
                </span>
              )}
              <button
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold transition-all ml-auto disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const DashboardView = ({
  tasks,
  habits,
  setActiveTab,
  checkInHabit,
  displayName,
}) => {
  const pendingTasks = tasks.filter((t) => !t.completed).length;
  const topHabits = [...habits]
    .sort((a, b) => (b.streak || 0) - (a.streak || 0))
    .slice(0, 3);
  const urgentTasks = tasks
    .filter((t) => !t.completed && t.priority === 'High')
    .slice(0, 3);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2">Welcome, {displayName}!</h2>
          <p className="opacity-90 mb-4">
            Ready to earn some gold? You have {pendingTasks} tasks.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setActiveTab('tasks')}
              className="bg-white text-blue-700 px-4 py-2 rounded-lg font-bold text-sm"
            >
              Tasks
            </button>
            <button
              onClick={() => setActiveTab('shop')}
              className="bg-blue-700 text-white px-4 py-2 rounded-lg font-bold text-sm"
            >
              Visit Shop
            </button>
          </div>
        </div>
        <Target className="absolute right-[-20px] bottom-[-40px] w-48 h-48 text-white opacity-10" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-lg text-slate-800 mb-4">
            Top Streaks
          </h3>
          {topHabits.length > 0 ? (
            topHabits.map((h) => (
              <div
                key={h.id}
                className="flex justify-between items-center p-3 bg-amber-50 mb-2 rounded-lg border border-amber-100"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-white px-2 py-1 rounded font-bold text-amber-600">
                    {h.streak}
                  </div>
                  <span>{h.name}</span>
                </div>
                <button
                  onClick={() => checkInHabit(h)}
                  disabled={h.lastCompleted === new Date().toDateString()}
                  className="text-green-600 disabled:opacity-50"
                >
                  <CheckCircle />
                </button>
              </div>
            ))
          ) : (
            <div className="text-slate-400 text-sm">No active habits.</div>
          )}
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-lg text-slate-800 mb-4">
            Urgent Tasks
          </h3>
          {urgentTasks.length > 0 ? (
            urgentTasks.map((t) => (
              <div
                key={t.id}
                className="flex justify-between p-3 bg-red-50 mb-2 rounded-lg border border-red-100"
              >
                <span>{t.title}</span>
                <span className="font-bold text-red-600 text-xs bg-white px-2 py-1 rounded">
                  HIGH
                </span>
              </div>
            ))
          ) : (
            <div className="text-slate-400 text-sm">No urgent tasks.</div>
          )}
        </div>
      </div>
    </div>
  );
};

const TasksView = ({
  tasks,
  addTask,
  updateTask,
  toggleTask,
  deleteTask,
}) => {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editPriority, setEditPriority] = useState('Medium');
  const [editDate, setEditDate] = useState('');

  const handle = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    const dateToSave =
      dueDate || new Date().toISOString().split('T')[0];
    addTask(title, priority, dateToSave);
    setTitle('');
    setDueDate('');
  };

  const startEdit = (t) => {
    setEditingId(t.id);
    setEditTitle(t.title);
    setEditPriority(t.priority);
    setEditDate(t.dueDate || '');
  };

  const saveEdit = () => {
    if (!editTitle.trim()) return;
    updateTask(editingId, editTitle, editPriority, editDate);
    setEditingId(null);
  };

  const getPriorityColor = (p) => {
    switch (p) {
      case 'High':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'Medium':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Low':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Tasks</h2>
      <form
        onSubmit={handle}
        className="flex flex-col md:flex-row gap-2 bg-white p-4 rounded-xl shadow-sm border"
      >
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1 border p-2 rounded outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="New Task (+10 XP, +5 Gold)"
        />
        <div className="flex gap-2">
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="border p-2 rounded outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="border p-2 rounded outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
          <button className="bg-blue-600 text-white px-4 rounded font-bold hover:bg-blue-700 transition-colors">
            <Plus />
          </button>
        </div>
      </form>

      <div className="space-y-2">
        {tasks
          .filter((t) => !t.completed)
          .map((t) => (
            <div
              key={t.id}
              className={`bg-white p-4 rounded-xl border hover:border-blue-300 transition-all ${
                t.priority === 'High'
                  ? 'border-l-4 border-l-red-400'
                  : ''
              }`}
            >
              {editingId === t.id ? (
                <div className="flex flex-col gap-3">
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="border p-2 rounded w-full"
                  />
                  <div className="flex gap-2">
                    <select
                      value={editPriority}
                      onChange={(e) =>
                        setEditPriority(e.target.value)
                      }
                      className="border p-2 rounded text-sm"
                    >
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                    </select>
                    <input
                      type="date"
                      value={editDate}
                      onChange={(e) =>
                        setEditDate(e.target.value)
                      }
                      className="border p-2 rounded text-sm"
                    />
                    <div className="flex ml-auto gap-2">
                      <button
                        type="button"
                        onClick={saveEdit}
                        className="bg-green-100 text-green-700 p-2 rounded hover:bg-green-200"
                      >
                        <Save size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="bg-slate-100 text-slate-700 p-2 rounded hover:bg-slate-200"
                      >
                        <XCircle size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => toggleTask(t)}
                      className="text-slate-300 hover:text-blue-500"
                    >
                      <Circle />
                    </button>
                    <div>
                      <p className="font-medium text-slate-800">
                        {t.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getPriorityColor(
                            t.priority,
                          )}`}
                        >
                          {t.priority}
                        </span>
                        {t.dueDate && (
                          <span className="text-[10px] flex items-center gap-1 text-slate-500">
                            <Calendar size={10} />{' '}
                            {new Date(t.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEdit(t)}
                      className="text-slate-300 hover:text-blue-500 p-1"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => deleteTask(t.id)}
                      className="text-slate-300 hover:text-red-500 p-1"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
};

const HabitsView = ({
  habits,
  addHabit,
  checkInHabit,
  deleteHabit,
}) => {
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    addHabit(name);
    setName('');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Habits</h2>
      <form
        onSubmit={handleSubmit}
        className="flex gap-2 bg-white p-4 rounded-xl shadow-sm border"
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 border p-2 rounded"
          placeholder="New Habit"
        />
        <button className="bg-indigo-600 text-white px-4 rounded font-bold">
          <Plus />
        </button>
      </form>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {habits.map((h) => {
          const isDone =
            h.lastCompleted === new Date().toDateString();
          return (
            <div
              key={h.id}
              className="bg-white p-4 rounded-2xl border flex flex-col justify-between h-40 relative group"
            >
              <button
                onClick={() => deleteHabit(h.id)}
                className="absolute top-2 right-2 text-slate-300 opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={16} />
              </button>
              <div>
                <h3 className="font-bold">{h.name}</h3>
                <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                  <Clock size={10} />
                  {h.lastCompleted
                    ? `Last: ${new Date(
                        h.lastCompleted,
                      ).toLocaleDateString()}`
                    : 'Not started yet'}
                </div>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-3xl font-black">
                    {h.streak}
                  </div>
                  <div className="text-xs text-slate-400">Streak</div>
                </div>
                <button
                  onClick={() => checkInHabit(h)}
                  disabled={isDone}
                  className={`p-3 rounded-full ${
                    isDone
                      ? 'bg-green-500 text-white'
                      : 'bg-slate-100 hover:bg-green-100 text-slate-400 hover:text-green-600'
                  }`}
                >
                  {isDone ? <CheckCircle /> : <Plus />}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
