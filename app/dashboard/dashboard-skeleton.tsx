export default function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-black p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Skeleton */}
        <div className="h-16 bg-[#0A0A0A]/80 rounded-lg animate-pulse mb-6"></div>

        {/* Welcome Section Skeleton */}
        <div className="bg-[#1A0B2E] rounded-xl p-6 animate-pulse">
          <div className="h-8 bg-white/10 rounded-lg w-1/3 mb-4"></div>
          <div className="h-4 bg-white/10 rounded-lg w-2/3 mb-6"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-xl p-5 h-40"></div>
            <div className="bg-white/5 rounded-xl p-5 h-40"></div>
          </div>
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-[#0A0A0A] rounded-xl p-5 animate-pulse">
              <div className="h-4 bg-white/10 rounded-lg w-1/2 mb-4"></div>
              <div className="h-8 bg-white/10 rounded-lg w-1/3"></div>
            </div>
          ))}
        </div>

        {/* Events Section Skeleton */}
        <div className="bg-[#0A0A0A] rounded-xl p-6 animate-pulse">
          <div className="h-6 bg-white/10 rounded-lg w-1/4 mb-6"></div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white/5 rounded-lg p-4 h-20"></div>
            ))}
          </div>

          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white/5 rounded-lg p-4 h-16"></div>
            ))}
          </div>
        </div>

        {/* Activity Skeleton */}
        <div className="bg-[#0A0A0A] rounded-xl p-6 animate-pulse">
          <div className="h-6 bg-white/10 rounded-lg w-1/4 mb-6"></div>

          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white/5 rounded-lg p-4 h-20"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
