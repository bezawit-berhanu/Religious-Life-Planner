import React, { useState } from 'react';
import { Cross, Book, Calendar, PenTool, ArrowRight, Shield } from 'lucide-react';

interface OnboardingProps {
    onComplete: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
    const [step, setStep] = useState(0);

    const slides = [
        {
            icon: <Cross size={64} className="text-white" />,
            title: "Welcome to Orthodox Life",
            desc: "Your spiritual companion for prayer, fasting, and daily living in the Tewahedo faith.",
            bg: "bg-ols-primary"
        },
        {
            icon: <Book size={64} className="text-white" />,
            title: "Track Your Prayers",
            desc: "Stay consistent with daily prayers and keep track of your spiritual journey.",
            bg: "bg-[#5D4037]"
        },
        {
            icon: <Calendar size={64} className="text-white" />,
            title: "Fasting & Feasts",
            desc: "Never miss a fast. View the full Ethiopian calendar from 2010 to 2050.",
            bg: "bg-[#4E342E]"
        },
        {
            icon: <PenTool size={64} className="text-white" />,
            title: "Journal & Community",
            desc: "Reflect privately in your locked journal or share insights with the faithful community.",
            bg: "bg-[#3E2723]"
        }
    ];

    const nextStep = () => {
        if (step < slides.length - 1) {
            setStep(step + 1);
        } else {
            onComplete();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-ols-bg animate-fade-in">
            <div className={`flex-1 flex flex-col items-center justify-center p-8 text-center transition-colors duration-500 ease-in-out ${slides[step].bg}`}>
                <div key={step} className="animate-fade-in flex flex-col items-center">
                    <div className="w-32 h-32 rounded-full border-4 border-white/20 flex items-center justify-center mb-8 shadow-2xl bg-white/10 backdrop-blur-sm">
                        {slides[step].icon}
                    </div>
                    <h1 className="font-serif text-3xl font-bold text-white mb-4 tracking-wide">
                        {slides[step].title}
                    </h1>
                    <p className="text-white/80 text-lg max-w-xs leading-relaxed">
                        {slides[step].desc}
                    </p>
                </div>
            </div>
            
            <div className="bg-white p-6 flex items-center justify-between">
                <div className="flex gap-2">
                    {slides.map((_, i) => (
                        <div 
                            key={i} 
                            className={`h-2 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-ols-primary' : 'w-2 bg-gray-300'}`} 
                        />
                    ))}
                </div>

                <button 
                    onClick={nextStep}
                    className="flex items-center gap-2 bg-ols-primary text-white px-6 py-3 rounded-full font-bold shadow-lg hover:bg-ols-secondary hover:text-ols-primary transition-all"
                >
                    {step === slides.length - 1 ? 'Get Started' : 'Next'}
                    <ArrowRight size={20} />
                </button>
            </div>
        </div>
    );
};

export default Onboarding;