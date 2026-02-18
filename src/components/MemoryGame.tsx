'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BookOpen,
    GraduationCap,
    Trophy,
    Music,
    Heart,
    Zap,
    Star,
    Coffee,
    RotateCcw,
    CheckCircle2
} from 'lucide-react';
import clsx from 'clsx';

const ICONS = [
    { id: 'book', icon: BookOpen, color: 'text-christ-blue' },
    { id: 'grad', icon: GraduationCap, color: 'text-christ-dark' },
    { id: 'trophy', icon: Trophy, color: 'text-christ-gold' },
    { id: 'music', icon: Music, color: 'text-christ-blue/70' },
    { id: 'heart', icon: Heart, color: 'text-red-500' },
    { id: 'zap', icon: Zap, color: 'text-christ-gold' },
    { id: 'star', icon: Star, color: 'text-christ-blue/50' },
    { id: 'coffee', icon: Coffee, color: 'text-christ-dark/60' },
];

interface Card {
    id: number;
    iconId: string;
    isFlipped: boolean;
    isMatched: boolean;
}

export default function MemoryGame() {
    const [cards, setCards] = useState<Card[]>([]);
    const [flippedCards, setFlippedCards] = useState<number[]>([]);
    const [moves, setMoves] = useState(0);
    const [isWon, setIsWon] = useState(false);

    const initGame = () => {
        const deck: Card[] = [];
        [...ICONS, ...ICONS].sort(() => Math.random() - 0.5).forEach((item, index) => {
            deck.push({
                id: index,
                iconId: item.id,
                isFlipped: false,
                isMatched: false,
            });
        });
        setCards(deck);
        setFlippedCards([]);
        setMoves(0);
        setIsWon(false);
    };

    useEffect(() => {
        initGame();
    }, []);

    useEffect(() => {
        if (flippedCards.length === 2) {
            const [first, second] = flippedCards;
            if (cards[first].iconId === cards[second].iconId) {
                setCards(prev => prev.map(card =>
                    (card.id === first || card.id === second)
                        ? { ...card, isMatched: true }
                        : card
                ));
                setFlippedCards([]);
            } else {
                const timer = setTimeout(() => {
                    setCards(prev => prev.map(card =>
                        (card.id === first || card.id === second)
                            ? { ...card, isFlipped: false }
                            : card
                    ));
                    setFlippedCards([]);
                }, 1000);
                return () => clearTimeout(timer);
            }
            setMoves(m => m + 1);
        }
    }, [flippedCards]);

    useEffect(() => {
        if (cards.length > 0 && cards.every(card => card.isMatched)) {
            setIsWon(true);
        }
    }, [cards]);

    const handleCardClick = (id: number) => {
        if (flippedCards.length === 2 || cards[id].isFlipped || cards[id].isMatched) return;

        setCards(prev => prev.map(card =>
            card.id === id ? { ...card, isFlipped: true } : card
        ));
        setFlippedCards(prev => [...prev, id]);
    };

    return (
        <div className="bg-white rounded-3xl border border-christ-light shadow-2xl overflow-hidden max-w-2xl mx-auto">
            <div className="bg-christ-blue p-6 text-white flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <BookOpen className="text-christ-gold" />
                    <h3 className="text-xl font-bold tracking-tight">Memory Match</h3>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-xs font-medium bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
                        Moves: {moves}
                    </div>
                    <button
                        onClick={initGame}
                        className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <RotateCcw size={18} />
                    </button>
                </div>
            </div>

            <div className="p-8">
                <div className="grid grid-cols-4 gap-4 aspect-square max-w-[400px] mx-auto">
                    {cards.map((card) => {
                        const IconComponent = ICONS.find(i => i.id === card.iconId)?.icon || BookOpen;
                        const iconColor = ICONS.find(i => i.id === card.iconId)?.color || 'text-maroon-600';

                        return (
                            <motion.div
                                key={card.id}
                                className="relative cursor-pointer perspective-1000 h-full w-full"
                                onClick={() => handleCardClick(card.id)}
                                whileHover={{ scale: card.isFlipped || card.isMatched ? 1 : 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <motion.div
                                    className="w-full h-full relative preserve-3d transition-all duration-500"
                                    animate={{ rotateY: card.isFlipped || card.isMatched ? 180 : 0 }}
                                >
                                    {/* Front (Hidden) */}
                                    <div className="absolute inset-0 backface-hidden bg-christ-dark rounded-xl flex items-center justify-center border-2 border-christ-blue/20 shadow-md">
                                        <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white/20 text-xs font-serif italic">
                                            C
                                        </div>
                                    </div>

                                    {/* Back (Icon) */}
                                    <div
                                        className={clsx(
                                            "absolute inset-0 backface-hidden bg-christ-silver rounded-xl flex items-center justify-center border-2 rotate-y-180 shadow-md",
                                            card.isMatched ? "border-green-400 bg-green-50" : "border-christ-light"
                                        )}
                                    >
                                        <IconComponent className={clsx("w-8 h-8 sm:w-10 sm:h-10", iconColor)} />
                                    </div>
                                </motion.div>
                            </motion.div>
                        );
                    })}
                </div>

                <AnimatePresence>
                    {isWon && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-8 bg-green-100 border border-green-200 p-6 rounded-2xl text-center"
                        >
                            <div className="flex justify-center mb-2">
                                <CheckCircle2 className="text-green-600 w-12 h-12" />
                            </div>
                            <h4 className="text-xl font-bold text-green-900 mb-1">Magnificent!</h4>
                            <p className="text-green-700 text-sm mb-4">
                                You matched all icons in {moves} moves.
                            </p>
                            <button
                                onClick={initGame}
                                className="px-6 py-2 bg-green-600 text-white font-bold rounded-full hover:bg-green-700 transition-all"
                            >
                                Play Again
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <style jsx global>{`
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
        </div>
    );
}
