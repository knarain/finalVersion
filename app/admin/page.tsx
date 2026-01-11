'use client'
import { useEffect, useState } from "react"
import axios from "axios"
import Link from "next/link"
import { 
  Image, 
  FolderOpen, 
  MessageSquare, 
  Users, 
  ActivitySquare,
  BarChart3,
  Lock
} from "lucide-react"

interface DashboardStats {
  total_albums: number
  total_enquiries: number
  total_users: number
  active_users: number
  total_roles: number
  locked_albums: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    total_albums: 0,
    total_enquiries: 0,
    total_users: 0,
    active_users: 0,
    total_roles: 0,
    locked_albums: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const analyticsRes = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/dashboard/analytics`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      setStats(analyticsRes.data.results)
    } catch (err) {
      console.error(err)
      setError("Failed to fetch dashboard data")
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ icon: Icon, label, value, color }: any) => (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">{label}</p>
          <p className="text-3xl font-bold mt-2 text-white">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon size={32} className="text-white" />
        </div>
      </div>
    </div>
  )

  return (
    <div className="bg-gray-900 min-h-screen p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 text-white">Analytics</h1>
        <p className="text-gray-400">System overview and key metrics</p>
      </div>

      {error && (
        <div className="bg-red-900 text-red-200 p-4 rounded-lg mb-6 border border-red-700">{error}</div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-400">Loading analytics...</p>
        </div>
      ) : (
        <>
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <StatCard 
              icon={Image} 
              label="Total Albums" 
              value={stats.total_albums}
              color="bg-blue-600"
            />
            <StatCard 
              icon={Lock} 
              label="Locked Albums" 
              value={stats.locked_albums}
              color="bg-orange-600"
            />
            <StatCard 
              icon={MessageSquare} 
              label="Total Enquiries" 
              value={stats.total_enquiries}
              color="bg-purple-600"
            />
            <StatCard 
              icon={Users} 
              label="Total Users" 
              value={stats.total_users}
              color="bg-green-600"
            />
            <StatCard 
              icon={ActivitySquare} 
              label="Active Users" 
              value={stats.active_users}
              color="bg-yellow-600"
            />
            <StatCard 
              icon={BarChart3} 
              label="Total Roles" 
              value={stats.total_roles}
              color="bg-red-600"
            />
          </div>

          {/* Quick Links */}
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4 text-white">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <Link href="/admin/albums">
                <button className="w-full p-4 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 hover:border-blue-500 transition-colors text-center">
                  <Image size={24} className="mx-auto mb-2 text-blue-500" />
                  <p className="text-xs font-medium text-gray-300">Albums</p>
                </button>
              </Link>
              <Link href="/admin/categories">
                <button className="w-full p-4 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 hover:border-green-500 transition-colors text-center">
                  <FolderOpen size={24} className="mx-auto mb-2 text-green-500" />
                  <p className="text-xs font-medium text-gray-300">Categories</p>
                </button>
              </Link>
              <Link href="/admin/enquiries">
                <button className="w-full p-4 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 hover:border-purple-500 transition-colors text-center">
                  <MessageSquare size={24} className="mx-auto mb-2 text-purple-500" />
                  <p className="text-xs font-medium text-gray-300">Enquiries</p>
                </button>
              </Link>
              <Link href="/admin/users/list">
                <button className="w-full p-4 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 hover:border-orange-500 transition-colors text-center">
                  <Users size={24} className="mx-auto mb-2 text-orange-500" />
                  <p className="text-xs font-medium text-gray-300">Users</p>
                </button>
              </Link>
              <Link href="/admin/action-logs">
                <button className="w-full p-4 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 hover:border-yellow-500 transition-colors text-center">
                  <ActivitySquare size={24} className="mx-auto mb-2 text-yellow-500" />
                  <p className="text-xs font-medium text-gray-300">Logs</p>
                </button>
              </Link>
              <Link href="/admin/settings">
                <button className="w-full p-4 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 hover:border-red-500 transition-colors text-center">
                  <BarChart3 size={24} className="mx-auto mb-2 text-red-500" />
                  <p className="text-xs font-medium text-gray-300">Settings</p>
                </button>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
