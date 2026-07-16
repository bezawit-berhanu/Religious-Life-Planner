import React, { useState } from 'react';
import { Resource, Language } from '../types';
import { getIconForResourceType } from '../constants';
import { Search, BookOpen, Video, Headphones, Grid, ExternalLink, Lock } from 'lucide-react';
import { t } from '../utils';

interface LearnProps {
  resources: Resource[];
  lang: Language;
}

type TabType = 'All' | 'Book' | 'Video' | 'Audio';

const Learn: React.FC<LearnProps> = ({ resources, lang }) => {
  const [activeTab, setActiveTab] = useState<TabType>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredResources = resources.filter(
      r => (activeTab === 'All' || r.type === activeTab) &&
           (r.title.toLowerCase().includes(searchQuery.toLowerCase()) || r.author.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleWebSearch = () => {
      const q = encodeURIComponent(`Ethiopian Orthodox ${searchQuery}`);
      window.open(`https://www.google.com/search?q=${q}`, '_blank');
  };

  const TabButton = ({ type, icon: Icon }: { type: TabType, icon: any }) => (
      <button 
        onClick={() => setActiveTab(type)}
        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
            activeTab === type 
            ? 'bg-ols-primary text-white shadow-md' 
            : 'bg-white dark:bg-ols-surface border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-ols-bg'
        }`}
      >
          <Icon size={16} />
          {t(type === 'All' ? 'Resources' : type + 's', lang)}
      </button>
  );

  const renderContent = () => (
    <div className="pb-20 space-y-6">
        <div className="bg-ols-primary text-white p-6 rounded-2xl relative overflow-hidden shadow-lg">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <BookOpen size={100} />
            </div>
            <div className="relative z-10">
                <h2 className="font-serif text-2xl font-bold mb-2">{t('Library', lang)}</h2>
                <p className="text-ols-bg/80 text-sm max-w-sm">Access holy books, mezmurs, and teachings of the fathers.</p>
                
                <div className="mt-6 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ols-primary" size={18} />
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t('Search', lang) + "..."}
                        className="w-full pl-10 pr-4 py-3 bg-white text-ols-text rounded-xl focus:outline-none focus:ring-2 focus:ring-ols-secondary border-none placeholder-gray-400"
                    />
                </div>
            </div>
        </div>

        <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
            <TabButton type="All" icon={Grid} />
            <TabButton type="Book" icon={BookOpen} />
            <TabButton type="Video" icon={Video} />
            <TabButton type="Audio" icon={Headphones} />
        </div>

        {filteredResources.length === 0 && searchQuery && (
            <div className="text-center py-10 bg-white dark:bg-ols-surface rounded-xl border border-dashed border-gray-300 dark:border-gray-800">
                <p className="text-ols-muted mb-4">No results found in library.</p>
                <button 
                    onClick={handleWebSearch}
                    className="flex items-center gap-2 mx-auto px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                >
                    <Search size={16} />
                    {t('Search Web', lang)}
                </button>
            </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredResources.map((resource) => (
            <div key={resource.id} className="bg-white dark:bg-ols-surface rounded-xl shadow-sm border border-ols-accent/20 overflow-hidden hover:shadow-md transition-shadow cursor-pointer group flex flex-col h-full">
                <div className="h-40 bg-gray-200 dark:bg-gray-800 relative overflow-hidden">
                    <img src={resource.imageUrl} alt={resource.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-2 right-2 bg-black/50 backdrop-blur px-2 py-1 rounded text-xs font-bold text-white flex items-center gap-1 border border-white/20">
                        {getIconForResourceType(resource.type)}
                        {resource.type}
                    </div>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                    <span className="text-xs font-semibold text-ols-secondary uppercase tracking-wider mb-1">{resource.category}</span>
                    <h3 className="font-serif font-bold text-ols-primary text-lg leading-tight mb-2 dark:text-gray-100">{resource.title}</h3>
                    <p className="text-sm text-ols-muted mb-4 flex-1">By {resource.author}</p>
                    
                    <button className="w-full py-2 rounded-lg border border-ols-primary text-ols-primary font-medium text-sm hover:bg-ols-primary hover:text-white transition-colors flex items-center justify-center gap-2">
                        {resource.type === 'Book' ? 'Read Now' : resource.type === 'Audio' ? 'Listen' : 'Watch'}
                        <ExternalLink size={14} />
                    </button>
                </div>
            </div>
            ))}
        </div>
    </div>
  );

  return (
    <div className="relative animate-fade-in h-[calc(100vh-140px)] overflow-hidden rounded-2xl">
        {/* Locked Overlay */}
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/40 dark:bg-ols-bg/40 backdrop-blur-md">
            <div className="bg-white dark:bg-ols-surface p-8 rounded-3xl shadow-xl flex flex-col items-center text-center border border-gray-200 dark:border-gray-800 max-w-sm mx-4">
                <div className="w-16 h-16 bg-ols-primary/10 rounded-full flex items-center justify-center mb-4">
                    <Lock className="text-ols-primary" size={32} />
                </div>
                <h2 className="font-serif text-2xl font-bold text-ols-primary">Currently On Work</h2>
            </div>
        </div>

        {/* Blurred Content */}
        <div className="pointer-events-none select-none blur-md opacity-40 h-full overflow-hidden">
            {renderContent()}
        </div>
    </div>
  );
};

export default Learn;