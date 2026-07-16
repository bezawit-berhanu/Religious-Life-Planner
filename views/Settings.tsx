import React, { useState } from 'react';
import { UserPreferences, User, Language, Gender } from '../types';
import { Shield, Bell, Globe, User as UserIcon, LogOut, Users, Check, Edit2, Volume2 } from 'lucide-react';
import { t } from '../utils';

interface SettingsProps {
  preferences: UserPreferences;
  updatePreference: (key: keyof UserPreferences, value: any) => void;
  user: User;
  updateUser: (user: User) => void;
  onLogout: () => void;
}

const SettingsView: React.FC<SettingsProps> = ({ preferences, updatePreference, user, updateUser, onLogout }) => {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [tempName, setTempName] = useState(user.name);
  const [tempUsername, setTempUsername] = useState(user.username || '');
  const [tempAge, setTempAge] = useState(user.age);
  const [tempGender, setTempGender] = useState<Gender>(user.gender);

  const saveProfile = () => {
      updateUser({ 
          ...user, 
          name: tempName,
          username: tempUsername,
          age: tempAge,
          gender: tempGender
      });
      setIsEditingProfile(false);
  }

  return (
    <div className="pb-20 space-y-6 animate-fade-in">
        <div className="bg-white dark:bg-ols-surface p-6 rounded-2xl shadow-sm border border-ols-accent/20">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-ols-primary">{t('Profile', preferences.language)}</h3>
                <button 
                    onClick={() => isEditingProfile ? saveProfile() : setIsEditingProfile(true)}
                    className="text-ols-secondary hover:text-ols-primary"
                >
                    {isEditingProfile ? <Check size={20} /> : <Edit2 size={20} />}
                </button>
            </div>
            
            <div className="flex items-center gap-4">
                <div className="relative">
                    <div className="w-16 h-16 bg-ols-primary/10 rounded-full flex items-center justify-center text-ols-primary border border-ols-primary/20 overflow-hidden">
                        {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <UserIcon size={32} />
                        )}
                    </div>
                    {isEditingProfile && (
                        <label className="absolute bottom-0 right-0 bg-ols-primary text-white p-1 rounded-full cursor-pointer shadow-sm hover:bg-ols-secondary transition-colors">
                            <Edit2 size={12} />
                            <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                            updateUser({ ...user, avatarUrl: reader.result as string });
                                        };
                                        reader.readAsDataURL(file);
                                    }
                                }}
                            />
                        </label>
                    )}
                </div>
                <div className="flex-1">
                    {isEditingProfile ? (
                        <div className="space-y-3">
                            <input 
                                value={tempName}
                                onChange={(e) => setTempName(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white bg-white dark:bg-ols-bg"
                                placeholder="Name"
                            />
                             <input 
                                value={tempUsername}
                                onChange={(e) => setTempUsername(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white bg-white dark:bg-ols-bg"
                                placeholder="Username"
                            />
                            <div className="flex gap-2">
                                <input 
                                    type="number"
                                    value={tempAge}
                                    onChange={(e) => setTempAge(parseInt(e.target.value))}
                                    className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white bg-white dark:bg-ols-bg"
                                    placeholder="Age"
                                />
                                <select
                                    value={tempGender}
                                    onChange={(e) => setTempGender(e.target.value as Gender)}
                                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white bg-white dark:bg-ols-bg"
                                >
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <h2 className="font-serif font-bold text-lg text-ols-primary">{user.name}</h2>
                            <p className="text-sm text-ols-muted">@{user.username}</p>
                            <p className="text-ols-muted text-xs mt-1">{user.email}</p>
                            <div className="flex gap-3 mt-2 text-xs font-medium text-ols-accent">
                                <span>{user.age} {t('Age', preferences.language)}</span>
                                <span>•</span>
                                <span>{t(user.gender, preferences.language)}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>

        <div className="bg-white dark:bg-ols-surface rounded-2xl shadow-sm border border-ols-accent/20 overflow-hidden">
             <div className="p-4 bg-ols-bg dark:bg-ols-bg/50 border-b border-ols-accent/10">
                 <h3 className="font-bold text-ols-muted text-xs uppercase tracking-wider">{t('Settings', preferences.language)}</h3>
             </div>
             <div className="divide-y divide-gray-100">
                <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Globe className="text-ols-accent" size={20} />
                        <span className="text-ols-text font-medium">{t('Theme', preferences.language)}</span>
                    </div>
                    <select 
                        value={preferences.theme || 'light'}
                        onChange={(e) => updatePreference('theme', e.target.value)}
                        className="bg-transparent text-right text-ols-primary font-medium focus:outline-none"
                    >
                        <option value="light">{t('Light Mode', preferences.language)}</option>
                        <option value="dark">{t('Dark Mode', preferences.language)}</option>
                        <option value="black">Black</option>
                        <option value="brown">Brown</option>
                        <option value="pink">Pink</option>
                        <option value="lavender">Lavender</option>
                        <option value="cream">Cream White</option>
                    </select>
                </div>

                <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Users className="text-ols-accent" size={20} />
                        <span className="text-ols-text font-medium">{t('Community Page', preferences.language)}</span>
                    </div>
                    <button 
                        onClick={() => updatePreference('communityEnabled', !preferences.communityEnabled)}
                        className={`w-12 h-6 rounded-full transition-colors relative ${preferences.communityEnabled ? 'bg-ols-primary' : 'bg-gray-200'}`}
                    >
                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${preferences.communityEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                </div>

                <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Globe className="text-ols-accent" size={20} />
                        <span className="text-ols-text font-medium">{t('Language', preferences.language)}</span>
                    </div>
                    <select 
                        value={preferences.language}
                        onChange={(e) => updatePreference('language', e.target.value as Language)}
                        className="bg-transparent text-right text-ols-primary font-medium focus:outline-none"
                    >
                        <option value="English">English</option>
                        <option value="Amharic">አማርኛ</option>
                    </select>
                </div>
             </div>
        </div>

        <div className="bg-white dark:bg-ols-surface rounded-2xl shadow-sm border border-ols-accent/20 overflow-hidden">
             <div className="p-4 bg-ols-bg dark:bg-ols-bg/50 border-b border-ols-accent/10">
                 <h3 className="font-bold text-ols-muted text-xs uppercase tracking-wider">Privacy & Notifications</h3>
             </div>
             <div className="divide-y divide-gray-100">
                <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Shield className="text-ols-accent" size={20} />
                        <div>
                            <span className="text-ols-text font-medium block">{t('Privacy Mode', preferences.language)}</span>
                        </div>
                    </div>
                    <button 
                        onClick={() => updatePreference('privacyMode', !preferences.privacyMode)}
                        className={`w-12 h-6 rounded-full transition-colors relative ${preferences.privacyMode ? 'bg-ols-primary' : 'bg-gray-200'}`}
                    >
                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${preferences.privacyMode ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                </div>
                
                <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Bell className="text-ols-accent" size={20} />
                         <div>
                            <span className="text-ols-text font-medium block">Notifications</span>
                        </div>
                    </div>
                    <button 
                        onClick={() => updatePreference('notifications', !preferences.notifications)}
                        className={`w-12 h-6 rounded-full transition-colors relative ${preferences.notifications ? 'bg-ols-primary' : 'bg-gray-200'}`}
                    >
                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${preferences.notifications ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                </div>

                <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Volume2 className="text-ols-accent" size={20} />
                        <div>
                            <span className="text-ols-text font-medium block">{t('Focus Sound', preferences.language)}</span>
                        </div>
                    </div>
                    <select 
                        value={preferences.focusSound || 'Bell'}
                        onChange={(e) => updatePreference('focusSound', e.target.value)}
                        className="bg-transparent text-right text-ols-primary font-medium focus:outline-none"
                    >
                        <option value="Bell">Bell</option>
                        <option value="Chime">Chime</option>
                        <option value="Silence">Silence</option>
                    </select>
                </div>
             </div>
        </div>
        
        <button 
            onClick={onLogout}
            className="w-full p-4 flex items-center justify-center gap-2 text-red-600 font-medium hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors border border-red-100 dark:border-red-900/30 bg-white dark:bg-ols-surface"
        >
            <LogOut size={20} />
            {t('Sign Out', preferences.language)}
        </button>
    </div>
  );
};

export default SettingsView;