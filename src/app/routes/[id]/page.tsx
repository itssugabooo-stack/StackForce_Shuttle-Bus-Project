'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { RouteStopManager } from '@/components/RouteStopManager';

export default function RouteDetailsPage({
  params,
}: {
  params: Promise<{ id?: string; routeId?: string }>;
}) {
  const resolvedParams = use(params);
  const routeId = resolvedParams.id || resolvedParams.routeId || 'route-1';

  return (
    <main className="min-h-screen bg-slate-900 p-8 text-slate-100">
      <div className="max-w-4xl mx-auto space-y-6">
        <Link
          href="/"
          className="inline-flex items-center text-xs text-blue-400 hover:text-blue-300 transition"
        >
          &larr; Back to Dashboard
        </Link>
        <RouteStopManager routeId={routeId} />
      </div>
    </main>
  );
}