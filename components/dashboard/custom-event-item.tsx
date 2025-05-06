import { Users } from "lucide-react" // Import Users icon

interface Stats {
  attendees: number
  responses: number
}

interface CustomEventItemProps {
  isLoading: boolean
  statsError: boolean
  stats: Stats | null
}

const CustomEventItem = ({ isLoading, statsError, stats }: CustomEventItemProps) => {
  return (
    <>
      <div className="text-right hidden sm:block">
        <p className="text-white/70 text-xs">Attendees</p>
        <p className="text-white font-medium flex items-center gap-1">
          <Users size={12} className="text-[#9855FF]" />
          {isLoading ? (
            <span className="opacity-50">...</span>
          ) : statsError ? (
            <span className="opacity-50">--</span>
          ) : (
            stats?.attendees
          )}
        </p>
      </div>

      <div className="text-right hidden sm:block">
        <p className="text-white/70 text-xs">Responses</p>
        <p className="text-white font-medium">
          {isLoading ? (
            <span className="opacity-50">...</span>
          ) : statsError ? (
            <span className="opacity-50">--</span>
          ) : (
            stats?.responses
          )}
        </p>
      </div>
    </>
  )
}

export default CustomEventItem
