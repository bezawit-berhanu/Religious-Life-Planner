import { FastingRule, Prayer, Resource, JournalEntry, CommunityPost, Story, BibleChapter } from './types';
import React from 'react';
import { BookOpen, Video, FileText, Headphones } from 'lucide-react';

export const TODAY_FAST: FastingRule = {
  isFastingDay: true,
  type: 'Strict',
  description: 'Yekatit 6 - Daily Fast',
  feastName: undefined,
  status: 'Current'
};

// Clean slate for prayers
export const INITIAL_PRAYERS: Prayer[] = [];

// Clean slate for journal
export const MOCK_JOURNAL: JournalEntry[] = [];

// EXTENSIVE RESOURCES LIST (Kept as Library content is static/reference)
export const RESOURCES: Resource[] = [
  // MEZMUR
  { id: 'mz1', title: 'Zemari Yilma Hailu - Collection', type: 'Audio', author: 'Yilma Hailu', category: 'Mezmur', imageUrl: 'https://i.ytimg.com/vi/example_yilma.jpg', url: 'https://www.youtube.com/results?search_query=yilma+hailu+mezmur+collection' },
  { id: 'mz2', title: 'Zerfe Kebede - Best Of', type: 'Audio', author: 'Zerfe Kebede', category: 'Mezmur', imageUrl: 'https://i.ytimg.com/vi/example_zerfe.jpg', url: 'https://www.youtube.com/results?search_query=zerfe+kebede+mezmur' },
  { id: 'mz3', title: 'Mertnesh Tilahun', type: 'Audio', author: 'Mertnesh Tilahun', category: 'Mezmur', imageUrl: 'https://i.ytimg.com/vi/example_mertnesh.jpg', url: 'https://www.youtube.com/results?search_query=mertnesh+tilahun+mezmur' },
  { id: 'mz4', title: 'Yosef Kassa - Kiber Yihun', type: 'Audio', author: 'Yosef Kassa', category: 'Mezmur', imageUrl: 'https://i.ytimg.com/vi/example_yosef.jpg', url: 'https://www.youtube.com/results?search_query=yosef+kassa+mezmur' },
  
  // BOOKS
  { id: 'bk1', title: 'Books of H.H. Pope Shenouda III', type: 'Book', author: 'Pope Shenouda III', category: 'Theology', imageUrl: 'https://example.com/shenouda.jpg', url: 'https://www.copticchurch.net/topics/theology/shenouda/' },
  { id: 'bk2', title: 'Works of Deacon Henok Haile', type: 'Book', author: 'Dn. Henok Haile', category: 'Theology', imageUrl: 'https://example.com/henok.jpg', url: 'https://www.youtube.com/results?search_query=deacon+henok+haile+books' },
  { id: 'bk3', title: 'The Faith of the Fathers (Haymanote Abew)', type: 'Book', author: 'Church Fathers', category: 'Theology', imageUrl: 'https://example.com/haymanot.jpg', url: 'https://www.ethiopianorthodox.org/english/canonical/books.html' },
  
  // VIDEOS
  { id: 'vd1', title: 'Memhir Girma Wondimu - Sibket', type: 'Video', author: 'Memhir Girma', category: 'Sermon', imageUrl: 'https://example.com/girma.jpg', url: 'https://www.youtube.com/results?search_query=memhir+girma+wondimu+sibket' },
  { id: 'vd2', title: 'Aba Gebrekidan - Full Sermons', type: 'Video', author: 'Aba Gebrekidan', category: 'Sermon', imageUrl: 'https://example.com/gebrekidan.jpg', url: 'https://www.youtube.com/results?search_query=aba+gebrekidan+sibket+new' },
  { id: 'vd3', title: 'Mihretab Asefa - Collection', type: 'Video', author: 'Mihretab Asefa', category: 'Sermon', imageUrl: 'https://example.com/mihretab.jpg', url: 'https://www.youtube.com/results?search_query=mihretab+asefa+sibket' },
];

export const MOCK_POSTS: CommunityPost[] = [];

export const MOCK_STORIES: Story[] = [];

export const BIBLE_BOOKS = {
    OT: [
        { en: 'Genesis', am: 'ኦሪት ዘፍጥረት' },
        { en: 'Exodus', am: 'ኦሪት ዘጸአት' },
        { en: 'Psalms', am: 'መዝሙረ ዳዊት' },
        { en: 'Isaiah', am: 'ትንቢተ ኢሳይያስ' },
        { en: 'Jeremiah', am: 'ትንቢተ ኤርምያስ' }
    ],
    NT: [
        { en: 'Matthew', am: 'የማቴዎስ ወንጌል' },
        { en: 'Mark', am: 'የማርቆስ ወንጌል' },
        { en: 'Luke', am: 'የሉቃስ ወንጌል' },
        { en: 'John', am: 'የዮሐንስ ወንጌል' },
        { en: 'Acts', am: 'የሐዋርያት ሥራ' },
        { en: 'Romans', am: 'ወደ ሮሜ ሰዎች' },
        { en: 'Revelation', am: 'የዮሐንስ ራእይ' }
    ]
};

export const BIBLE_CONTENT: Record<string, BibleChapter> = {
    'Genesis': {
        book: 'Genesis',
        chapter: 1,
        text: [
            "1. In the beginning God created the heaven and the earth.",
            "2. And the earth was without form, and void; and darkness was upon the face of the deep. And the Spirit of God moved upon the face of the waters.",
            "3. And God said, Let there be light: and there was light.",
            "4. And God saw the light, that it was good: and God divided the light from the darkness.",
            "5. And God called the light Day, and the darkness he called Night. And the evening and the morning were the first day."
        ]
    },
    'Matthew': {
        book: 'Matthew',
        chapter: 1,
        text: [
            "1. The book of the generation of Jesus Christ, the son of David, the son of Abraham.",
            "2. Abraham begat Isaac; and Isaac begat Jacob; and Jacob begat Judas and his brethren;",
            "3. And Judas begat Phares and Zara of Thamar; and Phares begat Esrom; and Esrom begat Aram;",
            "4. And Aram begat Aminadab; and Aminadab begat Naasson; and Naasson begat Salmon;"
        ]
    },
    'Psalms': {
        book: 'Psalms',
        chapter: 1,
        text: [
            "1. Blessed is the man that walketh not in the counsel of the ungodly, nor standeth in the way of sinners, nor sitteth in the seat of the scornful.",
            "2. But his delight is in the law of the Lord; and in his law doth he meditate day and night.",
            "3. And he shall be like a tree planted by the rivers of water, that bringeth forth his fruit in his season; his leaf also shall not wither; and whatsoever he doeth shall prosper."
        ]
    }
};

export const getIconForResourceType = (type: Resource['type']) => {
  switch (type) {
    case 'Video': return <Video size={16} />;
    case 'Book': return <BookOpen size={16} />;
    case 'Audio': return <Headphones size={16} />;
    default: return <FileText size={16} />;
  }
};