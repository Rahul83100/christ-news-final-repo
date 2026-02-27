'use client'

import { useState, useEffect, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase'
import EditionGrid from '@/components/EditionGrid'
import PuzzleGame from '@/components/PuzzleGame'
import MemoryGame from '@/components/MemoryGame'
import WordSearch from '@/components/WordSearch'
import CrosswordGame from '@/components/CrosswordGame'
import MouseGlow from '@/components/MouseGlow'
import AnnouncementCard from '@/components/AnnouncementCard'
import AuthGate from '@/components/AuthGate'
import { Trophy, Star, Users, MapPin, Calendar, Mail, Linkedin, Github, Bell } from 'lucide-react'
import Image from 'next/image'

interface HomePageProps {
    isAdmin?: boolean
}

const SectionHeader = ({ title, subtitle, icon: Icon }: { title: string, subtitle: string, icon?: any }) => (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center space-y-4 mb-20"
    >
        {Icon && <Icon className="mx-auto text-christ-blue mb-6" size={48} />}
        <h2 className="font-display text-5xl font-black text-christ-dark tracking-tight uppercase leading-none">
            {title}
        </h2>
        <p className="text-christ-blue/80 max-w-2xl mx-auto font-serif italic text-lg pb-4 border-b border-christ-light w-fit">
            {subtitle}
        </p>
    </motion.div>
)

export default function HomePage({ isAdmin }: HomePageProps) {
    const [winners, setWinners] = useState<any[]>([])
    const [announcements, setAnnouncements] = useState<any[]>([])
    const [events, setEvents] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        async function fetchData() {
            setLoading(true)
            try {
                // Fetch winners
                const { data: winnersData } = await supabase
                    .from('winners')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(3)

                if (winnersData) setWinners(winnersData)

                // Fetch announcements
                const { data: annData } = await supabase
                    .from('announcements')
                    .select('*')
                    .eq('is_public', true)
                    .eq('type', 'announcement')
                    .order('created_at', { ascending: false })
                    .limit(3)

                if (annData) setAnnouncements(annData)

                // Fetch events
                const { data: eventData } = await supabase
                    .from('announcements')
                    .select('*')
                    .eq('is_public', true)
                    .eq('type', 'event')
                    .order('created_at', { ascending: false })
                    .limit(2)

                if (eventData) setEvents(eventData)
            } catch (error) {
                console.error("Supabase data fetch failed (running in offline mode):", error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    return (
        <main className="relative bg-cream-50 min-h-screen overflow-x-hidden">
            <MouseGlow />



            <div className="flex flex-col w-full relative z-10">
                {/* 1. Home Section */}
                <section id="home" className="min-h-screen flex flex-col pt-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
                    <div className="text-center space-y-8 mb-20">
                        <motion.h1
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="font-display text-7xl md:text-9xl font-black tracking-tighter leading-none"
                            style={{
                                background: 'linear-gradient(90deg, #00a8ff 0%, #00d2ff 25%, #feca57 50%, #00d2ff 75%, #00a8ff 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                display: 'inline-block'
                            }}
                        >
                            E-luminate
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="font-serif text-xl md:text-2xl text-forest-700 max-w-3xl mx-auto leading-relaxed opacity-90"
                        >
                            Welcome to E-Luminate, your space for insights, updates, and ideas that inspire learning and innovation.
                            <br /><br />
                            Stay connected with the latest highlights, achievements, and opportunities from our academic community.
                        </motion.p>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="flex justify-center gap-4 pt-4"
                        >
                            <a href="#puzzles" className="px-8 py-4 bg-christ-blue text-white rounded-full font-bold hover:bg-christ-dark transition-all shadow-xl hover:-translate-y-1">
                                Play Puzzles
                            </a>
                            <a href="#winners" className="px-8 py-4 border-2 border-christ-dark text-christ-dark rounded-full font-bold hover:bg-christ-light transition-all">
                                View Winners
                            </a>
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="space-y-12 pb-24"
                    >
                        <div className="flex items-center gap-4 mb-8">
                            <div className="h-px bg-cream-300 flex-grow" />
                            <h2 className="font-display text-4xl font-black text-forest-950 uppercase tracking-[0.2em]">The Library</h2>
                            <div className="h-px bg-cream-300 flex-grow" />
                        </div>



                        <Suspense fallback={
                            <div className="flex gap-8 px-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="min-w-[280px] aspect-[3/4] bg-cream-100/50 rounded-2xl animate-pulse" />
                                ))}
                            </div>
                        }>
                            <motion.div
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                            >
                                <EditionGrid isAdmin={isAdmin} />
                            </motion.div>
                        </Suspense>
                    </motion.div>
                </section>

                {/* 2. Puzzles & Games Section */}
                <section id="puzzles" className="py-32 bg-cream-100/50 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto w-full">
                        <SectionHeader
                            title="Interactive Hub"
                            subtitle="Challenge your mind with our collection of university-themed puzzles and logic games."
                            icon={Star}
                        />

                        <AuthGate fallbackMessage="Sign in to play games">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <motion.div
                                    initial={{ opacity: 0, y: 50 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.1 }}
                                    className="space-y-6"
                                >
                                    <h3 className="font-display text-2xl font-bold text-forest-900 border-l-4 border-maroon-600 pl-4">Riddles & Logic</h3>
                                    <PuzzleGame isAdmin={isAdmin} />
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 50 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.2 }}
                                    className="space-y-6"
                                >
                                    <h3 className="font-display text-2xl font-bold text-forest-900 border-l-4 border-maroon-600 pl-4">Memory Match</h3>
                                    <MemoryGame />
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 50 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.3 }}
                                    className="space-y-6"
                                >
                                    <h3 className="font-display text-2xl font-bold text-christ-dark border-l-4 border-christ-gold pl-4">Word Search</h3>
                                    <WordSearch isAdmin={isAdmin} />
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 50 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.4 }}
                                    className="space-y-6"
                                >
                                    <h3 className="font-display text-2xl font-bold text-forest-900 border-l-4 border-maroon-600 pl-4">Crossword</h3>
                                    <CrosswordGame />
                                </motion.div>
                            </div>
                        </AuthGate>
                    </div>
                </section>

                {/* 3. Winners Section */}
                <section id="winners" className="py-24 bg-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-christ-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <SectionHeader
                            title="Hall of Fame"
                            subtitle="Celebrating excellence and achievement within our university community."
                            icon={Trophy}
                        />

                        <AuthGate fallbackMessage="Sign in to view the Hall of Fame">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {loading ? (
                                    [1, 2, 3].map(i => (
                                        <div key={i} className="h-64 bg-christ-silver rounded-2xl animate-pulse" />
                                    ))
                                ) : winners.length === 0 ? (
                                    <div className="col-span-full py-12 text-center text-christ-blue/30 font-serif italic">
                                        No winners announced yet. Check back soon!
                                    </div>
                                ) : (
                                    winners.map((winner, idx) => (
                                        <motion.div
                                            key={winner.id}
                                            initial={{ opacity: 0, y: 30 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: idx * 0.1 }}
                                            whileHover={{ y: -10 }}
                                            className="group relative bg-cream-50 p-6 rounded-2xl border border-cream-200 shadow-sm hover:shadow-xl transition-all duration-300"
                                        >
                                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gradient-to-br from-christ-gold to-yellow-500 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                                <Trophy size={20} />
                                            </div>

                                            <div className="mt-8 text-center space-y-3">
                                                <h3 className="font-display text-xl font-bold text-forest-900">{winner.name}</h3>
                                                <div className="inline-block px-3 py-1 bg-christ-blue/10 text-christ-blue text-xs font-bold rounded-full uppercase tracking-wider">
                                                    {winner.category || "General"}
                                                </div>
                                                <p className="text-forest-600 text-sm italic">"{winner.achievement}"</p>
                                                <div className="pt-4 border-t border-cream-200 text-xs text-forest-400 font-serif">
                                                    {winner.department} • {new Date(winner.date).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </AuthGate>
                    </div>
                </section>

                {/* 4. Announcements & Events Section */}
                <section id="announcements" className="py-32 px-4 sm:px-6 lg:px-8 bg-white relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-64 h-64 bg-maroon-50 rounded-full -translate-x-1/2 -translate-y-1/2 opacity-20" />
                    <div className="max-w-7xl mx-auto w-full relative z-10">
                        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                            <div className="space-y-4">
                                <motion.h2
                                    initial={{ opacity: 0, x: -30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    className="font-display text-5xl font-black text-forest-950 tracking-tight"
                                >
                                    Announcements
                                </motion.h2>
                                <p className="text-forest-600 max-w-md font-serif italic text-lg leading-snug">Stay updated with the latest news, winner announcements, and upcoming university events.</p>
                            </div>
                            <motion.div
                                whileHover={{ rotate: 15 }}
                                className="p-4 bg-maroon-50 rounded-2xl border border-maroon-100"
                            >
                                <Bell className="text-maroon-700" size={32} />
                            </motion.div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {loading ? (
                                [1, 2, 3].map(i => (
                                    <div key={i} className="h-48 bg-christ-silver rounded-2xl animate-pulse" />
                                ))
                            ) : announcements.length === 0 ? (
                                <div className="col-span-full py-12 text-center text-christ-blue/30 font-serif italic">No new announcements at this time.</div>
                            ) : (
                                announcements.map((ann, idx) => (
                                    <motion.div
                                        key={ann.id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: idx * 0.1 }}
                                    >
                                        <AnnouncementCard
                                            title={ann.title}
                                            description={ann.description}
                                            date={ann.date}
                                            href={ann.href}
                                        />
                                    </motion.div>
                                ))
                            )}
                        </div>

                        <div id="events" className="mt-32 pt-32 border-t border-cream-200">
                            <div className="flex items-center gap-4 mb-12">
                                <Calendar className="text-maroon-600" />
                                <h3 className="text-2xl font-display font-bold text-forest-900 uppercase tracking-widest">Upcoming Events</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {loading ? (
                                    [1, 2].map(i => (
                                        <div key={i} className="h-48 bg-christ-silver rounded-2xl animate-pulse" />
                                    ))
                                ) : events.length === 0 ? (
                                    <div className="col-span-full py-12 text-center text-christ-blue/30 font-serif italic">Stay tuned for upcoming events!</div>
                                ) : (
                                    events.map((evt) => (
                                        <AnnouncementCard
                                            key={evt.id}
                                            type="event"
                                            title={evt.title}
                                            description={evt.description}
                                            date={evt.date}
                                            href={evt.href}
                                        />
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* 5. Credits Section - Professional Developer Profile */}
                <section id="credits" className="py-12 px-4 sm:px-6 lg:px-8 bg-forest-900 text-cream-50 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-1/3 h-full bg-maroon-900/10 skew-x-[-20deg] translate-x-1/2" />

                    <div className="max-w-7xl mx-auto w-full relative z-10">
                        <div className="flex flex-col md:flex-row gap-8 items-center justify-center text-center md:text-left">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                className="relative"
                            >
                                <div className="relative w-48 h-48 md:w-56 md:h-56 border-4 border-gold-400 rounded-full overflow-hidden shadow-[0px_10px_20px_0px_rgba(0,0,0,0.3)] group mx-auto">
                                    <Image
                                        src="/WhatsApp Image 2026-02-02 at 21.44.08.jpeg"
                                        alt="Rahul R - Lead Developer"
                                        fill
                                        className="object-cover object-top bg-forest-800 grayscale hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                                    />
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="space-y-4 max-w-2xl"
                            >
                                <div className="space-y-1">
                                    <span className="text-gold-400 font-bold tracking-[0.3em] uppercase text-[10px] block mb-1">Architect & Lead Developer</span>
                                    <h2 className="font-display text-3xl md:text-4xl font-black text-cream-100 leading-none">
                                        Rahul R
                                    </h2>
                                    <div className="flex items-center gap-4 pt-1 text-forest-300 justify-center md:justify-start">
                                        <div className="flex items-center gap-1.5">
                                            <Users size={14} />
                                            <span className="font-medium text-xs underline underline-offset-4 decoration-maroon-500/50">4 BSc CM</span>
                                        </div>
                                        <div className="w-1 h-1 rounded-full bg-gold-400" />
                                        <div className="flex items-center gap-1.5">
                                            <Star size={14} />
                                            <span className="font-medium text-xs underline underline-offset-4 decoration-maroon-500/50">Reg No: 2440166</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <p className="text-lg font-serif leading-relaxed text-forest-100 italic">
                                        "Engineering complex, high-fidelity digital experiences that bridge the gap between academic excellence and modern web aesthetics."
                                    </p>
                                    <p className="text-forest-400 leading-relaxed text-sm">
                                        As the primary architect of the Christ University Newsletter platform, Rahul has integrated sophisticated UI systems, real-time Supabase integrations, and custom AI-driven components to create a world-class digital publication hub.
                                    </p>
                                </div>

                                <div className="pt-4 border-t border-forest-800 flex flex-wrap gap-4 items-center justify-center md:justify-start">
                                    <div className="flex gap-3">
                                        <a href="https://www.linkedin.com/in/rahul-r-955a08346/" target="_blank" rel="noopener noreferrer" className="p-2 bg-forest-800 hover:bg-forest-700 rounded-full transition-all hover:-translate-y-1"><Linkedin size={16} /></a>
                                        <a href="https://github.com/Rahul83100" target="_blank" rel="noopener noreferrer" className="p-2 bg-forest-800 hover:bg-forest-700 rounded-full transition-all hover:-translate-y-1"><Github size={16} /></a>
                                    </div>
                                    <div className="w-px h-6 bg-forest-800 hidden md:block" />
                                    <p className="text-[10px] font-medium text-cream-200 uppercase tracking-widest">
                                        Stack: Next.js • TypeScript • Tailwind • Supabase
                                    </p>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    )
}
