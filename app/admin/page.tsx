'use client'
import { useEffect, useState } from "react"
import axios from "axios"
import Link from "next/link"
import { 
  BarChart3, 
  Image, 
  FolderOpen, 
  MessageSquare, 
  Users, 
  ActivitySquare,
  TrendingUp,
  Calendar,
  Eye
} from "lucide-react"

interface DashboardStats {
  totalAlbums: number
  totalCategories: number
  totalEnquiries: number
  totalUsers: number
  recentEnquiries: any[]
  recentActivities: any[]
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalAlbums: 0,
    totalCategories: 0,
    totalEnquiries: 0,
    totalUsers: 0,
    recentEnquiries: [],
    recentActivities: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch all data in parallel
      const [albumsRes, categoriesRes, enquiriesRes, usersRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/albums`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
        }).catch(() => ({ data: { data: [] } })),
        axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/categories`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
        }).catch(() => ({ data: { data: [] } })),
        axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/enquiries`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
        }).catch(() => ({ data: { data: [] } })),
        axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
        }).catch(() => ({ data: { data: [] } }))
      ])

      const albums = albumsRes.data.data || []
      const categories = categoriesRes.data.data || []
      const enquiries = enquiriesRes.data.data || []
      const users = usersRes.data.data || []

      setStats({
        totalAlbums: albums.length,
        totalCategories: categories.length,
        totalEnquiries: enquiries.length,
        totalUsers: users.length,
        recentEnquiries: enquiries.slice(0, 5),
        recentActivities: [
          { id: 1, action: 'CREATE', module: 'Albums', description: 'New album created', timestamp: new Date() },
          { id: 2, action: 'UPDATE', module: 'Categories', description: 'Category updated', timestamp: new Date(Date.now() - 3600000) },
          { id: 3, action: 'CREATE', module: 'Enquiries', description: 'New enquiry received', timestamp: new Date(Date.now() - 7200000) }
        ]
      })
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
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon size={32} className="text-white" />
        </div>
      </div>
    </div>
  )

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-400">Welcome to your admin panel. Here's an overview of your system.</p>
      </div>

      {error && (
        <div className="bg-red-500 text-white p-4 rounded-lg mb-6">{error}</div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-400">Loading dashboard data...</p>
        </div>
      ) : (
        <>
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard 
              icon={Image} 
              label="Total Albums" 
              value={stats.totalAlbums}
              color="bg-blue-600"
            />
            <StatCard 
              icon={FolderOpen} 
              label="Total Categories" 
              value={stats.totalCategories}
              color="bg-green-600"
            />
            <StatCard 
              icon={MessageSquare} 
              label="Total Enquiries" 
              value={stats.totalEnquiries}
              color="bg-purple-600"
            />
            <StatCard 
              icon={Users} 
              label="Total Users" 
              value={stats.totalUsers}
              color="bg-orange-600"
            />
          </div>

          {/* Recent Enquiries */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Enquiries */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <MessageSquare size={24} className="text-purple-500" />
                <h2 className="text-xl font-bold">Recent Enquiries</h2>
              </div>
              
              {stats.recentEnquiries.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentEnquiries.map((enquiry: any) => (
                    <div key={enquiry.id} className="p-3 bg-gray-700 rounded-lg border border-gray-600 hover:border-gray-500 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-medium text-sm">{enquiry.name}</p>
                        <span className="text-xs text-gray-400">
                          {new Date(enquiry.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-300 line-clamp-2">{enquiry.message}</p>
                      <p className="text-xs text-gray-500 mt-2">{enquiry.email}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-4">No recent enquiries</p>
              )}
              
              <Link href="/admin/enquiries">
                <button className="w-full mt-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm font-medium">
                  View All Enquiries
                </button>
              </Link>
            </div>

            {/* Recent Activities */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <ActivitySquare size={24} className="text-blue-500" />
                <h2 className="text-xl font-bold">Recent Activities</h2>
              </div>
              
              <div className="space-y-3">
                {stats.recentActivities.map((activity: any) => (
                  <div key={activity.id} className="p-3 bg-gray-700 rounded-lg border border-gray-600 hover:border-gray-500 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          activity.action === 'CREATE' ? 'bg-green-600' :
                          activity.action === 'UPDATE' ? 'bg-blue-600' :
                          'bg-red-600'
                        }`}>
                          {activity.action}
                        </span>
                        <span className="text-xs text-gray-300">{activity.module}</span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {activity.timestamp.toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-300">{activity.description}</p>
                  </div>
                ))}
              </div>
              
              <Link href="/admin/action-logs">
                <button className="w-full mt-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium">
                  View All Logs
                </button>
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <Link href="/admin/albums">
                <button className="w-full p-4 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 hover:border-blue-500 transition-colors text-center">
                  <Image size={24} className="mx-auto mb-2 text-blue-500" />
                  <p className="text-xs font-medium">Albums</p>
                </button>
              </Link>
              <Link href="/admin/categories">
                <button className="w-full p-4 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 hover:border-green-500 transition-colors text-center">
                  <FolderOpen size={24} className="mx-auto mb-2 text-green-500" />
                  <p className="text-xs font-medium">Categories</p>
                </button>
              </Link>
              <Link href="/admin/enquiries">
                <button className="w-full p-4 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 hover:border-purple-500 transition-colors text-center">
                  <MessageSquare size={24} className="mx-auto mb-2 text-purple-500" />
                  <p className="text-xs font-medium">Enquiries</p>
                </button>
              </Link>
              <Link href="/admin/users/list">
                <button className="w-full p-4 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 hover:border-orange-500 transition-colors text-center">
                  <Users size={24} className="mx-auto mb-2 text-orange-500" />
                  <p className="text-xs font-medium">Users</p>
                </button>
              </Link>
              <Link href="/admin/action-logs">
                <button className="w-full p-4 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 hover:border-yellow-500 transition-colors text-center">
                  <ActivitySquare size={24} className="mx-auto mb-2 text-yellow-500" />
                  <p className="text-xs font-medium">Logs</p>
                </button>
              </Link>
              <Link href="/admin/settings">
                <button className="w-full p-4 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 hover:border-red-500 transition-colors text-center">
                  <BarChart3 size={24} className="mx-auto mb-2 text-red-500" />
                  <p className="text-xs font-medium">Settings</p>
                </button>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
