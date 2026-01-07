import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export interface AlbumCredential {
  id: number
  album_id: number
  email: string
  is_active: number | boolean
}

export interface AddCredentialPayload {
  album_id: number
  email: string
  password: string
}

const getHeaders = () => {
  const token = localStorage.getItem('adminToken')
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
}

export const albumCredentialsService = {
  // List credentials for a specific album
  async listCredentials(albumId: number): Promise<AlbumCredential[]> {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/admin/album-credentials/${albumId}`,
        {
          headers: getHeaders(),
          withCredentials: true,
        }
      )
      // Backend returns: { results: [...], message: '...', error_code: 200 }
      const data = res.data.results || []
      return Array.isArray(data) ? data : []
    } catch (error: any) {
      console.error('Error fetching credentials:', error)
      throw error.response?.data?.message || 'Failed to fetch credentials'
    }
  },

  // Add a new credential
  async addCredential(payload: AddCredentialPayload): Promise<any> {
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/admin/album-credentials`,
        payload,
        {
          headers: getHeaders(),
          withCredentials: true,
        }
      )
      return res.data
    } catch (error: any) {
      console.error('Error adding credential:', error)
      throw error.response?.data?.message || 'Failed to add credential'
    }
  },

  // Delete a credential
  async deleteCredential(credentialId: number): Promise<any> {
    try {
      const res = await axios.delete(
        `${API_BASE_URL}/api/admin/album-credentials/${credentialId}`,
        {
          headers: getHeaders(),
          withCredentials: true,
        }
      )
      return res.data
    } catch (error: any) {
      console.error('Error deleting credential:', error)
      throw error.response?.data?.message || 'Failed to delete credential'
    }
  },

  // Toggle credential status (activate/deactivate)
  async toggleCredentialStatus(credentialId: number, isActive: boolean): Promise<any> {
    try {
      const res = await axios.patch(
        `${API_BASE_URL}/api/admin/album-credentials/${credentialId}/status`,
        { is_active: isActive ? 1 : 0 },
        {
          headers: getHeaders(),
          withCredentials: true,
        }
      )
      return res.data
    } catch (error: any) {
      console.error('Error toggling credential status:', error)
      throw error.response?.data?.message || 'Failed to toggle credential status'
    }
  },
}
