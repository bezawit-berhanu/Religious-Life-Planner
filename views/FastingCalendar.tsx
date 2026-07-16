import React, { useState, useEffect } from 'react';
import { Calendar, Shield, ChevronLeft, ChevronRight, X, Edit, Star, Check } from 'lucide-react';
import { Language, FastingLog } from '../types';
import { t, getSaintForDay, storage, getCalendarGrid, getHoliday, isFastingDayOfWeek, isPentecost, getEthDateObject, getFastingDates } from '../utils';

interface FastingCalendarProps {
    lang: Language;
}

const FastingCalendar: React.FC<FastingCalendarProps> = ({ lang }) => {
    const [selectedYear, setSelectedYear] = useState(2018); 
    const [selectedMonth, setSelectedMonth] = useState(5); // Default Yekatit (Index 5)
    const [selectedDayDetails, setSelectedDayDetails] = useState<{day: number, month: number, year: number} | null>(null);
    const [selectedFastForTracking, setSelectedFastForTracking] = useState<{name: string} | null>(null);
    const [mood, setMood] = useState<'Peaceful'|'Neutral'|'Struggle'>('Peaceful');
    const [rating, setRating] = useState(5);
    const [notes, setNotes] = useState('');
    const [logs, setLogs] = useState<FastingLog[]>([]);
    
    // Get current Eth Date components for Status Check
    const today = new Date();
    const ethToday = getEthDateObject(today);

    // Sync selected year/month with today on mount
    useEffect(() => {
        if (ethToday.year >= 2015 && ethToday.year <= 2025) {
            setSelectedYear(ethToday.year);
            setSelectedMonth(ethToday.month);
        }
    }, []);

    useEffect(() => {
        setLogs(storage.getFastingLogs());
    }, []);

    const saveLog = () => {
        if (!selectedFastForTracking) return;
        const newLog: FastingLog = {
            id: Date.now().toString(),
            fastName: selectedFastForTracking.name,
            date: new Date().toISOString(),
            mood,
            rating,
            notes
        };
        const updatedLogs = [newLog, ...logs];
        setLogs(updatedLogs);
        storage.saveFastingLogs(updatedLogs);
        setSelectedFastForTracking(null);
        setNotes('');
        setRating(5);
    };

    const ETH_MONTHS = lang === 'Amharic' ? 
        ['መስከረም', 'ጥቅምት', 'ኅዳር', 'ታኅሣሥ', 'ጥር', 'የካቲት', 'መጋቢት', 'ሚያዝያ', 'ግንቦት', 'ሰኔ', 'ሐምሌ', 'ነሐሴ', 'ጳጉሜ'] :
        ['Meskerem', 'Tikimt', 'Hidar', 'Tahsas', 'Tir', 'Yekatit', 'Megabit', 'Miyazia', 'Ginbot', 'Sene', 'Hamle', 'Nehase', 'Pagume'];

    const YEARS = Array.from({length: 11}, (_, i) => 2015 + i); // 2015 to 2025 E.C. (Small range for robust math)

    // Accurate Grid Generation
    const gridData = getCalendarGrid(selectedYear, selectedMonth);

    // Gregorian converter
    const getGregorianFromEth = (d: number, m: number, y: number) => {
        const startOfEthYearGC = new Date(y + 7, 8, 11);
        const daysToAdd = (m * 30) + d - 1; 
        const result = new Date(startOfEthYearGC);
        result.setDate(result.getDate() + daysToAdd);
        return result.toLocaleDateString(lang === 'Amharic' ? 'am-ET' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }

    const handleDayClick = (day: number) => {
        setSelectedDayDetails({ day, month: selectedMonth, year: selectedYear });
    };

    // Fasting Status Logic
    const getStatus = (startMonth: number, startDay: number, endMonth: number, endDay: number): 'Current' | 'Upcoming' | 'Done' | 'None' => {
        // Only show status if viewing the current year
        if (selectedYear !== ethToday.year) return 'None';

        const currentDOY = ethToday.month * 30 + ethToday.day;
        const startDOY = startMonth * 30 + startDay;
        const endDOY = endMonth * 30 + endDay;

        if (currentDOY >= startDOY && currentDOY <= endDOY) return 'Current';
        if (startDOY > currentDOY && (startDOY - currentDOY) <= 14) return 'Upcoming';
        if (currentDOY > endDOY) return 'Done';

        return 'None';
    };

    const dynamicFasts = getFastingDates(selectedYear);
    
    const formatFastDate = (start: {month: number, day: number}, end: {month: number, day: number}) => {
        const m1 = ETH_MONTHS[start.month];
        const m2 = ETH_MONTHS[end.month];
        if (start.month === end.month && start.day === end.day) return `${m1} ${start.day}`;
        if (start.month === end.month) return `${m1} ${start.day} - ${end.day}`;
        return `${m1} ${start.day} - ${m2} ${end.day}`;
    };

    const fasts = dynamicFasts ? [
        { 
            name: lang === 'Amharic' ? 'የነቢያት ጾም (Tsome Nebiyat)' : 'Fast of Prophets (Tsome Nebiyat)', 
            dates: formatFastDate(dynamicFasts.prophets.start, dynamicFasts.prophets.end),
            status: getStatus(dynamicFasts.prophets.start.month, dynamicFasts.prophets.start.day, dynamicFasts.prophets.end.month, dynamicFasts.prophets.end.day)
        },
        { 
            name: lang === 'Amharic' ? 'ጾመ ጋድ (Tsome Gehad)' : 'Tsome Gehad', 
            dates: formatFastDate(dynamicFasts.gehad.start, dynamicFasts.gehad.end),
            status: getStatus(dynamicFasts.gehad.start.month, dynamicFasts.gehad.start.day, dynamicFasts.gehad.end.month, dynamicFasts.gehad.end.day)
        },
        { 
            name: lang === 'Amharic' ? 'ጾመ ነነዌ (Tsome Nenewe)' : 'Fast of Nineveh', 
            dates: formatFastDate(dynamicFasts.nenewe.start, dynamicFasts.nenewe.end),
            status: getStatus(dynamicFasts.nenewe.start.month, dynamicFasts.nenewe.start.day, dynamicFasts.nenewe.end.month, dynamicFasts.nenewe.end.day)
        },
        { 
            name: lang === 'Amharic' ? 'ዓቢይ ጾም (Abiy Tsom)' : 'Great Lent (Abiy Tsom)', 
            dates: formatFastDate(dynamicFasts.abiyTsom.start, dynamicFasts.abiyTsom.end),
            status: getStatus(dynamicFasts.abiyTsom.start.month, dynamicFasts.abiyTsom.start.day, dynamicFasts.abiyTsom.end.month, dynamicFasts.abiyTsom.end.day)
        },
        { 
            name: lang === 'Amharic' ? 'የሐዋርያት ጾም (Tsome Hawaryat)' : 'Fast of the Apostles', 
            dates: formatFastDate(dynamicFasts.apostles.start, dynamicFasts.apostles.end),
            status: getStatus(dynamicFasts.apostles.start.month, dynamicFasts.apostles.start.day, dynamicFasts.apostles.end.month, dynamicFasts.apostles.end.day)
        },
        { 
            name: lang === 'Amharic' ? 'ጾመ ፍልሰታ (Tsome Filseta)' : 'Fast of the Assumption', 
            dates: formatFastDate(dynamicFasts.filseta.start, dynamicFasts.filseta.end),
            status: getStatus(dynamicFasts.filseta.start.month, dynamicFasts.filseta.start.day, dynamicFasts.filseta.end.month, dynamicFasts.filseta.end.day)
        }
    ] : [];

    const getStatusColor = (status: string) => {
        switch(status) {
            case 'Current': return 'bg-green-500 text-white';
            case 'Upcoming': return 'bg-amber-500 text-white';
            case 'Done': return 'bg-gray-400 text-white';
            default: return 'bg-gray-200 text-gray-500 hidden';
        }
    };

    const getFastStart = (d: number, m: number) => {
        if (!dynamicFasts) return null;
        if (dynamicFasts.prophets.start.day === d && dynamicFasts.prophets.start.month === m) return { en: 'Prophets Fast', am: 'የነቢያት ጾም' };
        if (dynamicFasts.gehad.start.day === d && dynamicFasts.gehad.start.month === m) return { en: 'Gehad', am: 'ገሀድ' };
        if (dynamicFasts.nenewe.start.day === d && dynamicFasts.nenewe.start.month === m) return { en: 'Nineveh', am: 'ነነዌ' };
        if (dynamicFasts.abiyTsom.start.day === d && dynamicFasts.abiyTsom.start.month === m) return { en: 'Great Lent', am: 'ዓቢይ ጾም' };
        if (dynamicFasts.apostles.start.day === d && dynamicFasts.apostles.start.month === m) return { en: 'Apostles Fast', am: 'የሐዋርያት ጾም' };
        if (dynamicFasts.filseta.start.day === d && dynamicFasts.filseta.start.month === m) return { en: 'Filseta', am: 'ፍልሰታ' };
        return null;
    };

    return (
        <div className="pb-20 space-y-6 animate-fade-in relative">
             <div className="flex items-center justify-between mb-4">
                <div>
                     <h2 className="font-serif text-2xl font-bold text-ols-primary">{t('Fasting', lang)}</h2>
                     <p className="text-sm text-ols-muted">{selectedYear} E.C.</p>
                </div>
                <Calendar size={24} className="text-ols-primary" />
            </div>

            {/* Controls */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                <select 
                    value={selectedYear} 
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="p-2 rounded-lg border border-ols-accent/30 bg-white text-ols-primary font-bold focus:outline-none"
                >
                    {YEARS.map(y => <option key={y} value={y}>{y} E.C.</option>)}
                </select>
                <select 
                    value={selectedMonth} 
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    className="p-2 rounded-lg border border-ols-accent/30 bg-white text-ols-primary font-bold focus:outline-none flex-1"
                >
                    {ETH_MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
                </select>
            </div>

            {/* Calendar Grid */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-ols-accent/20">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-ols-primary">{ETH_MONTHS[selectedMonth]} {selectedYear}</h3>
                    <div className="flex gap-1">
                        <button onClick={() => setSelectedMonth(m => Math.max(0, m - 1))}><ChevronLeft size={20} className="text-gray-400 hover:text-ols-primary"/></button>
                        <button onClick={() => setSelectedMonth(m => Math.min(12, m + 1))}><ChevronRight size={20} className="text-gray-400 hover:text-ols-primary"/></button>
                    </div>
                </div>
                
                <div className="grid grid-cols-7 gap-1 text-center mb-2">
                    {/* Simplified Weekdays: Sun, Mon, Tue, Wed, Thu, Fri, Sat */}
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                        <div key={d} className="text-xs font-bold text-gray-400">{d}</div>
                    ))}
                </div>
                
                <div className="grid grid-cols-7 gap-1">
                    {/* Start Offset */}
                    {Array.from({ length: gridData.startDay }).map((_, i) => <div key={`empty-${i}`} />)}
                    
                    {/* Days */}
                    {Array.from({ length: gridData.days }).map((_, i) => {
                        const d = i + 1;
                        const holiday = getHoliday(d, selectedMonth);
                        const fastStart = getFastStart(d, selectedMonth);
                        // Check fasting rules (Wed/Fri)
                        const isWedFri = isFastingDayOfWeek(selectedYear, selectedMonth, d);
                        const isPentecostDay = isPentecost(selectedYear, selectedMonth, d);
                        const isFasting = isWedFri && !isPentecostDay;
                        
                        // Check if this day is TODAY
                        const isToday = d === ethToday.day && selectedMonth === ethToday.month && selectedYear === ethToday.year;

                        let bgClass = 'hover:bg-gray-100 text-gray-700';
                        // Prioritize Today's highlight
                        if (isToday) {
                            bgClass = 'bg-ols-primary text-white border-2 border-ols-secondary font-bold shadow-md';
                        } else if (holiday?.type === 'Religious') {
                            bgClass = 'bg-red-50 text-red-600 border border-red-200 font-bold';
                        } else if (holiday?.type === 'National') {
                            bgClass = 'bg-amber-50 text-amber-700 border border-amber-200 font-bold';
                        } else if (fastStart) {
                            bgClass = 'bg-purple-50 text-purple-700 border border-purple-200 font-bold';
                        } else if (isFasting) {
                            bgClass = 'bg-green-50 text-green-700 border border-green-100';
                        }

                        return (
                            <button 
                                key={d} 
                                onClick={() => handleDayClick(d)}
                                className={`aspect-square flex flex-col items-center justify-center rounded-lg text-sm transition-colors relative ${bgClass}`}
                            >
                                <span className="z-10">{d}</span>
                                {holiday && !isToday && <div className={`w-1 h-1 rounded-full absolute bottom-1 ${holiday.type === 'Religious' ? 'bg-red-500' : 'bg-amber-500'}`}></div>}
                                {fastStart && !isToday && <span className="text-[6px] uppercase tracking-wide opacity-80 mt-[-2px] truncate w-full px-1">{lang === 'Amharic' ? fastStart.am : fastStart.en}</span>}
                                {isToday && <span className="text-[8px] uppercase tracking-wide opacity-80 mt-[-2px]">{t('Today', lang)}</span>}
                            </button>
                        );
                    })}
                </div>
            </div>

             {/* Selected Day Modal */}
             {selectedDayDetails && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl relative">
                        <button 
                            onClick={() => setSelectedDayDetails(null)}
                            className="absolute right-4 top-4 text-gray-400 hover:text-black"
                        >
                            <X size={24} />
                        </button>

                        <div className="text-center mb-6">
                            <span className="text-xs font-bold text-ols-secondary uppercase tracking-widest">{t('Day', lang)}</span>
                            <h2 className="text-4xl font-serif font-bold text-ols-primary mb-1">
                                {ETH_MONTHS[selectedDayDetails.month]} {selectedDayDetails.day}
                            </h2>
                            <p className="text-lg text-gray-600 font-serif">
                                {selectedDayDetails.year} E.C.
                            </p>
                        </div>

                        <div className="space-y-4">
                            {getHoliday(selectedDayDetails.day, selectedDayDetails.month) && (
                                <div className={`p-4 rounded-xl border ${getHoliday(selectedDayDetails.day, selectedDayDetails.month)?.type === 'Religious' ? 'bg-red-50 border-red-100 text-red-700' : 'bg-amber-50 border-amber-100 text-amber-700'}`}>
                                    <span className="text-xs font-bold block mb-1 uppercase">Holiday</span>
                                    <p className="font-bold text-lg">
                                        {getHoliday(selectedDayDetails.day, selectedDayDetails.month)?.name}
                                    </p>
                                </div>
                            )}

                            {getFastStart(selectedDayDetails.day, selectedDayDetails.month) && (
                                <div className="p-4 rounded-xl border bg-purple-50 border-purple-100 text-purple-700">
                                    <span className="text-xs font-bold block mb-1 uppercase">Fasting Entry</span>
                                    <p className="font-bold text-lg">
                                        {lang === 'Amharic' ? getFastStart(selectedDayDetails.day, selectedDayDetails.month)?.am : getFastStart(selectedDayDetails.day, selectedDayDetails.month)?.en}
                                    </p>
                                </div>
                            )}

                            <div className="bg-ols-bg p-4 rounded-xl border border-ols-accent/20">
                                <span className="text-xs font-bold text-ols-muted block mb-1">{t('Saint', lang)}</span>
                                <p className="font-bold text-ols-primary text-lg">
                                    {getSaintForDay(selectedDayDetails.day, lang) || (lang === 'Amharic' ? 'የቀኑ ቅዱስ' : 'Daily Saint')}
                                </p>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                <span className="text-xs font-bold text-gray-400 block mb-1">{t('Gregorian', lang)} Date</span>
                                <p className="font-medium text-gray-800">
                                    {getGregorianFromEth(selectedDayDetails.day, selectedDayDetails.month, selectedDayDetails.year)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Tracking Modal */}
            {selectedFastForTracking && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl relative">
                        <button 
                            onClick={() => setSelectedFastForTracking(null)}
                            className="absolute right-4 top-4 text-gray-400 hover:text-black"
                        >
                            <X size={24} />
                        </button>
                        
                        <h3 className="font-serif font-bold text-xl text-ols-primary mb-1">{selectedFastForTracking.name}</h3>
                        <p className="text-sm text-ols-muted mb-6">{t('How was your fast?', lang)}</p>
                        
                        <div className="space-y-4">
                             <div>
                                 <label className="block text-xs font-bold text-ols-muted uppercase mb-2">{t('Mood', lang)}</label>
                                 <div className="flex gap-2">
                                     {['Peaceful', 'Neutral', 'Struggle'].map((m) => (
                                         <button 
                                            key={m}
                                            onClick={() => setMood(m as any)}
                                            className={`flex-1 py-2 rounded-lg text-sm font-medium border ${mood === m ? 'bg-ols-primary text-white border-ols-primary' : 'bg-white border-gray-200 text-gray-600'}`}
                                         >
                                             {t(m, lang)}
                                         </button>
                                     ))}
                                 </div>
                             </div>
                             
                             <div>
                                 <label className="block text-xs font-bold text-ols-muted uppercase mb-2">{t('Rating', lang)}</label>
                                 <div className="flex justify-center gap-2">
                                     {[1, 2, 3, 4, 5].map(r => (
                                         <button key={r} onClick={() => setRating(r)} className="text-ols-secondary">
                                             <Star size={24} fill={r <= rating ? "currentColor" : "none"} strokeWidth={r <= rating ? 0 : 2} />
                                         </button>
                                     ))}
                                 </div>
                             </div>
                             
                             <div>
                                 <label className="block text-xs font-bold text-ols-muted uppercase mb-2">{t('Notes', lang)}</label>
                                 <textarea 
                                    className="w-full p-3 border border-gray-300 rounded-lg text-sm"
                                    rows={3}
                                    value={notes}
                                    onChange={e => setNotes(e.target.value)}
                                    placeholder="Write your reflections..."
                                 />
                             </div>
                             
                             <button 
                                onClick={saveLog}
                                className="w-full bg-ols-primary text-white py-3 rounded-xl font-bold hover:bg-[#3E2723]"
                             >
                                 {t('Save Entry', lang)}
                             </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Fasting List - Restored "Brown Thing" Style */}
            <div className="space-y-3">
                <h3 className="font-bold text-ols-primary text-lg">{t('Major Fasts', lang)}</h3>
                {fasts.map((fast, idx) => (
                    <div 
                        key={idx} 
                        onClick={() => setSelectedFastForTracking(fast)}
                        className="flex items-center justify-between p-4 bg-ols-primary text-white rounded-xl shadow-md cursor-pointer hover:bg-[#2D1B18] transition-colors border border-ols-secondary/20"
                    >
                        <div>
                            <p className="font-bold text-ols-secondary font-serif text-lg">{fast.name}</p>
                            <p className="text-xs text-white/70">{fast.dates}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded font-bold ${getStatusColor(fast.status)}`}>
                            {t(fast.status, lang)}
                        </span>
                    </div>
                ))}
            </div>
            
            {logs.length > 0 && (
                <div className="mt-8">
                    <h3 className="font-bold text-ols-primary text-lg mb-2">Recent Logs</h3>
                    <div className="space-y-2">
                        {logs.slice(0, 3).map(log => (
                            <div key={log.id} className="bg-white p-3 rounded-lg border border-gray-200 text-sm">
                                <div className="flex justify-between items-start">
                                    <span className="font-bold text-ols-primary">{log.fastName}</span>
                                    <span className="text-xs text-gray-500">{new Date(log.date).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs bg-ols-secondary/10 text-ols-secondary px-2 py-0.5 rounded">{t(log.mood, lang)}</span>
                                    <div className="flex">
                                        {[...Array(log.rating)].map((_, i) => <Star key={i} size={10} fill="#FFB300" className="text-ols-secondary border-none" />)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FastingCalendar;