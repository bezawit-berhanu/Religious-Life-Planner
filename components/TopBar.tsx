import React from 'react';
import { Settings, Bell, ArrowLeft } from 'lucide-react';
import { ViewState } from '../types';

interface TopBarProps {
  setView: (view: ViewState) => void;
  title: string;
  onBack?: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ setView, title, onBack }) => {
  return (
    <header className="sticky top-0 z-40 bg-ols-bg/95 backdrop-blur-sm border-b border-gray-200/50 px-4 py-4 flex justify-between items-center shadow-sm">
      <div className="flex items-center gap-3">
        {onBack && (
            <button 
                onClick={onBack}
                className="p-1 rounded-full hover:bg-black/5 text-ols-primary transition-colors"
            >
                <ArrowLeft size={24} />
            </button>
        )}
        <h1 className="font-serif text-xl font-bold text-ols-primary truncate">{title}</h1>
      </div>
      <div className="flex gap-4">
        <button className="text-ols-muted hover:text-ols-primary transition-colors">
            <Bell size={22} />
        </button>
        <button 
            onClick={() => setView(ViewState.SETTINGS)}
            className="text-ols-muted hover:text-ols-primary transition-colors"
        >
            <Settings size={22} />
        </button>
      </div>
    </header>
  );
};

export default TopBar;