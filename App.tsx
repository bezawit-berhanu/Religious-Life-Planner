
import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import TopBar from './components/TopBar';
import Auth from './components/Auth';
import Onboarding from './components/Onboarding';
import Dashboard from './views/Dashboard';
import Prayers from './views/Prayers';
import Journal from './views/Journal';
import Learn from './views/Learn';
import Focus from './views/Focus';
import Community from './views/Community';
import SettingsView from './views/Settings';
import Bible from './views/Bible';
import FastingCalendar from './views/FastingCalendar';
import { ViewState, Prayer, JournalEntry, UserPreferences, User, CommunityPost } from './types';
import { INITIAL_PRAYERS, MOCK_JOURNAL, RESOURCES, TODAY_FAST, MOCK_POSTS } from './constants';
import { t, storage } from './utils';
import { Cross } from 'lucide-react';

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  
  // State
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences>({
    privacyMode: false,
    notifications: true,
    communityEnabled: true,
    language: 'English',
    focusSound: 'Bell',
    theme: 'light'
  });

  // Theme Effect
  useEffect(() => {
    // Remove all theme classes first
    document.documentElement.classList.remove('dark', 'theme-black', 'theme-brown', 'theme-pink', 'theme-lavender', 'theme-cream');
    
    if (preferences.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (preferences.theme !== 'light') {
      document.documentElement.classList.add(`theme-${preferences.theme}`);
    }
  }, [preferences.theme]);

  // Splash Effect
  useEffect(() => {
    const timer = setTimeout(() => {
        setShowSplash(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // Check Session on Load
  useEffect(() => {
    const storedUser = storage.getUser();
    if (storedUser) {
        // Check for 1 week inactivity
        const oneWeek = 7 * 24 * 60 * 60 * 1000;
        if (Date.now() - storedUser.lastActive > oneWeek) {
            storage.clearUser();
            setUser(null);
        } else {
            setUser(storedUser);
            // On session restore, don't show onboarding (assume seen)
            setShowOnboarding(false);
        }
    }

    setPrayers(storage.getPrayers(INITIAL_PRAYERS));
    setJournalEntries(storage.getJournal(MOCK_JOURNAL));
    setPosts(storage.getPosts(MOCK_POSTS));
    setPreferences(storage.getPreferences({
        privacyMode: false,
        notifications: true,
        communityEnabled: true,
        language: 'English',
        focusSound: 'Bell',
        theme: 'light'
    }));
  }, []);

  // Save changes
  useEffect(() => {
    if (user) storage.saveUser(user);
  }, [user]);

  useEffect(() => {
    storage.savePrayers(prayers);
  }, [prayers]);

  useEffect(() => {
    storage.saveJournal(journalEntries);
  }, [journalEntries]);

  useEffect(() => {
    storage.savePreferences(preferences);
  }, [preferences]);
  
  useEffect(() => {
      storage.savePosts(posts);
  }, [posts]);


  const togglePrayer = (id: string) => {
    setPrayers(prev => prev.map(p => 
      p.id === id ? { ...p, completed: !p.completed } : p
    ));
  };

  const updatePrayers = (newPrayers: Prayer[]) => {
      setPrayers(newPrayers);
  }

  // Journal CRUD
  const addJournalEntry = (entry: Partial<JournalEntry>) => {
    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      title: entry.title || '',
      content: entry.content || '', // Rich text content
      tags: entry.tags || [],
      isLocked: entry.isLocked || false,
      pageColor: entry.pageColor || 'bg-white',
      updatedAt: Date.now()
    };
    setJournalEntries([newEntry, ...journalEntries]);
  };

  const updateJournalEntries = (entries: JournalEntry[]) => {
      setJournalEntries(entries);
  }

  const addPost = (content: string, image?: string, video?: string) => {
      if (!user) return;
      const newPost: CommunityPost = {
          id: Date.now().toString(),
          authorId: user.id,
          authorName: user.name,
          authorAvatar: user.name.charAt(0),
          authorImage: user.avatarUrl,
          content: content,
          imageUrl: image,
          videoUrl: video,
          timeAgo: 'Just now',
          likes: 0,
          comments: 0,
          likedByUser: false,
          timestamp: Date.now()
      };
      setPosts([newPost, ...posts]);
  }

  const deletePost = (id: string) => {
      setPosts(posts.filter(p => p.id !== id));
  }
  
  const updatePreference = (key: keyof UserPreferences, value: any) => {
      setPreferences(prev => ({...prev, [key]: value}));
  };
  
  const savePreferencesHandler = (newPrefs: UserPreferences) => {
      setPreferences(newPrefs);
  };

  const updateUser = (updatedUser: User) => {
      setUser(updatedUser);
  }

  const handleLogin = (loggedInUser: User, isNewUser: boolean) => {
      setUser(loggedInUser);
      storage.saveUser(loggedInUser); 
      setCurrentView(ViewState.DASHBOARD);
      // Only show onboarding for new registrations
      if (isNewUser) {
          setShowOnboarding(true);
      } else {
          setShowOnboarding(false);
      }
  };

  const handleLogout = () => {
      storage.clearUser();
      setUser(null);
  };

  const handleBack = () => {
      if (currentView !== ViewState.DASHBOARD) {
          setCurrentView(ViewState.DASHBOARD);
      }
  };

  const handleOnboardingComplete = () => {
      if (user) {
          const updatedUser = { ...user, hasSeenOnboarding: true };
          setUser(updatedUser);
          setShowOnboarding(false);
      }
  };

  const getPageTitle = (view: ViewState) => {
      const titles: Record<string, string> = {
          [ViewState.DASHBOARD]: 'Home',
          [ViewState.PRAYERS]: 'Pray',
          [ViewState.JOURNAL]: 'Journal',
          [ViewState.LEARN]: 'Library',
          [ViewState.FOCUS]: 'Focus',
          [ViewState.COMMUNITY]: 'Community',
          [ViewState.SETTINGS]: 'Settings',
          [ViewState.BIBLE]: 'Bible',
          [ViewState.FASTING]: 'Fasting'
      };
      return t(titles[view] || 'Orthodox', preferences.language);
  }

  // Splash Screen
  if (showSplash) {
      return (
          <div className="fixed inset-0 bg-ols-primary flex items-center justify-center z-[100] animate-fade-in">
              <div className="text-center">
                  <div className="w-24 h-24 border-4 border-ols-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                      <Cross size={48} className="text-white" />
                  </div>
                  <h1 className="font-serif text-3xl font-bold text-white tracking-widest animate-pulse">ORTHODOX</h1>
              </div>
          </div>
      );
  }

  if (!user) {
      return <Auth onLogin={handleLogin} />;
  }

  if (showOnboarding) {
      return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  const renderView = () => {
    switch (currentView) {
      case ViewState.DASHBOARD:
        return <Dashboard fastingRule={TODAY_FAST} prayers={prayers} setView={setCurrentView} privacyMode={preferences.privacyMode} lang={preferences.language} />;
      case ViewState.PRAYERS:
        return <Prayers prayers={prayers} togglePrayer={togglePrayer} updatePrayers={updatePrayers} lang={preferences.language} />;
      case ViewState.JOURNAL:
        return <Journal 
            entries={journalEntries} 
            addEntry={addJournalEntry} 
            updateEntries={updateJournalEntries} 
            privacyMode={preferences.privacyMode}
            preferences={preferences}
            savePreferences={savePreferencesHandler}
        />;
      case ViewState.LEARN:
        return <Learn resources={RESOURCES} lang={preferences.language} />;
      case ViewState.FOCUS:
        return <Focus />;
      case ViewState.COMMUNITY:
         if (!preferences.communityEnabled) return <Dashboard fastingRule={TODAY_FAST} prayers={prayers} setView={setCurrentView} privacyMode={preferences.privacyMode} lang={preferences.language} />;
         return <Community posts={posts} user={user!} addPost={addPost} deletePost={deletePost} updateUser={updateUser} />;
      case ViewState.BIBLE:
          return <Bible lang={preferences.language} />;
      case ViewState.FASTING:
          return <FastingCalendar lang={preferences.language} />;
      case ViewState.SETTINGS:
        return <SettingsView 
            preferences={preferences} 
            updatePreference={updatePreference} 
            user={user!} 
            updateUser={updateUser}
            onLogout={handleLogout} 
        />;
      default:
        return <Dashboard fastingRule={TODAY_FAST} prayers={prayers} setView={setCurrentView} privacyMode={preferences.privacyMode} lang={preferences.language} />;
    }
  };

  return (
    <div className="min-h-screen bg-ols-bg text-ols-text font-sans">
      <div className="flex">
          <Navigation 
            currentView={currentView} 
            setView={setCurrentView} 
            communityEnabled={preferences.communityEnabled}
            lang={preferences.language}
          />
          
          <main className="flex-1 w-full md:ml-64 relative">
             {currentView !== ViewState.FOCUS && (
                 <TopBar 
                    setView={setCurrentView} 
                    title={getPageTitle(currentView)} 
                    onBack={currentView !== ViewState.DASHBOARD ? handleBack : undefined}
                 />
             )}
             <div className="p-4 md:p-8 max-w-4xl mx-auto">
                {renderView()}
             </div>
          </main>
      </div>
    </div>
  );
};

export default App;
