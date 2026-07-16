import React, { useState, useEffect } from 'react';
import { Calendar, Shield, ChevronRight } from 'lucide-react';
import { FastingRule, Prayer, ViewState, Language } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { getEthiopianDate, formatDate, t, getCurrentFastingRule, getEvangelist, getEthDateObject } from '../utils';

interface DashboardProps {
  fastingRule: FastingRule; // Kept for prop interface compatibility, but we compute dynamically
  prayers: Prayer[];
  setView: (view: ViewState) => void;
  privacyMode: boolean;
  lang: Language;
}

const Dashboard: React.FC<DashboardProps> = ({ prayers, setView, privacyMode, lang }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  // Dynamically calculate the fasting rule based on current date
  const activeFastingRule = getCurrentFastingRule(currentDate, lang);
  const { year } = getEthDateObject(currentDate);
  const evangelist = getEvangelist(year, lang);

  useEffect(() => {
    const timer = setInterval(() => setCurrentDate(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const completedCount = prayers.filter(p => p.completed).length;
  const totalCount = prayers.length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const chartData = [
    { name: 'Completed', value: completedCount },
    { name: 'Remaining', value: totalCount - completedCount },
  ];
  
  const COLORS = ['#3E2723', '#d6d3d1']; 

  return (
    <div className="space-y-6 pb-20 animate-fade-in relative">
        
      {/* Date Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-ols-accent/20 flex items-center justify-between">
        <div className="flex-1">
            <p className="text-sm text-ols-secondary font-semibold uppercase tracking-wider mb-1 flex items-center gap-2">
                {t('Today', lang)}
            </p>
            <h2 className="text-2xl font-serif font-bold text-ols-primary">
                {formatDate(currentDate, lang)}
            </h2>
            <div className="flex items-center gap-2 mt-1">
                <p className="text-ols-muted text-sm font-medium text-ols-accent">
                    {getEthiopianDate(currentDate, lang)}
                </p>
                <span className="text-xs text-ols-muted">•</span>
                <p className="text-ols-muted text-xs font-medium uppercase tracking-wider">
                    {evangelist}
                </p>
            </div>
        </div>
        <div className="bg-ols-secondary/10 p-3 rounded-full">
             <Calendar className="text-ols-secondary" size={24} />
        </div>
      </div>

      {/* Fasting Status Card */}
      <div className="bg-gradient-to-br from-ols-primary to-[#2D1B18] text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
            <Shield size={100} />
        </div>
        <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
                 <div className="flex items-center gap-2">
                    <Shield size={18} className="text-ols-secondary" />
                    <span className="text-sm font-medium text-amber-100 uppercase tracking-wide">{t('Fasting Rule', lang)}</span>
                 </div>
                 <div className="bg-black/30 px-2 py-1 rounded text-xs text-amber-200 border border-amber-900/50">
                     {t(activeFastingRule.status || 'None', lang)}
                 </div>
            </div>
            
            <h3 className="text-2xl font-serif font-bold mb-1">{activeFastingRule.type}</h3>
            <p className="text-amber-100/80 text-sm mb-4">{activeFastingRule.description}</p>
            {activeFastingRule.feastName && (
                <div className="inline-block bg-ols-secondary/20 px-3 py-1 rounded-full text-xs font-medium text-ols-secondary border border-ols-secondary/30">
                    {activeFastingRule.feastName}
                </div>
            )}
            <button 
                onClick={() => setView(ViewState.FASTING)}
                className="block mt-4 text-xs underline text-amber-200 hover:text-white"
            >
                View Fasting Calendar
            </button>
        </div>
      </div>

      {/* Prayer Progress */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-ols-accent/20">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="font-serif font-bold text-lg text-ols-text">{t('Daily Prayer', lang)}</h3>
                </div>
                <button 
                    onClick={() => setView(ViewState.PRAYERS)}
                    className="text-ols-primary hover:bg-ols-accent/10 p-2 rounded-full transition-colors"
                >
                    <ChevronRight size={20} />
                </button>
            </div>
            
            <div className="flex items-center gap-6">
                <div className="h-24 w-24 relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                innerRadius={35}
                                outerRadius={45}
                                paddingAngle={5}
                                dataKey="value"
                                startAngle={90}
                                endAngle={-270}
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-bold text-ols-primary">{progress}%</span>
                    </div>
                </div>
                <div className="flex-1 space-y-2">
                    {prayers.slice(0, 3).map(prayer => (
                        <div key={prayer.id} className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${prayer.completed ? 'bg-ols-primary' : 'bg-gray-200'}`} />
                            <span className={`text-sm ${prayer.completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                                {prayer.title}
                            </span>
                        </div>
                    ))}
                    {prayers.length > 3 && <p className="text-xs text-ols-muted pl-4">+{prayers.length - 3} more</p>}
                </div>
            </div>
        </div>
    </div>
  );
};

export default Dashboard;