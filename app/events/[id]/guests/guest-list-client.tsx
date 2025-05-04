"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Check, X, HelpCircle, Clock, ArrowLeft, Search } from "lucide-react"
import { Button } from "@/components/ui/button"

interface GuestListClientProps {
  event: any
  guests: any[]
}

export default function GuestListClient({ event, guests }: GuestListClientProps) {
  const router = useRouter()
  const [filter, setFilter] = useState<"all" | "yes" | "no" | "maybe" | "pending">("all")
  const [searchQuery, setSearchQuery] = useState("")

  // Filter guests based on status and search query
  const filteredGuests = guests.filter((guest) => {
    const matchesFilter = filter === "all" || guest.status === filter
    const matchesSearch =
      searchQuery === "" ||
      guest.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guest.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  // Count guests by status
  const counts = {
    all: guests.length,
    yes: guests.filter((g) => g.status === "yes").length,
    no: guests.filter((g) => g.status === "no").length,
    maybe: guests.filter((g) => g.status === "maybe").length,
    pending: guests.filter((g) => g.status === "pending").length,
  }

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "yes":
        return <Check className="w-5 h-5 text-green-500" />
      case "no":
        return <X className="w-5 h-5 text-red-500" />
      case "maybe":
        return <HelpCircle className="w-5 h-5 text-yellow-500" />
      default:
        return <Clock className="w-5 h-5 text-blue-500" />
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto p-4">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            className="mb-4 text-gray-400 hover:text-white"
            onClick={() => router.push(`/events/${event.id}`)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Event
          </Button>
          <h1 className="text-2xl font-bold">Guest List: {event.title}</h1>
          <p className="text-gray-400">{guests.length} guests invited</p>
        </div>

        {/* Filters and search */}
        <div className="bg-gray-900 rounded-lg p-4 mb-6">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            {/* Status filters */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("all")}
                className="min-w-[80px]"
              >
                All ({counts.all})
              </Button>
              <Button
                variant={filter === "yes" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("yes")}
                className="min-w-[80px]"
              >
                Yes ({counts.yes})
              </Button>
              <Button
                variant={filter === "maybe" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("maybe")}
                className="min-w-[80px]"
              >
                Maybe ({counts.maybe})
              </Button>
              <Button
                variant={filter === "no" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("no")}
                className="min-w-[80px]"
              >
                No ({counts.no})
              </Button>
              <Button
                variant={filter === "pending" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("pending")}
                className="min-w-[80px]"
              >
                Pending ({counts.pending})
              </Button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search guests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded-md pl-10 pr-4 py-2 text-sm w-full sm:w-64 focus:outline-none focus:ring-1 focus:ring-[#9855FF]"
              />
            </div>
          </div>
        </div>

        {/* Guest list */}
        <div className="bg-gray-900 rounded-lg overflow-hidden">
          {filteredGuests.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-800 text-left">
                    <th className="px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Guest</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {filteredGuests.map((guest) => (
                    <tr key={guest.id} className="hover:bg-gray-800/50">
                      <td className="px-6 py-4 whitespace-nowrap">{guest.profiles?.full_name || "Guest"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-400">{guest.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(guest.status)}
                          <span className="ml-2 capitalize">
                            {guest.status === "yes"
                              ? "Attending"
                              : guest.status === "no"
                                ? "Not attending"
                                : guest.status === "maybe"
                                  ? "Maybe"
                                  : "Pending"}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-gray-400">No guests found matching your filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
