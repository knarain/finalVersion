'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { albumCredentialsService, AlbumCredential } from '@/lib/album-credentials-service'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm } from 'react-hook-form'

interface Props {
  albumId: number
}

interface FormData {
  email: string
  password: string
}

const schema = yup.object().shape({
  email: yup.string().email('Enter a valid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
})

export function AlbumCredentialsManager({ albumId }: Props) {
  const router = useRouter()
  const [credentials, setCredentials] = useState<AlbumCredential[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  })

  const getToken = () => {
    return document.cookie.split('; ').find(row => row.startsWith('adminToken='))?.split('=')[1] || localStorage.getItem('adminToken')
  }

  useEffect(() => {
    fetchCredentials()
  }, [albumId])

  const fetchCredentials = async () => {
    try {
      setLoading(true)
      setError('')
      const token = getToken()
      const data = await albumCredentialsService.listCredentials(albumId)
      setCredentials(Array.isArray(data) ? data : [])
    } catch (err: any) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true)
      setError('')
      setSuccess('')
      const token = getToken()
      await albumCredentialsService.addCredential({
        album_id: albumId,
        email: data.email,
        password: data.password,
      })
      setSuccess('Credential added successfully!')
      reset()
      setShowForm(false)
      await fetchCredentials()
    } catch (err: any) {
      setError(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteCredential = async (credentialId: number) => {
    try {
      setError('')
      setSuccess('')
      const token = getToken()
      await albumCredentialsService.deleteCredential(credentialId)
      setSuccess('Credential deleted successfully!')
      setDeleteConfirmId(null)
      await fetchCredentials()
    } catch (err: any) {
      setError(err)
    }
  }

  const handleToggleStatus = async (credentialId: number, currentStatus: boolean) => {
    try {
      setError('')
      setSuccess('')
      const newStatus = !currentStatus
      
      setCredentials(credentials.map(c => 
        c.id === credentialId 
          ? { ...c, is_active: newStatus ? 1 : 0 }
          : c
      ))
      
      const token = getToken()
      await albumCredentialsService.toggleCredentialStatus(credentialId, newStatus)
      setSuccess(`Credential ${newStatus ? 'activated' : 'deactivated'} successfully!`)
    } catch (err: any) {
      setCredentials(credentials.map(c => 
        c.id === credentialId 
          ? { ...c, is_active: currentStatus ? 1 : 0 }
          : c
      ))
      setError(err)
    }
  }

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Album Credentials</h1>
        <div className="flex gap-3">
          <button
            onClick={() => router.back()}
            className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            ← Back
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-3 rounded-lg font-bold transition-colors shadow-lg hover:shadow-yellow-500/30"
          >
            + Add Credential
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/40 border-l-4 border-red-500 text-red-200 p-4 rounded-lg mb-6 flex items-start gap-3 shadow-lg animate-in">
          <span className="text-xl">⚠️</span>
          <p>{error}</p>
        </div>
      )}
      {success && (
        <div className="bg-green-900/40 border-l-4 border-green-500 text-green-200 p-4 rounded-lg mb-6 flex items-start gap-3 shadow-lg animate-in">
          <span className="text-xl">✓</span>
          <p>{success}</p>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border-2 border-yellow-500/30 shadow-2xl shadow-yellow-500/10 max-w-md w-full animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-yellow-400">Add New Credential</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-white transition-colors text-2xl leading-none"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-200">Email Address</label>
                <input
                  type="email"
                  placeholder="user@example.com"
                  className="w-full bg-gray-700/50 border-2 border-gray-600 hover:border-yellow-500/50 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 focus:bg-gray-700 transition-all duration-200"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
                    <span>⚠</span> {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-200">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-gray-700/50 border-2 border-gray-600 hover:border-yellow-500/50 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 focus:bg-gray-700 transition-all duration-200"
                  {...register('password')}
                />
                {errors.password && (
                  <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
                    <span>⚠</span> {errors.password.message}
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 disabled:from-gray-600 disabled:to-gray-700 text-black px-6 py-3 rounded-lg font-bold transition-all duration-200 shadow-lg hover:shadow-yellow-500/30 disabled:shadow-none"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                      Adding...
                    </span>
                  ) : (
                    '✓ Add Credential'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-bold transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading && <p className="text-yellow-500">Loading credentials...</p>}

      {!loading && credentials.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg mb-4">No credentials found for this album</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-2 rounded-lg font-semibold transition-colors inline-block"
          >
            Add First Credential
          </button>
        </div>
      )}

      {!loading && credentials.length > 0 && (
        <div className="space-y-4">
          <div className="text-gray-400 text-sm">Total credentials: {credentials.length}</div>
          <div className="grid gap-4">
            {credentials.map((credential) => (
              <div
                key={credential.id}
                className="bg-gray-800 rounded-lg border border-gray-700 p-6 hover:border-yellow-500/50 transition-colors"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-yellow-400 break-all">{credential.email}</h3>
                    <p className="text-gray-400 text-sm mt-1">ID: {credential.id}</p>
                  </div>
                  <div className="flex gap-2 flex-wrap justify-end">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        credential.is_active
                          ? 'bg-green-900/30 text-green-300'
                          : 'bg-gray-700/50 text-gray-400'
                      }`}
                    >
                      {credential.is_active ? '✓ Active' : '✕ Inactive'}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => handleToggleStatus(credential.id, !!credential.is_active)}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                      credential.is_active
                        ? 'bg-orange-600 hover:bg-orange-700 text-white'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {credential.is_active ? 'Deactivate' : 'Activate'}
                  </button>

                  <button
                    onClick={() => setDeleteConfirmId(credential.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {deleteConfirmId !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-sm border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">Delete Credential</h2>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete this credential? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteCredential(deleteConfirmId)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
