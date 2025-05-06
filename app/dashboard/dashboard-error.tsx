import Link from "next/link"

export default function DashboardErrorFallback() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-8 max-w-md">
        <h2 className="text-2xl font-bold mb-4">Dashboard Unavailable</h2>
        <p className="text-white/70 mb-6">
          We're having trouble loading your dashboard. This could be due to a network issue or a temporary server
          problem.
        </p>
        <div className="space-y-4">
          <div className="bg-white/5 p-4 rounded-lg">
            <h3 className="text-white font-medium mb-2">Troubleshooting Steps:</h3>
            <ul className="text-white/70 space-y-2 list-disc pl-5">
              <li>Check your internet connection</li>
              <li>Clear your browser cache</li>
              <li>Try signing out and back in</li>
              <li>If the problem persists, please contact support</li>
            </ul>
          </div>
          <div className="flex gap-4">
            <Link href="/dashboard" className="bg-[#9855FF] text-white font-medium py-2 px-4 rounded-lg">
              Try again
            </Link>
            <Link href="/" className="bg-white/10 text-white font-medium py-2 px-4 rounded-lg">
              Go home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
