import { createServerClient } from '@/lib/supabase-server'
import Link from 'next/link'
import { FileText, Puzzle, Trophy, Bell, ChevronRight } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const supabase = await createServerClient()

  // Fetch summary counts
  const { count: editionsCount } = await supabase.from('editions').select('*', { count: 'exact', head: true })
  const { count: riddlesCount } = await supabase.from('riddles').select('*', { count: 'exact', head: true })
  const { count: winnersCount } = await supabase.from('winners').select('*', { count: 'exact', head: true })
  const { count: submissionsCount } = await supabase.from('riddle_submissions').select('*', { count: 'exact', head: true })

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-4xl font-black text-christ-dark tracking-tight">Overview</h1>
        <p className="text-christ-blue/60 font-medium mt-1">Quick summary of your newsletter platform status.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Volumes" count={editionsCount || 0} icon={FileText} color="bg-blue-500" />
        <StatCard title="Active Challenges" count={riddlesCount || 0} icon={Puzzle} color="bg-purple-500" />
        <StatCard title="Total Submissions" count={submissionsCount || 0} icon={Trophy} color="bg-christ-gold" />
        <StatCard title="Announcements" count={0} icon={Bell} color="bg-red-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Recent Submissions placeholder */}
        <div className="bg-white rounded-3xl p-8 border border-christ-light shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-xl text-christ-dark">Recent Activity</h3>
            <Link href="/admin/challenges" className="text-sm font-bold text-christ-blue hover:underline">View All</Link>
          </div>
          <div className="space-y-4">
            <p className="text-christ-blue/40 text-sm italic py-10 text-center">No recent activity found.</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <h3 className="font-bold text-xl text-christ-dark px-2">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-4">
            <QuickActionLink
              href="/admin/editions/new"
              label="Publish New Volume"
              desc="Upload PDF and parse articles"
              icon={FileText}
            />
            <QuickActionLink
              href="/admin/challenges/new"
              label="Create Challenge"
              desc="Add a new logic riddle for students"
              icon={Puzzle}
            />
            <QuickActionLink
              href="/admin/announcements/new"
              label="Post Announcement"
              desc="Share updates or upcoming events"
              icon={Bell}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, count, icon: Icon, color }: { title: string, count: number, icon: any, color: string }) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-christ-light shadow-sm flex items-center gap-6">
      <div className={`p-4 rounded-2xl ${color} text-white`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-xs font-bold text-christ-blue/50 uppercase tracking-widest">{title}</p>
        <p className="text-3xl font-black text-christ-dark">{count}</p>
      </div>
    </div>
  )
}

function QuickActionLink({ href, label, desc, icon: Icon }: { href: string, label: string, desc: string, icon: any }) {
  return (
    <Link href={href} className="flex items-center justify-between p-6 bg-white border border-christ-light rounded-3xl hover:border-christ-blue transition-all group">
      <div className="flex items-center gap-5">
        <div className="p-3 bg-christ-silver rounded-2xl group-hover:bg-christ-light transition-colors">
          <Icon className="text-christ-blue" size={20} />
        </div>
        <div>
          <p className="font-bold text-christ-dark">{label}</p>
          <p className="text-xs text-christ-blue/50 font-medium">{desc}</p>
        </div>
      </div>
      <ChevronRight className="text-christ-light group-hover:text-christ-blue transition-all" size={20} />
    </Link>
  )
}