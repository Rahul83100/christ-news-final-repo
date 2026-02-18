'use client'

import React from 'react'
import Link from 'next/link'
import AdminEditionForm from '@/components/admin/AdminEditionForm'

export default function NewEditionPage() {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <Link href="/admin/editions" className="text-forest-600 hover:text-maroon-600 text-sm mb-2 block font-medium">
          ← Back to Newsletter Volumes
        </Link>
        <h1 className="font-display text-3xl font-bold text-forest-900">New Edition</h1>
        <p className="text-forest-600">Start a new volume for the newsletter by filling in the details below.</p>
      </div>

      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-cream-300">
        <AdminEditionForm />
      </div>
    </div>
  )
}