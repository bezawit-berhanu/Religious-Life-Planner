import { Language, User, Prayer, JournalEntry, UserPreferences, CommunityPost, FastingLog, Holiday, FastingRule } from './types';

// --- Persistence & Auth Database ---
export const storage = {
  // Get currently logged in user session
  getUser: (): User | null => {
    const data = localStorage.getItem('ols_user_session');
    return data ? JSON.parse(data) : null;
  },
  // Set current session
  saveUser: (user: User) => {
    const updatedUser = { ...user, lastActive: Date.now() };
    localStorage.setItem('ols_user_session', JSON.stringify(updatedUser));
    
    // Also update this user in the 'database'
    const db = storage.getUsersDB();
    const index = db.findIndex(u => u.email === user.email);
    if (index !== -1) {
        db[index] = updatedUser;
    } else {
        db.push(updatedUser);
    }
    localStorage.setItem('ols_users_db', JSON.stringify(db));
  },
  clearUser: () => {
    localStorage.removeItem('ols_user_session');
  },
  // "Database" of all registered users
  getUsersDB: (): User[] => {
      const data = localStorage.getItem('ols_users_db');
      return data ? JSON.parse(data) : [];
  },
  registerUser: (user: User): boolean => {
      const db = storage.getUsersDB();
      if (db.find(u => u.email === user.email)) {
          return false; // User exists
      }
      db.push(user);
      localStorage.setItem('ols_users_db', JSON.stringify(db));
      return true;
  },
  authenticate: (email: string, pass: string): { success: boolean, user?: User, error?: string } => {
      const db = storage.getUsersDB();
      const user = db.find(u => u.email === email);
      
      if (!user) return { success: false, error: 'not_found' };
      if (user.password !== pass) return { success: false, error: 'wrong_password' };
      
      return { success: true, user };
  },
  authenticatePasscode: (email: string, code: string): { success: boolean, user?: User, error?: string } => {
      const db = storage.getUsersDB();
      const user = db.find(u => u.email === email);
      
      if (!user) return { success: false, error: 'not_found' };
      if (user.passcode !== code) return { success: false, error: 'wrong_passcode' };
      
      return { success: true, user };
  },
  // Other Storage
  getPrayers: (defaultPrayers: Prayer[]): Prayer[] => {
    const data = localStorage.getItem('ols_prayers');
    return data ? JSON.parse(data) : defaultPrayers;
  },
  savePrayers: (prayers: Prayer[]) => {
    localStorage.setItem('ols_prayers', JSON.stringify(prayers));
  },
  getJournal: (defaultJournal: JournalEntry[]): JournalEntry[] => {
    const data = localStorage.getItem('ols_journal');
    return data ? JSON.parse(data) : defaultJournal;
  },
  saveJournal: (entries: JournalEntry[]) => {
    localStorage.setItem('ols_journal', JSON.stringify(entries));
  },
  getPreferences: (defaultPrefs: UserPreferences): UserPreferences => {
      const data = localStorage.getItem('ols_prefs');
      return data ? JSON.parse(data) : defaultPrefs;
  },
  savePreferences: (prefs: UserPreferences) => {
      localStorage.setItem('ols_prefs', JSON.stringify(prefs));
  },
  getPosts: (defaultPosts: CommunityPost[]): CommunityPost[] => {
      const data = localStorage.getItem('ols_posts');
      return data ? JSON.parse(data) : defaultPosts;
  },
  savePosts: (posts: CommunityPost[]) => {
      localStorage.setItem('ols_posts', JSON.stringify(posts));
  },
  getFastingLogs: (): FastingLog[] => {
      const data = localStorage.getItem('ols_fasting_logs');
      return data ? JSON.parse(data) : [];
  },
  saveFastingLogs: (logs: FastingLog[]) => {
      localStorage.setItem('ols_fasting_logs', JSON.stringify(logs));
  }
};

// --- Ethiopian Calendar Logic ---

const ETHIOPIC_MONTHS_EN = [
  'Meskerem', 'Tikimt', 'Hidar', 'Tahsas', 'Tir', 'Yekatit',
  'Megabit', 'Miyazia', 'Ginbot', 'Sene', 'Hamle', 'Nehase', 'Pagume'
];

const ETHIOPIC_MONTHS_AM = [
  'መስከረም', 'ጥቅምት', 'ኅዳር', 'ታኅሣሥ', 'ጥር', 'የካቲት',
  'መጋቢት', 'ሚያዝያ', 'ግንቦት', 'ሰኔ', 'ሐምሌ', 'ነሐሴ', 'ጳጉሜ'
];

// NENEWE (Nineveh) Lookup Table (Year -> {month, day})
// Month 4 = Tir, Month 5 = Yekatit
const NENEWE_DATES: Record<number, { month: number, day: number }> = {
    2010: { month: 5, day: 4 },
    2011: { month: 5, day: 24 },
    2012: { month: 5, day: 13 },
    2013: { month: 5, day: 5 },
    2014: { month: 5, day: 25 },
    2015: { month: 4, day: 29 },
    2016: { month: 5, day: 18 },
    2017: { month: 5, day: 3 },
    2018: { month: 4, day: 25 },
    2019: { month: 5, day: 1 },
    2020: { month: 4, day: 29 },
    2021: { month: 4, day: 21 },
    2022: { month: 5, day: 11 },
    2023: { month: 4, day: 26 },
    2024: { month: 5, day: 15 },
    2025: { month: 5, day: 7 },
    2026: { month: 4, day: 22 },
    2027: { month: 5, day: 12 },
    2028: { month: 5, day: 3 },
    2029: { month: 4, day: 18 },
    2030: { month: 5, day: 8 }
};

// Evangelist Cycle
export const getEvangelist = (year: number, lang: Language): string => {
    const remainder = (year + 5500) % 4;
    const evangelists: Record<number, { en: string; am: string }> = {
        1: { en: 'Zemene Matewos', am: 'ዘመነ ማቴዎስ' },
        2: { en: 'Zemene Markos', am: 'ዘመነ ማርቆስ' },
        3: { en: 'Zemene Lukas', am: 'ዘመነ ሉቃስ' },
        0: { en: 'Zemene Yohannes', am: 'ዘመነ ዮሐንስ' }
    };
    const ev = evangelists[remainder];
    return lang === 'Amharic' ? ev.am : ev.en;
};

// Holidays Config
const HOLIDAYS: Holiday[] = [
    { day: 1, month: 0, name: 'Enkutatash (New Year)', type: 'National' },
    { day: 17, month: 0, name: 'Meskel', type: 'Religious' },
    { day: 26, month: 0, name: 'Tsige Tsom', type: 'Religious' },
    { day: 15, month: 2, name: 'Tsome Nebiyat/ Yegena Tsom', type: 'Religious' },
    { day: 29, month: 3, name: 'Gena (Christmas)', type: 'Religious' },
    { day: 11, month: 4, name: 'Timket', type: 'Religious' },
    { day: 12, month: 4, name: 'Qana Zegelila', type: 'Religious' },
    { day: 23, month: 5, name: 'Victory of Adwa', type: 'National' },
    { day: 10, month: 6, name: 'Beale Mesqel', type: 'Religious' },
    { day: 23, month: 7, name: 'International Labour Day', type: 'National' },
    { day: 27, month: 7, name: 'Ethiopian Patriots Day', type: 'National' },
    { day: 1, month: 8, name: 'Ginbot Lideta', type: 'Religious' },
    { day: 13, month: 8, name: 'Ginbot 20', type: 'National' },
    { day: 1, month: 11, name: 'Tsome Felseta', type: 'Religious' },
    { day: 13, month: 11, name: 'Buhe(Debre Tabor)', type: 'Religious' },
    { day: 16, month: 11, name: "E'rget", type: 'Religious' }
];

// Simplified Calendar Math
// Anchor: Meskerem 1, 2018 E.C. = Thursday
export const getFirstDayOfEthYear = (year: number): number => {
    // 0=Sun, 1=Mon, ..., 4=Thu
    // 2018 starts on Thursday (4)
    // 2017 starts on Wednesday (3)
    // 2016 starts on Tuesday (2) (Year after leap)
    // 2015 starts on Sunday (0) (Leap year)
    
    // Simple iterative approach from 2018 anchor for robustness in small range
    const anchorYear = 2018;
    const anchorDay = 4; // Thursday
    
    let currentYear = anchorYear;
    let currentDay = anchorDay;
    
    if (year === anchorYear) return anchorDay;
    
    if (year < anchorYear) {
        while (currentYear > year) {
            currentYear--;
            // If currentYear (the one we just moved TO) is a leap year, it has 366 days.
            // But the start day shifts based on the PREVIOUS year's length.
            // Start(2018) = (Start(2017) + Length(2017)) % 7
            // Start(2017) = (Start(2018) - Length(2017)) % 7
            
            // Eth Leap Years: 2011, 2015, 2019, 2023
            // A year is leap if year % 4 === 3
            const isLeap = (currentYear) % 4 === 3; 
            const days = isLeap ? 366 : 365;
            currentDay = (currentDay - (days % 7) + 7) % 7;
        }
    } else {
        while (currentYear < year) {
            const isLeap = currentYear % 4 === 3;
            const days = isLeap ? 366 : 365;
            currentDay = (currentDay + days) % 7;
            currentYear++;
        }
    }
    
    return currentDay;
}

export const getCalendarGrid = (year: number, month: number) => {
    const startDayOfYear = getFirstDayOfEthYear(year);
    // All months have 30 days except Pagume
    // Start day of Month M = (StartDayYear + 30 * M) % 7
    // M is 0-indexed
    
    const startDayOfMonth = (startDayOfYear + (month * 30)) % 7;
    const daysInMonth = month === 12 ? (year % 4 === 3 ? 6 : 5) : 30;
    
    return { startDay: startDayOfMonth, days: daysInMonth };
};

// Helper to add days to an Ethiopic Date
const addEthDays = (year: number, month: number, day: number, daysToAdd: number) => {
    let d = day + daysToAdd;
    let m = month;
    let y = year;
    
    while (true) {
        const daysInCurrentMonth = m === 12 ? (y % 4 === 3 ? 6 : 5) : 30;
        if (d <= daysInCurrentMonth) break;
        d -= daysInCurrentMonth;
        m++;
        if (m > 12) {
            m = 0;
            y++;
        }
    }
    return { year: y, month: m, day: d };
};

// Check if day is Wednesday or Friday
export const isFastingDayOfWeek = (year: number, month: number, day: number): boolean => {
    const { startDay } = getCalendarGrid(year, month);
    const dayOfWeek = (startDay + day - 1) % 7; // 0=Sun, 3=Wed, 5=Fri
    return dayOfWeek === 3 || dayOfWeek === 5;
};

// Check if in Pentecost (50 days after Easter)
export const isPentecost = (year: number, month: number, day: number): boolean => {
    const nenewe = NENEWE_DATES[year];
    if (!nenewe) return false; // Fallback
    
    const fasika = addEthDays(year, nenewe.month, nenewe.day, 69);
    const paraclitos = addEthDays(year, nenewe.month, nenewe.day, 119);
    
    const currentDOY = month * 30 + day;
    const fasikaDOY = fasika.month * 30 + fasika.day;
    const paraclitosDOY = paraclitos.month * 30 + paraclitos.day;
    
    return currentDOY >= fasikaDOY && currentDOY <= paraclitosDOY;
};

export const getEthDateObject = (date: Date) => {
    const gregYear = date.getFullYear();
    const ms1 = new Date(gregYear, 8, 11); // Sept 11
    
    let ethYear = gregYear - 8;
    let diffDays = 0;

    if (date >= ms1) {
        ethYear += 1;
        const diffTime = date.getTime() - ms1.getTime();
        diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    } else {
        // Date is before Sept 11, calculate from previous year's Sept 11
        const prevMs1 = new Date(gregYear - 1, 8, 11);
        const diffTime = date.getTime() - prevMs1.getTime();
        diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    }
  
    const ethMonth = Math.floor(diffDays / 30);
    const ethDay = (diffDays % 30) + 1;
    
    return { year: ethYear, month: Math.min(ethMonth, 12), day: ethDay };
}

export const getEthiopianDate = (date: Date, lang: Language) => {
  const { year, month, day } = getEthDateObject(date);
  const months = lang === 'Amharic' ? ETHIOPIC_MONTHS_AM : ETHIOPIC_MONTHS_EN;
  return `${months[month]} ${day}, ${year}`;
};

export const getCurrentFastingRule = (date: Date, lang: Language): FastingRule => {
    const { year, month, day } = getEthDateObject(date);
    const currentDOY = month * 30 + day;
    
    const months = lang === 'Amharic' ? ETHIOPIC_MONTHS_AM : ETHIOPIC_MONTHS_EN;
    const monthName = months[month];
    const shortDate = `${monthName} ${day}`;

    // Default Rule
    let rule: FastingRule = {
        isFastingDay: false,
        type: 'None',
        description: lang === 'Amharic' ? 'የፍስክ ቀን' : 'Not a fasting day',
        status: 'None'
    };

    // 1. Fixed Fasts
    // Prophets Fast (Tsome Nebiyat): Hidar 15 (Month 2) to Tahsas 28 (Month 3)
    const prophetsStart = 2 * 30 + 15;
    const prophetsEnd = 3 * 30 + 28;
    
    // Filseta (Assumption): Nehase 1 - 16 (Month 11)
    const filsetaStart = 11 * 30 + 1;
    const filsetaEnd = 11 * 30 + 16;
    
    // Gena (Christmas) Eve: Tahsas 28 (Month 3)
    const genaEve = 3 * 30 + 28;
    
    // Timket Eve (Gehad): Tir 10 (Month 4)
    const timketEve = 4 * 30 + 10;

    if (currentDOY >= prophetsStart && currentDOY <= prophetsEnd) {
        return {
            isFastingDay: true,
            type: 'Strict',
            description: lang === 'Amharic' ? `የነቢያት ጾም, ${shortDate}` : `Prophets Fast, ${shortDate}`,
            feastName: lang === 'Amharic' ? 'የነቢያት ጾም' : 'Prophets Fast',
            status: 'Current'
        };
    }
    
    if (currentDOY >= filsetaStart && currentDOY <= filsetaEnd) {
        return {
            isFastingDay: true,
            type: 'Strict',
            description: lang === 'Amharic' ? `ጾመ ፍልሰታ, ${shortDate}` : `Fast of Assumption, ${shortDate}`,
            feastName: lang === 'Amharic' ? 'ጾመ ፍልሰታ' : 'Fast of Assumption',
            status: 'Current'
        };
    }
    
    if (currentDOY === timketEve) {
         return {
            isFastingDay: true,
            type: 'Strict',
            description: lang === 'Amharic' ? `የጥምቀት ዋዜማ (ገሀድ), ${shortDate}` : `Timket Eve (Gehad), ${shortDate}`,
            feastName: lang === 'Amharic' ? 'ገሀድ' : 'Gehad',
            status: 'Current'
        };
    }

    // 2. Moveable Fasts (Based on Nenewe)
    const nenewe = NENEWE_DATES[year];
    if (nenewe) {
        const neneweDOY = nenewe.month * 30 + nenewe.day;
        
        // Nenewe Fast: 3 days
        if (currentDOY >= neneweDOY && currentDOY < neneweDOY + 3) {
            return {
                isFastingDay: true,
                type: 'Strict',
                description: lang === 'Amharic' ? `ጾመ ነነዌ, ${shortDate}` : `Fast of Nineveh, ${shortDate}`,
                feastName: lang === 'Amharic' ? 'ጾመ ነነዌ' : 'Fast of Nineveh',
                status: 'Current'
            };
        }
        
        // Great Lent (Abiy Tsom): Nenewe + 14 days -> + 55 days duration
        const lentStart = neneweDOY + 14;
        const lentEnd = lentStart + 55; // Until Fasika
        
        if (currentDOY >= lentStart && currentDOY < lentEnd) {
            return {
                isFastingDay: true,
                type: 'Strict',
                description: lang === 'Amharic' ? `አብይ ጾም, ${shortDate}` : `Great Lent, ${shortDate}`,
                feastName: lang === 'Amharic' ? 'አብይ ጾም' : 'Great Lent',
                status: 'Current'
            };
        }
        
        // Apostles Fast (Sene Tsom): Starts Paraclete + 1, Ends Hamle 5
        // Paraclete = Nenewe + 119
        const paraclitosDOY = neneweDOY + 119;
        const apostlesStart = paraclitosDOY + 1;
        const apostlesEnd = 10 * 30 + 5; // Hamle 5
        
        if (currentDOY >= apostlesStart && currentDOY <= apostlesEnd) {
             return {
                isFastingDay: true,
                type: 'Strict',
                description: lang === 'Amharic' ? `የሐዋርያት ጾም, ${shortDate}` : `Apostles Fast, ${shortDate}`,
                feastName: lang === 'Amharic' ? 'የሐዋርያት ጾም' : 'Apostles Fast',
                status: 'Current'
            };
        }
        
        // 50 Days of Joy (Fasika to Paraclete) - No Fasting (even Wed/Fri)
        const fasikaDOY = neneweDOY + 69;
        if (currentDOY >= fasikaDOY && currentDOY <= paraclitosDOY) {
            return {
                isFastingDay: false,
                type: 'None',
                description: lang === 'Amharic' ? 'የ50 ቀናት በዓል (አጽዋማት የሉም)' : '50 Days of Joy (No Fasting)',
                status: 'None'
            };
        }
    }

    // 3. Weekly Fasts (Wed/Fri) - Checked LAST (lowest priority)
    if (isFastingDayOfWeek(year, month, day)) {
        return {
            isFastingDay: true,
            type: 'Strict',
            description: lang === 'Amharic' ? `የረቡዕ/ዓርብ ጾም, ${shortDate}` : `Wed/Fri Fast, ${shortDate}`,
            status: 'Current'
        };
    }

    return rule;
};

export const getFastingDates = (year: number) => {
    const nenewe = NENEWE_DATES[year];
    if (!nenewe) return null;

    const neneweDOY = nenewe.month * 30 + nenewe.day;
    
    // Helper to convert DOY back to {month, day}
    const fromDOY = (doy: number) => {
        const m = Math.floor((doy - 1) / 30);
        const d = (doy - 1) % 30 + 1;
        return { month: m, day: d };
    };

    // Fixed Fasts
    const prophets = { start: { month: 2, day: 15 }, end: { month: 3, day: 28 } };
    const gehad = { start: { month: 4, day: 10 }, end: { month: 4, day: 10 } };
    const filseta = { start: { month: 11, day: 1 }, end: { month: 11, day: 16 } };

    // Moveable
    const neneweFast = { start: nenewe, end: fromDOY(neneweDOY + 2) };
    const abiyTsom = { start: fromDOY(neneweDOY + 14), end: fromDOY(neneweDOY + 14 + 54) };
    // Apostles: Paraclete + 1
    const paraclitosDOY = neneweDOY + 119;
    const apostles = { start: fromDOY(paraclitosDOY + 1), end: { month: 10, day: 5 } };

    return {
        prophets,
        gehad,
        nenewe: neneweFast,
        abiyTsom,
        apostles,
        filseta
    };
};

const MONTHLY_SAINTS: Record<number, { en: string; am: string }> = {
    1: { en: 'Lideta / Raguel', am: 'ልደታ / ራጉኤል' },
    2: { en: 'Thaddeus / Aba Guba', am: 'ታዲዮስ / አባ ጉባ' },
    3: { en: "Ba'eta", am: 'በዓታ' },
    4: { en: 'Yohannes', am: 'ዮሐንስ ሐዋሪያው' },
    5: { en: 'Abune Gebre Menfes Kidus', am: 'አቡነ ገብረ መንፈስ ቅዱስ' },
    6: { en: 'Iyesus / Arsemma', am: 'ኢየሱስ / አርሴማ' },
    7: { en: 'Sellassie', am: 'ሥላሴ' },
    8: { en: 'Aba Kiros', am: 'አባ ኪሮስ' },
    9: { en: 'Salome / Cherqos', am: 'ሰሎሜ / ጨርቆስ' },
    10: { en: 'Mesqele Iyesus', am: 'መስቀል እየሱስ' },
    11: { en: 'Hanna Mariyam', am: 'ሐና ማርያም' },
    12: { en: 'St. Michael', am: 'ቅዱስ ሚካኤል' },
    13: { en: 'Egziabher Ab', am: 'እግዚአብሔር አብ' },
    14: { en: 'Abune Aregawi', am: 'አቡነ አረጋዊ' },
    15: { en: 'Kirkos', am: 'ቂርቆስ' },
    16: { en: 'Kidane Mihret', am: 'ኪዳነ ምሕረት' },
    17: { en: 'Estifanos', am: 'እስጢፋኖስ' },
    18: { en: 'Ewostatewos / Thomas', am: 'ኤዎስጣቴዎስ / ቶማስ' },
    19: { en: 'St. Gabriel', am: 'ቅዱስ ገብርኤል' },
    20: { en: 'Hentsete Le Betemariyam', am: 'ሕንፀተ ቤተ ለማርያም' },
    21: { en: 'Mariyam', am: 'ማርያም' },
    22: { en: 'St. Urael', am: 'ቅዱስ ኡራኤል' },
    23: { en: 'St. Giorgis', am: 'ቅዱስ ጊዮርጊስ' },
    24: { en: 'Tekle Haymanot', am: 'ተክለ ሃይማኖት' },
    25: { en: 'Mercurius', am: 'መርቆሬዎስ' },
    26: { en: 'Yoseph', am: 'ዮሴፍ' },
    27: { en: 'Medhane Alem', am: 'መድኃኔ ዓለም' },
    28: { en: 'Emmanuel', am: 'አማኑኤል' },
    29: { en: 'Balewold', am: 'በአለወልድ' },
    30: { en: 'Yohannes / Markos', am: 'ዮሃንስ / ማርቆስ' }
};

export const getSaintForDay = (day: number, lang: Language) => {
    const saint = MONTHLY_SAINTS[day];
    if (saint) return lang === 'Amharic' ? saint.am : saint.en;
    return null;
}

export const getHoliday = (day: number, month: number): Holiday | undefined => {
    return HOLIDAYS.find(h => h.day === day && h.month === month);
}

export const formatDate = (date: Date, lang: Language) => {
    if (lang === 'Amharic') {
        return date.toLocaleDateString('am-ET', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

// --- Translations ---
const DICTIONARY: Record<string, { English: string, Amharic: string }> = {
    'Home': { English: 'Home', Amharic: 'መነሻ' },
    'Pray': { English: 'Pray', Amharic: 'ጸሎት' },
    'Focus': { English: 'Focus', Amharic: 'ትኩረት' },
    'Journal': { English: 'Journal', Amharic: 'ቀን-መዝገብ' },
    'Library': { English: 'Library', Amharic: 'ቤተ መጻሕፍት' },
    'Bible': { English: 'Bible', Amharic: 'መጽሐፍ ቅዱስ' },
    'Fasting': { English: 'Fasting', Amharic: 'ጾም' },
    'Community': { English: 'Community', Amharic: 'ማህበረሰብ' },
    'Settings': { English: 'Settings', Amharic: 'ቅንብሮች' },
    'Orthodox': { English: 'ORTHODOX', Amharic: 'ኦርቶዶክስ' },
    'Today': { English: 'Today', Amharic: 'ዛሬ' },
    'Daily Prayer': { English: 'Daily Prayer', Amharic: 'የዕለት ጸሎት' },
    'Fasting Rule': { English: 'Fasting Rule', Amharic: 'የጾም ሕግ' },
    'Search': { English: 'Search', Amharic: 'ፈልግ' },
    'Search Web': { English: 'Search on Web', Amharic: 'ከኢንተርኔት ፈልግ' },
    'Resources': { English: 'Resources', Amharic: 'መረጃዎች' },
    'Books': { English: 'Books', Amharic: 'መጻሕፍት' },
    'Video': { English: 'Video', Amharic: 'ቪዲዮ' },
    'Audio': { English: 'Audio', Amharic: 'ኦዲዮ' },
    'Start': { English: 'Start', Amharic: 'ጀምር' },
    'Stop': { English: 'Stop', Amharic: 'አቁም' },
    'Reset': { English: 'Reset', Amharic: 'አጥፋ' },
    'Custom Time': { English: 'Custom Time (min)', Amharic: 'ጊዜ (ደቂቃ)' },
    'Save Entry': { English: 'Save Entry', Amharic: 'መዝግብ' },
    'Cancel': { English: 'Cancel', Amharic: 'ይቅር' },
    'Old Testament': { English: 'Old Testament', Amharic: 'ብሉይ ኪዳን' },
    'New Testament': { English: 'New Testament', Amharic: 'ሐዲስ ኪዳን' },
    'Connect App': { English: 'Connect External App', Amharic: 'ከሌላ መተግበሪያ ጋር ያገናኙ' },
    'Major Fasts': { English: 'Major Fasts', Amharic: 'የዓመቱ ዓበይት አጽዋማት' },
    'Current': { English: 'Current', Amharic: 'ወቅታዊ' },
    'Upcoming': { English: 'Upcoming', Amharic: 'የሚመጣ' },
    'Done': { English: 'Done', Amharic: 'ተጠናቀቀ' },
    'Privacy Mode': { English: 'Privacy Mode', Amharic: 'የግል ሁነታ' },
    'Language': { English: 'Language', Amharic: 'ቋንቋ' },
    'Sign Out': { English: 'Sign Out', Amharic: 'ውጣ' },
    'Your Name': { English: 'Your Name', Amharic: 'ስምዎ' },
    'Profile': { English: 'Profile', Amharic: 'መገለጫ' },
    'Age': { English: 'Age', Amharic: 'እድሜ' },
    'Gender': { English: 'Gender', Amharic: 'ጾታ' },
    'Male': { English: 'Male', Amharic: 'ወንድ' },
    'Female': { English: 'Female', Amharic: 'ሴት' },
    'Add Prayer': { English: 'Add Prayer', Amharic: 'ጸሎት ጨምር' },
    'Title': { English: 'Title', Amharic: 'ርዕስ' },
    'Time': { English: 'Time', Amharic: 'ሰዓት' },
    'Duration': { English: 'Duration', Amharic: 'ቆይታ' },
    'Delete': { English: 'Delete', Amharic: 'አጥፋ' },
    'Read': { English: 'Read', Amharic: 'አንብብ' },
    'Listen': { English: 'Listen', Amharic: 'አዳምጥ' },
    'Watch': { English: 'Watch', Amharic: 'ተመልከት' },
    'Open Link': { English: 'Open Resource', Amharic: 'ክፈት' },
    'Create Post': { English: 'Create Post', Amharic: 'ልጥፍ ፍጠር' },
    'Stories': { English: 'Stories', Amharic: 'ታሪኮች' },
    'Lock': { English: 'Lock', Amharic: 'ቆልፍ' },
    'Unlock': { English: 'Unlock', Amharic: 'ክፈት' },
    'Enter PIN': { English: 'Enter PIN to unlock', Amharic: 'ለመክፈት የይለፍ ቃል ያስገቡ' },
    'Cover': { English: 'Cover', Amharic: 'ሽፋን' },
    'Font': { English: 'Font', Amharic: 'ፊደል' },
    'Color': { English: 'Color', Amharic: 'ቀለም' },
    'Image': { English: 'Image', Amharic: 'ምስል' },
    'Back': { English: 'Back', Amharic: 'ተመለስ' },
    'Login Required': { English: 'Login Required', Amharic: 'መግባት ያስፈልጋል' },
    'Welcome Back': { English: 'Welcome Back', Amharic: 'እንኳን ደህና መጡ' },
    'Join': { English: 'Join Community', Amharic: 'ይመዝገቡ' },
    'Username': { English: 'Username', Amharic: 'የተጠቃሚ ስም' },
    'Password': { English: 'Password', Amharic: 'የይለፍ ቃል' },
    'Full Name': { English: 'Full Name', Amharic: 'ሙሉ ስም' },
    'Email': { English: 'Email', Amharic: 'ኢሜይል' },
    'Year': { English: 'Year', Amharic: 'ዓ.ም' },
    'Month': { English: 'Month', Amharic: 'ወር' },
    'Day': { English: 'Day', Amharic: 'ቀን' },
    'Saint': { English: 'Saint', Amharic: 'ጻድቅ' },
    'Gregorian': { English: 'Gregorian', Amharic: 'ፈረንሳይ' },
    'My Reflections': { English: 'My Reflections', Amharic: 'የኔ ሃሳቦች' },
    'Explore': { English: 'Explore', Amharic: 'ያስሱ' },
    'New Entry': { English: 'New Entry', Amharic: 'አዲስ መዝገብ' },
    'My Notebooks': { English: 'My Notebooks', Amharic: 'ማስታወሻዎቼ' },
    'Edit': { English: 'Edit', Amharic: 'አስተካክል' },
    'Save': { English: 'Save', Amharic: 'አስቀምጥ' },
    'How was your fast?': { English: 'How was your fast?', Amharic: 'ጾምዎ እንዴት ነበር?' },
    'Mood': { English: 'Mood', Amharic: 'ስሜት' },
    'Rating': { English: 'Consistency Rating', Amharic: 'የጥንካሬ ደረጃ' },
    'Peaceful': { English: 'Peaceful', Amharic: 'ሰላማዊ' },
    'Neutral': { English: 'Neutral', Amharic: 'መካከለኛ' },
    'Struggle': { English: 'Struggle', Amharic: 'ከባድ' },
    'Notes': { English: 'Notes', Amharic: 'ማስታወሻ' },
    'Focus Sound': { English: 'Focus Sound', Amharic: 'የትኩረት ድምፅ' },
    'Account not found. Create one?': { English: 'Account not found. Create one?', Amharic: 'መለያ አልተገኘም። አዲስ ይፍጠሩ?' },
    'Wrong password': { English: 'Wrong password', Amharic: 'የይለፍ ቃል ስህተት ነው' },
    'Email already exists': { English: 'Email already registered. Log in?', Amharic: 'ኢሜይሉ ተመዝግቧል። ይግቡ?' },
    'Continue with Google': { English: 'Continue with Google', Amharic: 'በGoogle ይቀጥሉ' },
    'Continue with Facebook': { English: 'Continue with Facebook', Amharic: 'በFacebook ይቀጥሉ' },
    'Theme': { English: 'Theme', Amharic: 'ገጽታ' },
    'Light Mode': { English: 'Light Mode', Amharic: 'ብሩህ' },
    'Dark Mode': { English: 'Dark Mode', Amharic: 'ጨለማ' },
    'Community Page': { English: 'Community Page', Amharic: 'የማህበረሰብ ገጽ' },
    'Profile Picture': { English: 'Profile Picture', Amharic: 'የመገለጫ ምስል' },
    'Change': { English: 'Change', Amharic: 'ቀይር' },
    'Remove': { English: 'Remove', Amharic: 'አጥፋ' }
};

export const t = (key: string, lang: Language): string => {
  return DICTIONARY[key]?.[lang] || key;
}