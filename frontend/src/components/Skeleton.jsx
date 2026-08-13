import React from 'react';

// Base Skeleton Block
export const SkeletonBlock = ({ className = '' }) => (
  <div className={`bg-slate-200 animate-pulse rounded-lg ${className}`} />
);

// Post Skeleton (Community Feed Loader)
export const PostSkeleton = () => (
  <div className="bg-white rounded-3xl border border-slate-100 p-5 space-y-4 shadow-sm w-full">
    {/* Header */}
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3 w-2/3">
        <SkeletonBlock className="w-10 h-10 rounded-full shrink-0" />
        <div className="space-y-2 w-full">
          <SkeletonBlock className="h-3.5 w-1/3 rounded" />
          <SkeletonBlock className="h-2.5 w-1/4 rounded" />
        </div>
      </div>
      <SkeletonBlock className="h-3 w-16 rounded" />
    </div>

    {/* Media Body (Simulating optional image/video block) */}
    <SkeletonBlock className="h-48 w-full rounded-2xl" />

    {/* Content lines */}
    <div className="space-y-2.5">
      <SkeletonBlock className="h-4.5 w-2/3 rounded-md" />
      <SkeletonBlock className="h-3.5 w-full rounded" />
      <SkeletonBlock className="h-3.5 w-5/6 rounded" />
    </div>

    {/* Action footer */}
    <div className="flex items-center space-x-6 pt-3 border-t border-slate-50">
      <SkeletonBlock className="h-5 w-12 rounded-lg" />
      <SkeletonBlock className="h-5 w-12 rounded-lg" />
    </div>
  </div>
);

// Dashboard Athlete View Skeleton
export const DashboardAthleteSkeleton = () => (
  <div className="space-y-8 max-w-5xl mx-auto">
    {/* Header */}
    <div className="flex items-center justify-between border-b border-slate-100 pb-6 w-full">
      <div className="space-y-2.5 w-1/3">
        <SkeletonBlock className="h-4.5 w-1/2 rounded" />
        <SkeletonBlock className="h-8 w-full rounded-xl" />
        <SkeletonBlock className="h-3.5 w-2/3 rounded" />
      </div>
      <div className="flex space-x-2 shrink-0">
        <SkeletonBlock className="h-10 w-24 rounded-xl" />
        <SkeletonBlock className="h-10 w-28 rounded-xl" />
      </div>
    </div>

    {/* AI Coach main big card */}
    <div className="bg-slate-100/70 border border-slate-100 p-8 rounded-3xl space-y-5 animate-pulse">
      <SkeletonBlock className="h-6 w-32 rounded-full" />
      <SkeletonBlock className="h-10 w-4/5 rounded-xl bg-slate-200" />
      <SkeletonBlock className="h-4.5 w-2/3 rounded-lg bg-slate-200" />
      <SkeletonBlock className="h-12 w-48 rounded-xl bg-slate-200" />
    </div>

    {/* Grid Content */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Alerts Column */}
      <div className="lg:col-span-2 space-y-4">
        <SkeletonBlock className="h-5 w-48 rounded" />
        <div className="space-y-3">
          <SkeletonBlock className="h-20 w-full rounded-2xl" />
          <SkeletonBlock className="h-20 w-full rounded-2xl" />
        </div>
      </div>

      {/* Summary Column */}
      <div className="space-y-4">
        <SkeletonBlock className="h-5 w-40 rounded" />
        <div className="bg-white border border-slate-100 rounded-3xl p-6 space-y-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center space-x-3 w-1/2">
                <SkeletonBlock className="w-10 h-10 rounded-xl shrink-0" />
                <div className="space-y-1.5 w-full">
                  <SkeletonBlock className="h-2.5 w-2/3 rounded" />
                  <SkeletonBlock className="h-4.5 w-full rounded" />
                </div>
              </div>
              <SkeletonBlock className="h-4 w-8 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Dashboard Trainer View Skeleton
export const DashboardTrainerSkeleton = () => (
  <div className="space-y-8 max-w-7xl mx-auto">
    {/* Header */}
    <div className="flex items-center justify-between border-b border-slate-100 pb-6 w-full">
      <div className="space-y-2 w-1/3">
        <SkeletonBlock className="h-4 w-1/3 rounded" />
        <SkeletonBlock className="h-8 w-full rounded-xl" />
        <SkeletonBlock className="h-3.5 w-2/3 rounded" />
      </div>
      <SkeletonBlock className="h-10 w-28 rounded-xl shrink-0" />
    </div>

    {/* Metrics Grid */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <div key={i} className="bg-white p-5 rounded-3xl border border-slate-100 space-y-3 shadow-sm">
          <SkeletonBlock className="h-3 w-2/3 rounded" />
          <SkeletonBlock className="h-8 w-1/2 rounded-xl" />
          <SkeletonBlock className="h-2.5 w-3/4 rounded" />
        </div>
      ))}
    </div>

    {/* Charts & Group List Row */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Chart */}
      <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-100 space-y-4 shadow-sm">
        <div className="space-y-1.5">
          <SkeletonBlock className="h-4.5 w-1/3 rounded" />
          <SkeletonBlock className="h-3 w-1/4 rounded" />
        </div>
        <SkeletonBlock className="h-48 w-full rounded-2xl" />
      </div>

      {/* Group List */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 space-y-4 shadow-sm">
        <SkeletonBlock className="h-4.5 w-1/3 rounded" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between items-center p-3 bg-slate-50 border border-slate-100 rounded-2xl">
              <div className="space-y-1.5 w-1/2">
                <SkeletonBlock className="h-3.5 w-full rounded" />
                <SkeletonBlock className="h-2.5 w-1/3 rounded" />
              </div>
              <SkeletonBlock className="h-4 w-12 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Table list */}
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-6 space-y-5">
      <div className="space-y-1.5">
        <SkeletonBlock className="h-5 w-1/4 rounded" />
        <SkeletonBlock className="h-3.5 w-1/3 rounded" />
      </div>
      <div className="space-y-4.5 pt-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex justify-between items-center py-2 border-b border-slate-50">
            <div className="flex items-center space-x-3 w-1/4">
              <SkeletonBlock className="w-9 h-9 rounded-full shrink-0" />
              <div className="space-y-1.5 w-full">
                <SkeletonBlock className="h-3 w-2/3 rounded" />
                <SkeletonBlock className="h-2.5 w-1/3 rounded" />
              </div>
            </div>
            <SkeletonBlock className="h-5 w-16 rounded-full" />
            <SkeletonBlock className="h-4 w-20 rounded" />
            <SkeletonBlock className="h-4 w-14 rounded" />
            <SkeletonBlock className="h-4 w-24 rounded" />
            <SkeletonBlock className="h-6 w-12 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  </div>
);
