'use client';

import { LucideIcon, ArrowRight } from 'lucide-react';

interface AnnouncementCardProps {
    title: string;
    description: string;
    date: string;
    icon?: LucideIcon;
    href?: string;
    type?: 'announcement' | 'event';
}

export default function AnnouncementCard({
    title,
    description,
    date,
    icon: Icon,
    href = "#",
    type = 'announcement'
}: AnnouncementCardProps) {
    return (
        <div className={`group p-6 rounded-2xl border transition-all duration-300 hover:shadow-xl ${type === 'announcement'
            ? 'bg-white border-christ-light hover:border-christ-blue/30'
            : 'bg-christ-dark border-white/10 hover:border-white/20 text-white'
            }`}>
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${type === 'announcement' ? 'bg-christ-light text-christ-blue' : 'bg-white/10 text-christ-gold'
                    }`}>
                    {Icon ? <Icon size={24} /> : <div className="w-6 h-6" />}
                </div>
                <span className={`text-xs font-bold uppercase tracking-wider ${type === 'announcement' ? 'text-christ-dark/40' : 'text-christ-light/60'
                    }`}>
                    {date}
                </span>
            </div>

            <h3 className={`text-xl font-bold mb-2 ${type === 'announcement' ? 'text-christ-dark group-hover:text-christ-blue' : 'text-white'
                }`}>
                {title}
            </h3>

            <p className={`text-sm leading-relaxed mb-6 font-medium ${type === 'announcement' ? 'text-christ-dark/70' : 'text-christ-light/80'
                }`}>
                {description}
            </p>

            <a
                href={href}
                className={`inline-flex items-center gap-2 text-sm font-bold transition-all ${type === 'announcement'
                    ? 'text-christ-blue group-hover:translate-x-1'
                    : 'text-christ-gold group-hover:translate-x-1'
                    }`}
            >
                Learn More <ArrowRight size={16} />
            </a>
        </div>
    );
}
