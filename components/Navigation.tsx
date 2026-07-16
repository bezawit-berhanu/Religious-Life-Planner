import React from 'react';
import { Home, Book, PenTool, Eye, GraduationCap, Settings, Users, Cross, Calendar, BookOpen } from 'lucide-react';
import { ViewState, Language } from '../types';
import { t } from '../utils';

interface NavigationProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  communityEnabled: boolean;
  lang: Language;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, setView, communityEnabled, lang }) => {
  const navItems = [
    { view: ViewState.DASHBOARD, icon: Home, label: t('Home', lang) },
    { view: ViewState.PRAYERS, icon: Book, label: t('Pray', lang) },
    { view: ViewState.BIBLE, icon: BookOpen, label: t('Bible', lang) },
    { view: ViewState.FASTING, icon: Calendar, label: t('Fasting', lang) },
    { view: ViewState.LEARN, icon: GraduationCap, label: t('Library', lang) },
    { view: ViewState.FOCUS, icon: Eye, label: t('Focus', lang) },
    { view: ViewState.JOURNAL, icon: PenTool, label: t('Journal', lang) },
  ];

  if (communityEnabled) {
      navItems.push({ view: ViewState.COMMUNITY, icon: Users, label: t('Community', lang) });
  }

  return (
    <>
      <div className="h-20 md:hidden" /> 
      
      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-ols-accent/20 px-2 py-2 pb-safe z-50 shadow-lg md:hidden overflow-x-auto">
        <div className="flex justify-between items-center min-w-max gap-4 px-2">
          {navItems.map((item) => (
            <button
              key={item.view}
              onClick={() => setView(item.view)}
              className={`flex flex-col items-center p-2 rounded-lg transition-colors min-w-[60px] ${
                currentView === item.view 
                  ? 'text-ols-primary bg-ols-primary/10' 
                  : 'text-gray-400 hover:text-ols-accent'
              }`}
            >
              <item.icon size={22} strokeWidth={currentView === item.view ? 2.5 : 2} />
              <span className="text-[10px] font-medium mt-1 truncate w-full text-center">{item.label}</span>
            </button>
          ))}
          {/* Settings icon for mobile in nav since topbar is cleaner */}
          <button
              onClick={() => setView(ViewState.SETTINGS)}
              className={`flex flex-col items-center p-2 rounded-lg transition-colors min-w-[60px] ${
                currentView === ViewState.SETTINGS
                  ? 'text-ols-primary bg-ols-primary/10' 
                  : 'text-gray-400 hover:text-ols-accent'
              }`}
            >
              <Settings size={22} />
              <span className="text-[10px] font-medium mt-1 truncate">{t('Settings', lang)}</span>
            </button>
        </div>
      </nav>

      {/* Desktop Sidebar */}
      <nav className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-64 bg-ols-primary text-white dark:text-ols-bg p-6 z-50 shadow-xl overflow-y-auto">
        <div className="mb-10 flex items-center gap-3">
            <div className="w-10 h-10 bg-ols-secondary rounded-full flex items-center justify-center font-serif font-bold text-xl text-ols-primary border-2 border-white/20">
                <Cross size={20} />
            </div>
            <h1 className="font-serif text-xl font-bold tracking-wide">{t('Orthodox', lang)}</h1>
        </div>
        
        <div className="space-y-2 flex-1">
          {navItems.map((item) => (
            <button
              key={item.view}
              onClick={() => setView(item.view)}
              className={`flex items-center gap-4 p-3 rounded-lg w-full transition-all ${
                currentView === item.view 
                  ? 'bg-white/10 text-ols-secondary font-semibold shadow-inner border-l-4 border-ols-secondary' 
                  : 'text-ols-bg/70 hover:bg-white/5 hover:text-white dark:text-ols-bg/70 dark:hover:text-ols-bg'
              }`}
            >
              <item.icon size={20} />
              <span className="text-sm tracking-wide">{item.label}</span>
            </button>
          ))}
        </div>

        <button
           onClick={() => setView(ViewState.SETTINGS)}
           className={`flex items-center gap-4 p-3 rounded-lg w-full transition-all mt-auto ${
             currentView === ViewState.SETTINGS
               ? 'bg-white/10 text-ols-secondary font-semibold' 
               : 'text-ols-bg/70 hover:bg-white/5 dark:text-ols-bg/70 dark:hover:text-ols-bg'
           }`}
        >
            <Settings size={20} />
            <span className="text-sm">{t('Settings', lang)}</span>
        </button>
      </nav>
    </>
  );
};

export default Navigation;