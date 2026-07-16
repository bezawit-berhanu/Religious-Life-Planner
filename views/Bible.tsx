import React, { useState } from 'react';
import { BookOpen, ExternalLink, Smartphone, ChevronLeft, ArrowLeft, Lock } from 'lucide-react';
import { Language } from '../types';
import { t } from '../utils';
import { BIBLE_BOOKS, BIBLE_CONTENT } from '../constants';

interface BibleProps {
    lang: Language;
}

const Bible: React.FC<BibleProps> = ({ lang }) => {
    const [selectedBook, setSelectedBook] = useState<string | null>(null);

    const handleBookClick = (bookName: string) => {
        // In a real app, you would fetch chapter 1 here.
        // For this demo, we check if we have content in constants.
        if (BIBLE_CONTENT[bookName]) {
            setSelectedBook(bookName);
        } else {
             // Fallback for books without text content in this demo
             window.open(`https://www.google.com/search?q=${bookName}+Ethiopian+Orthodox+Bible+PDF`, '_blank');
        }
    };

    const renderContent = () => {
        if (selectedBook) {
            const content = BIBLE_CONTENT[selectedBook];
            return (
                <div className="pb-20 space-y-4 bg-white dark:bg-ols-bg min-h-screen p-4 md:p-8">
                    <button 
                        onClick={() => setSelectedBook(null)}
                        className="flex items-center gap-2 text-ols-primary font-bold mb-4"
                    >
                        <ArrowLeft size={20} /> Back to Library
                    </button>
                    
                    <div className="max-w-2xl mx-auto">
                        <h1 className="font-serif text-3xl font-bold text-center text-ols-primary mb-2">{content.book}</h1>
                        <h2 className="text-center text-ols-muted mb-8 font-serif">Chapter {content.chapter}</h2>
                        
                        <div className="prose prose-lg mx-auto text-gray-800 dark:text-gray-200 leading-loose font-serif">
                            {content.text.map((verse, idx) => (
                                <p key={idx} className="mb-4">
                                    <span className="text-ols-secondary font-bold mr-2 text-sm select-none">{idx + 1}</span>
                                    {verse.replace(/^\d+\.\s/, '')}
                                </p>
                            ))}
                        </div>

                        <div className="flex justify-between mt-12 pt-8 border-t dark:border-gray-800">
                            <button disabled className="text-gray-300 dark:text-gray-600">Previous</button>
                            <button className="text-ols-primary font-bold">Next Chapter</button>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="pb-20 space-y-6">
                <div className="text-center py-6">
                    <h2 className="font-serif text-3xl font-bold text-ols-primary">{t('Bible', lang)}</h2>
                    <p className="text-ols-muted mt-2 max-w-md mx-auto">The Holy Scriptures of the Old and New Testaments.</p>
                </div>

                <div className="space-y-6">
                    <div>
                        <h3 className="text-xl font-serif font-bold text-ols-secondary border-b border-ols-accent/20 pb-2 mb-4">{t('Old Testament', lang)}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {BIBLE_BOOKS.OT.map((book, i) => (
                                 <button 
                                    key={i}
                                    onClick={() => handleBookClick(book.en)}
                                    className="bg-white dark:bg-ols-surface p-3 rounded-lg border border-gray-200 dark:border-gray-800 text-sm font-medium hover:border-ols-primary dark:hover:border-ols-primary hover:text-ols-primary transition-colors text-center truncate dark:text-gray-200"
                                 >
                                     {lang === 'Amharic' ? book.am : book.en}
                                 </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xl font-serif font-bold text-ols-secondary border-b border-ols-accent/20 pb-2 mb-4">{t('New Testament', lang)}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {BIBLE_BOOKS.NT.map((book, i) => (
                                 <button 
                                    key={i}
                                    onClick={() => handleBookClick(book.en)}
                                    className="bg-white dark:bg-ols-surface p-3 rounded-lg border border-gray-200 dark:border-gray-800 text-sm font-medium hover:border-ols-primary dark:hover:border-ols-primary hover:text-ols-primary transition-colors text-center truncate dark:text-gray-200"
                                 >
                                     {lang === 'Amharic' ? book.am : book.en}
                                 </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-ols-primary/5 border border-ols-primary/10 rounded-2xl p-6 flex flex-col items-center text-center mt-8">
                    <Smartphone className="text-ols-primary mb-3" size={32} />
                    <h3 className="font-bold text-ols-primary mb-2">{t('Connect App', lang)}</h3>
                    <p className="text-sm text-ols-text/70 dark:text-gray-400 mb-4">Connect your favorite Amharic Bible app for seamless reading.</p>
                    <button 
                        onClick={() => window.open('https://play.google.com/store/search?q=amharic+orthodox+bible+81&c=apps', '_blank')}
                        className="bg-ols-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-ols-primary/90 flex items-center gap-2"
                    >
                        Open App Store <ExternalLink size={16} />
                    </button>
                </div>
            </div>
        );
    };

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

export default Bible;