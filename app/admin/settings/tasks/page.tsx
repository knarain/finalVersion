'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { Plus, Trash2 } from 'lucide-react'

interface Task {
  id: number
  date: string
  task: string
  status: string
  status_updated_by: string | null
}

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [newTask, setNewTask] = useState({ date: '', task: '' })
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/tasks`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setTasks(res.data.results?.data || [])
    } catch (err) {
      console.error('Failed to fetch tasks:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      const token = localStorage.getItem('adminToken')
      const username = localStorage.getItem('adminUsername') || 'System'
      
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/tasks/${id}`,
        { status: newStatus, status_updated_by: username },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      fetchTasks()
    } catch (err) {
      console.error('Failed to update task:', err)
    }
  }

  const handleCreateTask = async () => {
    if (!newTask.date || !newTask.task) return

    try {
      const token = localStorage.getItem('adminToken')
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/tasks`,
        { ...newTask, status: 'Pending' },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      setNewTask({ date: '', task: '' })
      setShowForm(false)
      fetchTasks()
    } catch (err) {
      console.error('Failed to create task:', err)
    }
  }

  const handleDeleteTask = async (id: number) => {
    try {
      const token = localStorage.getItem('adminToken')
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/tasks/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      fetchTasks()
    } catch (err) {
      console.error('Failed to delete task:', err)
    }
  }

  if (loading) return <div className="p-6 text-gray-400">Loading tasks...</div>

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Tasks</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} /> Create Task
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-800 p-6 rounded-lg mb-6 border border-gray-700">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <input
              type="date"
              value={newTask.date}
              onChange={e => setNewTask({ ...newTask, date: e.target.value })}
              className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
            />
            <input
              type="text"
              placeholder="Task description"
              value={newTask.task}
              onChange={e => setNewTask({ ...newTask, task: e.target.value })}
              className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCreateTask}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Save
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-gray-800 rounded-lg shadow-lg overflow-x-auto border border-gray-700">
        <table className="w-full">
          <thead className="bg-gray-700 border-b border-gray-600">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Date</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Task</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Updated By</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Action</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task, idx) => (
              <tr key={task.id} className={`border-b border-gray-700 ${idx % 2 === 0 ? 'bg-gray-800' : 'bg-gray-750'}`}>
                <td className="px-6 py-4 text-gray-300">{task.date}</td>
                <td className="px-6 py-4 text-gray-300">{task.task}</td>
                <td className="px-6 py-4">
                  <select
                    value={task.status}
                    onChange={e => handleStatusChange(task.id, e.target.value)}
                    className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-white text-sm"
                  >
                    <option>Pending</option>
                    <option>In Progress</option>
                    <option>Completed</option>
                    <option>Cancelled</option>
                    <option>To Do</option>
                    <option>Queue</option>
                    <option>Up Coming</option>
                  </select>
                </td>
                <td className="px-6 py-4 text-gray-300">{task.status_updated_by || '-'}</td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="text-red-400 hover:text-red-600"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {tasks.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          No tasks found. Create one to get started.
        </div>
      )}
    </div>
  )
}
