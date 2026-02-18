'use client';

import { useState, useEffect } from 'react';
import { Lightbulb, Trophy, RotateCcw, CheckCircle2, Loader2, Plus, Trash2, X } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

interface PuzzleGameProps {
    isAdmin?: boolean;
}

export default function PuzzleGame({ isAdmin = false }: PuzzleGameProps) {
    const [riddles, setRiddles] = useState<any[]>([]);
    const [currentLevel, setCurrentLevel] = useState(0);
    const [answer, setAnswer] = useState('');
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [hintVisible, setHintVisible] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newRiddle, setNewRiddle] = useState({ question: '', answer: '', hint: '' });
    const [addingRiddle, setAddingRiddle] = useState(false);
    const [deletingRiddle, setDeletingRiddle] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        fetchRiddles();
    }, []);

    async function fetchRiddles() {
        setLoading(true);
        const { data, error } = await supabase
            .from('riddles')
            .select('id, question, hint, answer')
            .eq('is_active', true)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching riddles:', JSON.stringify(error, null, 2) || error);
        } else {
            setRiddles(data || []);
        }
        setLoading(false);
    }

    const puzzle = riddles[currentLevel];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!puzzle) return;

        setSubmitting(true);
        const isAnswerCorrect = answer.toLowerCase().trim() === puzzle.answer.toLowerCase().trim();
        setIsCorrect(isAnswerCorrect);

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await supabase.from('riddle_submissions').insert([
                {
                    user_id: user.id,
                    riddle_id: puzzle.id,
                    submitted_answer: answer,
                    is_correct: isAnswerCorrect
                }
            ]);
        }

        if (isAnswerCorrect) {
            toast.success('Brilliant! Correct answer.');
        } else {
            toast.error('Not quite right. Try again!');
        }
        setSubmitting(false);
    };

    const handleNext = () => {
        const next = (currentLevel + 1) % riddles.length;
        setCurrentLevel(next);
        setAnswer('');
        setIsCorrect(null);
        setHintVisible(false);
    };

    const handleReset = () => {
        setAnswer('');
        setIsCorrect(null);
        setHintVisible(false);
    };

    const handleAddRiddle = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newRiddle.question || !newRiddle.answer) return;

        setAddingRiddle(true);
        try {
            const { error } = await supabase.from('riddles').insert([{
                question: newRiddle.question,
                answer: newRiddle.answer,
                hint: newRiddle.hint || null,
                is_active: true,
            }]);

            if (error) throw error;

            toast.success('Riddle added!');
            setNewRiddle({ question: '', answer: '', hint: '' });
            setShowAddForm(false);
            fetchRiddles();
        } catch (err: any) {
            toast.error(err.message || 'Failed to add riddle');
        } finally {
            setAddingRiddle(false);
        }
    };

    const handleDeleteRiddle = async () => {
        if (!puzzle) return;
        if (!confirm('Delete this riddle?')) return;

        setDeletingRiddle(true);
        try {
            const { error } = await supabase
                .from('riddles')
                .update({ is_active: false })
                .eq('id', puzzle.id);

            if (error) throw error;

            toast.success('Riddle removed');
            fetchRiddles();
            setCurrentLevel(0);
            setAnswer('');
            setIsCorrect(null);
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setDeletingRiddle(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-3xl border border-christ-light shadow-2xl p-20 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="animate-spin text-christ-blue" size={48} />
                <p className="text-christ-blue/40 font-bold uppercase tracking-widest text-xs">Loading Challenges...</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Admin: Add Riddle Button */}
            {isAdmin && (
                <div>
                    {showAddForm ? (
                        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="font-bold text-purple-800 flex items-center gap-2">
                                    <Plus size={18} /> Add New Riddle
                                </h4>
                                <button onClick={() => setShowAddForm(false)} className="text-purple-400 hover:text-purple-600">
                                    <X size={20} />
                                </button>
                            </div>
                            <form onSubmit={handleAddRiddle} className="space-y-3">
                                <input
                                    type="text"
                                    required
                                    value={newRiddle.question}
                                    onChange={(e) => setNewRiddle(p => ({ ...p, question: e.target.value }))}
                                    placeholder="Riddle question..."
                                    className="w-full px-4 py-2.5 bg-white border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-300 outline-none text-sm"
                                />
                                <input
                                    type="text"
                                    required
                                    value={newRiddle.answer}
                                    onChange={(e) => setNewRiddle(p => ({ ...p, answer: e.target.value }))}
                                    placeholder="Answer..."
                                    className="w-full px-4 py-2.5 bg-white border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-300 outline-none text-sm"
                                />
                                <input
                                    type="text"
                                    value={newRiddle.hint}
                                    onChange={(e) => setNewRiddle(p => ({ ...p, hint: e.target.value }))}
                                    placeholder="Hint (optional)..."
                                    className="w-full px-4 py-2.5 bg-white border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-300 outline-none text-sm"
                                />
                                <button
                                    type="submit"
                                    disabled={addingRiddle}
                                    className="px-6 py-2.5 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors text-sm disabled:opacity-50 flex items-center gap-2"
                                >
                                    {addingRiddle ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
                                    Add Riddle
                                </button>
                            </form>
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 font-bold rounded-xl hover:bg-purple-200 transition-colors text-sm"
                        >
                            <Plus size={16} /> Add Riddle
                        </button>
                    )}
                </div>
            )}

            {riddles.length === 0 ? (
                <div className="bg-white rounded-3xl border border-christ-light shadow-2xl p-20 text-center space-y-4">
                    <Trophy className="mx-auto text-christ-gold/20" size={48} />
                    <p className="text-christ-blue/40 font-medium italic">No active challenges at the moment. Check back later!</p>
                </div>
            ) : (
                <div className="bg-white rounded-3xl border border-christ-light shadow-2xl overflow-hidden max-w-2xl mx-auto">
                    <div className="bg-christ-blue p-6 text-white flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <Trophy className="text-christ-gold" />
                            <h3 className="text-xl font-bold tracking-tight">Logic Challenge #{currentLevel + 1}</h3>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-white/10 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
                                {currentLevel + 1} / {riddles.length}
                            </div>
                            {/* Admin: Delete current riddle */}
                            {isAdmin && puzzle && (
                                <button
                                    onClick={handleDeleteRiddle}
                                    disabled={deletingRiddle}
                                    className="p-1.5 bg-red-500/20 text-red-200 hover:bg-red-500/40 rounded-lg transition-colors"
                                    title="Delete this riddle"
                                >
                                    {deletingRiddle ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="p-8 space-y-8">
                        <div className="space-y-4">
                            <p className="font-serif text-2xl text-christ-dark leading-snug text-center italic min-h-[80px] flex items-center justify-center">
                                "{puzzle.question}"
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={answer}
                                    onChange={(e) => setAnswer(e.target.value)}
                                    placeholder="Type your answer here..."
                                    disabled={isCorrect === true}
                                    className={`w-full px-6 py-4 bg-christ-silver border-2 rounded-2xl outline-none transition-all text-lg font-medium text-christ-dark ${isCorrect === true ? 'border-green-500 bg-green-50' :
                                        isCorrect === false ? 'border-red-400 bg-red-50' :
                                            'border-christ-light focus:border-christ-blue'
                                        }`}
                                />
                                {isCorrect === true && (
                                    <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500" />
                                )}
                            </div>

                            <div className="flex gap-4">
                                {isCorrect === true ? (
                                    <button
                                        type="button"
                                        onClick={handleNext}
                                        className="flex-grow py-4 bg-green-600 text-white font-bold rounded-2xl hover:bg-green-700 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        Next Challenge
                                    </button>
                                ) : (
                                    <button
                                        type="submit"
                                        disabled={submitting || !answer}
                                        className="flex-grow py-4 bg-christ-blue text-white font-bold rounded-2xl hover:bg-christ-dark transition-all shadow-lg active:scale-95 disabled:opacity-50"
                                    >
                                        {submitting ? 'Verifying...' : 'Submit Answer'}
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="px-6 py-4 bg-christ-light text-christ-dark font-bold rounded-2xl hover:bg-christ-silver transition-all"
                                >
                                    <RotateCcw size={20} />
                                </button>
                            </div>
                        </form>

                        <div className="border-t border-christ-light pt-6">
                            <button
                                onClick={() => setHintVisible(!hintVisible)}
                                className="flex items-center gap-2 text-sm font-bold text-christ-blue hover:text-christ-dark transition-colors"
                            >
                                <Lightbulb size={16} />
                                {hintVisible ? 'Hide Hint' : 'Need a hint?'}
                            </button>
                            {hintVisible && (
                                <p className="mt-2 text-sm text-christ-blue/70 italic animate-fade-in font-medium">
                                    {puzzle.hint}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
