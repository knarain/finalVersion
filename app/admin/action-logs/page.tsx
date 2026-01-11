'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { format } from 'date-fns'

export default function ActionLogsPage() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchLogs()
  }, [page, search])

  const fetchLogs = async () => {
    try {
      setLoading(true)
      setError('')
      let url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/action-logs?page=${page}&limit=20`
      
      if (search) {
        url += `&search=${encodeURIComponent(search)}`
      }

      const token = localStorage.getItem('adminToken')
      if (!token) {
        setError('Authentication token not found. Please login again.')
        setLoading(false)
        return
      }

      const res = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      setLogs(res.data.results || [])
      setTotalPages(res.data.results.pagination?.total_pages || 1)
      setTotal(res.data.results.pagination?.total_items || 0)
    } catch (err) {
      console.error('Failed to fetch logs:', err)
      setError(err.response?.data?.message || 'Failed to load action logs. Please try again.')
      setLogs([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearchChange = (value) => {
    setSearch(value)
    setPage(1)
  }

  const getActionBadgeColor = (actionName) => {
    if (actionName.includes('Created')) return 'bg-green-900 text-green-200'
    if (actionName.includes('Updated')) return 'bg-blue-900 text-blue-200'
    if (actionName.includes('Deleted')) return 'bg-red-900 text-red-200'
    if (actionName.includes('Changed') || actionName.includes('Reset')) return 'bg-yellow-900 text-yellow-200'
    if (actionName.includes('Assigned') || actionName.includes('Toggled')) return 'bg-purple-900 text-purple-200'
    return 'bg-gray-700 text-gray-200'
  }

  if (loading && logs.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto mb-4"></div>
          <p className="text-lg text-gray-300">Loading action logs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Action Logs</h1>
          <p className="text-gray-400">Track all admin activities and system changes</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-900 border border-red-700 rounded-lg">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* Search */}
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-6 border border-gray-700">
          <div className="flex gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by action, admin, description..."
              className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition placeholder-gray-500"
            />
            {search && (
              <button
                onClick={() => handleSearchChange('')}
                className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition font-medium"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        {!error && (
          <div className="bg-gray-800 rounded-lg shadow-lg p-4 mb-6 border-l-4 border-amber-400">
            <p className="text-gray-300">
              Showing <span className="font-bold text-amber-400">{logs.length}</span> of <span className="font-bold text-amber-400">{total}</span> total logs
            </p>
          </div>
        )}

        {/* Table */}
        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700">
          {logs.length === 0 && !error ? (
            <div className="p-12 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-400 text-lg">No action logs found</p>
            </div>
          ) : logs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700 border-b border-gray-600">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Action</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Admin</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Date & Time</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">IP Address</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-700 transition">
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getActionBadgeColor(log.action_name)}`}>
                          {log.action_name}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300 font-medium">
                        {log.admin_username || 'System'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {format(new Date(log.action_date), 'MMM dd, yyyy HH:mm:ss')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400 font-mono text-xs bg-gray-900 px-3 py-1 rounded inline-block">
                        {log.ip_address}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400 max-w-xs truncate" title={log.description}>
                        {log.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>

        {/* Pagination */}
        {totalPages > 1 && logs.length > 0 && (
          <div className="mt-6 flex items-center justify-between bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-700">
            <div className="text-sm text-gray-400">
              Page <span className="font-semibold text-gray-200">{page}</span> of <span className="font-semibold text-gray-200">{totalPages}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition font-medium"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 bg-amber-400 text-black rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-amber-300 transition font-medium"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
