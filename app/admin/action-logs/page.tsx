'use client'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { ActivitySquare } from 'lucide-react'

interface ActionLog {
  id: number
  userId: number
  username: string
  action: string
  module: string
  description: string
  timestamp: string
}

export default function ActionLogsPage() {
  const [logs, setLogs] = useState<ActionLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    try {
      // Mock data for demonstration
      setLogs([
        {
          id: 1,
          userId: 1,
          username: 'Admin',
          action: 'CREATE',
          module: 'Albums',
          description: 'Created new album "Wedding 2024"',
          timestamp: new Date().toISOString()
        },
        {
          id: 2,
          userId: 1,
          username: 'Admin',
          action: 'UPDATE',
          module: 'Categories',
          description: 'Updated category "Events"',
          timestamp: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: 3,
          userId: 2,
          username: 'Editor',
          action: 'DELETE',
          module: 'Albums',
          description: 'Deleted album "Old Photos"',
          timestamp: new Date(Date.now() - 7200000).toISOString()
        }
      ])
    } catch (err: any) {
      setError('Failed to fetch logs')
    } finally {
      setLoading(false)
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE':
        return 'bg-green-600'
      case 'UPDATE':
        return 'bg-blue-600'
      case 'DELETE':
        return 'bg-red-600'
      default:
        return 'bg-gray-600'
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <ActivitySquare size={32} className="text-purple-500" />
        <h1 className="text-3xl font-bold">Action Logs</h1>
      </div>

      {error && (
        <div className="bg-red-500 text-white p-3 rounded-lg mb-4">{error}</div>
      )}

      {loading ? (
        <div className="text-center py-8">Loading action logs...</div>
      ) : (
        <div className="space-y-4">
          {logs.map(log => (
            <div
              key={log.id}
              className="bg-gray-800 p-4 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`${getActionColor(log.action)} text-white px-3 py-1 rounded text-xs font-semibold`}>
                      {log.action}
                    </span>
                    <span className="text-sm font-medium">{log.module}</span>
                    <span className="text-xs text-gray-400">by {log.username}</span>
                  </div>
                  <p className="text-gray-300 text-sm">{log.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">
                    {new Date(log.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {logs.length === 0 && (
            <div className="text-center py-8 text-gray-400">No action logs found</div>
          )}
        </div>
      )}
    </div>
  )
}
