'use client'

import { Mail, ArrowLeft, Send, Construction } from 'lucide-react'
import Link from 'next/link'

export default function AdminSubscribersPage() {
    return (
        <div className="min-h-screen bg-christ-silver p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link
                        href="/"
                        className="p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow border border-cream-200"
                    >
                        <ArrowLeft size={20} className="text-christ-dark" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black text-christ-dark tracking-tight">
                            Update Subscribers
                        </h1>
                        <p className="text-christ-dark/60 text-sm font-serif italic">
                            Compose and send newsletters to all subscribers
                        </p>
                    </div>
                </div>

                {/* Coming Soon Card */}
                <div className="bg-white rounded-3xl shadow-xl border border-cream-200 p-16 text-center">
                    <div className="w-20 h-20 bg-maroon-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Construction className="text-maroon-500 w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-black text-christ-dark mb-3">
                        Mail Composer Coming Soon
                    </h2>
                    <p className="text-christ-dark/60 max-w-md mx-auto font-serif italic mb-8">
                        This is where you'll compose newsletters, select recipients, and send updates to all subscribers.
                    </p>
                    <div className="flex items-center justify-center gap-6 text-sm">
                        <div className="flex items-center gap-2 text-christ-blue/70">
                            <Mail size={16} />
                            <span>Compose emails</span>
                        </div>
                        <div className="flex items-center gap-2 text-christ-blue/70">
                            <Send size={16} />
                            <span>Auto-mail subscribers</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
