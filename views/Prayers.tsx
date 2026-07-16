import React, { useState } from 'react';
import { Prayer } from '../types';
import { CheckCircle2, Circle, Clock, Plus, Trash2, X } from 'lucide-react';
import { t } from '../utils';

interface PrayersProps {
  prayers: Prayer[];
  togglePrayer: (id: string) => void;
  updatePrayers: (prayers: Prayer[]) => void;
  lang: 'English' | 'Amharic';
}

const Prayers: React.FC<PrayersProps> = ({ prayers, togglePrayer, updatePrayers, lang }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDuration, setNewDuration] = useState('10');
  const [newTime, setNewTime] = useState<'Morning'|'Noon'|'Evening'|'Night'>('Morning');

  const groupedPrayers = {
    Morning: prayers.filter(p => p.timeOfDay === 'Morning'),
    Noon: prayers.filter(p => p.timeOfDay === 'Noon'),
    Evening: prayers.filter(p => p.timeOfDay === 'Evening'),
    Night: prayers.filter(p => p.timeOfDay === 'Night'),
  };

  const deletePrayer = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      const updated = prayers.filter(p => p.id !== id);
      updatePrayers(updated);
  }

  const handleAdd = () => {
      if (!newTitle.trim()) return;
      const newPrayer: Prayer = {
          id: Date.now().toString(),
          title: newTitle,
          timeOfDay: newTime,
          durationMinutes: parseInt(newDuration) || 5,
          completed: false
      };
      updatePrayers([...prayers, newPrayer]);
      setNewTitle('');
      setIsAdding(false);
  }

  return (
    <div className="pb-20 space-y-8 animate-fade-in">
      <div className="text-center py-6 relative">
        <h2 className="font-serif text-3xl font-bold text-ols-primary">{t('Daily Prayer', lang)}</h2>
        <p className="text-ols-muted mt-2">"Lord Jesus Christ, Son of God, have mercy on me."</p>
        <button 
            onClick={() => setIsAdding(!isAdding)}
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-ols-primary text-white p-2 rounded-full shadow-lg"
        >
            {isAdding ? <X size={20} /> : <Plus size={20} />}
        </button>
      </div>

      {isAdding && (
          <div className="bg-white p-4 rounded-xl shadow-md border border-ols-primary/20 animate-fade-in">
              <h3 className="font-bold text-ols-primary mb-3">{t('Add Prayer', lang)}</h3>
              <input 
                className="w-full p-2 border rounded mb-2"
                placeholder={t('Title', lang)}
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
              />
              <div className="flex gap-2 mb-4">
                  <select 
                    className="p-2 border rounded flex-1"
                    value={newTime}
                    onChange={e => setNewTime(e.target.value as any)}
                  >
                      <option value="Morning">Morning</option>
                      <option value="Noon">Noon</option>
                      <option value="Evening">Evening</option>
                      <option value="Night">Night</option>
                  </select>
                  <input 
                    type="number"
                    className="p-2 border rounded w-20"
                    placeholder="Min"
                    value={newDuration}
                    onChange={e => setNewDuration(e.target.value)}
                  />
              </div>
              <button onClick={handleAdd} className="w-full bg-ols-secondary text-ols-primary font-bold py-2 rounded">
                  {t('Add Prayer', lang)}
              </button>
          </div>
      )}

      {(Object.keys(groupedPrayers) as Array<keyof typeof groupedPrayers>).map((timeOfDay) => (
        (groupedPrayers[timeOfDay].length > 0 || isAdding) && (
          <div key={timeOfDay} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-serif font-bold text-ols-primary">{timeOfDay}</h3>
              <span className="text-xs font-medium text-ols-muted uppercase tracking-wider">
                {groupedPrayers[timeOfDay].filter(p => p.completed).length}/{groupedPrayers[timeOfDay].length}
              </span>
            </div>
            <div className="divide-y divide-gray-50">
              {groupedPrayers[timeOfDay].map((prayer) => (
                <div 
                  key={prayer.id} 
                  onClick={() => togglePrayer(prayer.id)}
                  className="p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition-colors group relative"
                >
                  <div className={`transition-colors ${prayer.completed ? 'text-green-600' : 'text-gray-300 group-hover:text-ols-primary'}`}>
                    {prayer.completed ? <CheckCircle2 size={28} fill="#dcfce7" /> : <Circle size={28} />}
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-medium text-base ${prayer.completed ? 'text-gray-400 line-through' : 'text-ols-text'}`}>
                      {prayer.title}
                    </h4>
                    <div className="flex items-center gap-1 mt-1">
                        <Clock size={12} className="text-ols-muted" />
                        <span className="text-xs text-ols-muted">{prayer.durationMinutes} min</span>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => deletePrayer(prayer.id, e)}
                    className="text-red-300 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                      <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )
      ))}
    </div>
  );
};

export default Prayers;