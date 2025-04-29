export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 border-4 border-[#9855FF] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-white/70">Loading your dashboard...</p>
      </div>
    </div>
  )
}
