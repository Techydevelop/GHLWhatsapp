'use client'

import { useState, useEffect } from 'react'
import { 
  PlusIcon, 
  QrCodeIcon, 
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import ConnectSubaccountForm from '@/components/ConnectSubaccountForm'
import AuthWrapper from '@/components/AuthWrapper'

const API_URL = process.env.NEXT_PUBLIC_API_URL

interface Subaccount {
  id: string
  location_id: string
  name: string
  created_at: string
  session?: {
    id: string
    status: string
    phone_number?: string
    created_at: string
    updated_at: string
  }
}

function DashboardContent() {
  const [subaccounts, setSubaccounts] = useState<Subaccount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showConnectForm, setShowConnectForm] = useState(false)
  const [user, setUser] = useState<any>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    getUser()
    loadSubaccounts()
  }, [])

  const getUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }

  const loadSubaccounts = async () => {
    try {
      setIsLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        toast.error('Please log in to continue')
        return
      }
      const token = session.access_token
      
      const response = await fetch(`${API_URL}/admin/subaccounts`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setSubaccounts(data)
      } else {
        toast.error('Failed to load subaccounts')
      }
    } catch (error) {
      console.error('Error loading subaccounts:', error)
      toast.error('Failed to load subaccounts')
    } finally {
      setIsLoading(false)
    }
  }

  const handleConnectSubaccount = async (locationId: string, name?: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        toast.error('Please log in to continue')
        return
      }
      const token = session.access_token
      
      const response = await fetch(`${API_URL}/admin/subaccounts/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ locationId, name })
      })
      
      if (response.ok) {
        const newSubaccount = await response.json()
        setSubaccounts(prev => [newSubaccount, ...prev])
        setShowConnectForm(false)
        toast.success('Subaccount connected successfully!')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to connect subaccount')
      }
    } catch (error) {
      console.error('Error connecting subaccount:', error)
      toast.error('Failed to connect subaccount')
    }
  }

  const handleCreateSession = async (locationId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        toast.error('Please log in to continue')
        return
      }
      const token = session.access_token
      
      const response = await fetch(`${API_URL}/location/${locationId}/session`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        toast.success('WhatsApp session created! Check the QR page to connect.')
        loadSubaccounts() // Refresh to get updated session status
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to create session')
      }
    } catch (error) {
      console.error('Error creating session:', error)
      toast.error('Failed to create session')
    }
  }

  const handleOpenQR = (locationId: string) => {
    const qrUrl = `${API_URL}/provider?locationId=${locationId}`
    window.open(qrUrl, '_blank', 'width=600,height=700')
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      toast.success('Logged out successfully')
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Failed to log out')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />
      case 'qr':
        return <QrCodeIcon className="w-5 h-5 text-yellow-500" />
      case 'initializing':
        return <ClockIcon className="w-5 h-5 text-blue-500" />
      case 'disconnected':
      case 'auth_failure':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
      default:
        return <ExclamationTriangleIcon className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ready':
        return 'Connected'
      case 'qr':
        return 'Scan QR Code'
      case 'initializing':
        return 'Initializing'
      case 'disconnected':
        return 'Disconnected'
      case 'auth_failure':
        return 'Auth Failed'
      default:
        return 'No Session'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <ChatBubbleLeftRightIcon className="w-8 h-8 text-primary-600" />
              <div className="ml-3">
                <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-sm text-gray-500">Manage your WhatsApp integrations</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Welcome, {user?.email}
              </div>
              <a href="/" className="btn-outline">
                Back to Home
              </a>
              <button
                onClick={() => setShowConnectForm(true)}
                className="btn-primary"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Connect Location
              </button>
              <button
                onClick={handleLogout}
                className="btn-outline text-red-600 border-red-300 hover:bg-red-50"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {subaccounts.length === 0 ? (
          /* Empty State */
          <div className="text-center py-12">
            <ChatBubbleLeftRightIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No locations connected</h3>
            <p className="text-gray-600 mb-6">
              Connect your first LeadConnector location to start using WhatsApp integration
            </p>
            <button
              onClick={() => setShowConnectForm(true)}
              className="btn-primary"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Connect Your First Location
            </button>
          </div>
        ) : (
          /* Subaccounts Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subaccounts.map((subaccount) => (
              <div key={subaccount.id} className="card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {subaccount.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      ID: {subaccount.location_id}
                    </p>
                  </div>
                  {subaccount.session && (
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(subaccount.session.status)}
                      <span className="text-sm font-medium text-gray-700">
                        {getStatusText(subaccount.session.status)}
                      </span>
                    </div>
                  )}
                </div>

                {subaccount.session && (
                  <div className="mb-4">
                    {subaccount.session.phone_number && (
                      <p className="text-sm text-gray-600 mb-2">
                        📱 {subaccount.session.phone_number}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      Last updated: {new Date(subaccount.session.updated_at).toLocaleString()}
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  {subaccount.session ? (
                    <>
                      <button
                        onClick={() => handleOpenQR(subaccount.location_id)}
                        className="btn-outline w-full text-sm"
                      >
                        <QrCodeIcon className="w-4 h-4 mr-2" />
                        Open QR Page
                      </button>
                      {subaccount.session.status !== 'ready' && (
                        <button
                          onClick={() => handleCreateSession(subaccount.location_id)}
                          className="btn-primary w-full text-sm"
                        >
                          Rescan QR Code
                        </button>
                      )}
                      {subaccount.session.status === 'ready' && (
                        <div className="text-center text-green-600 text-sm font-medium">
                          ✅ WhatsApp Connected
                        </div>
                      )}
                    </>
                  ) : (
                    <button
                      onClick={() => handleCreateSession(subaccount.location_id)}
                      className="btn-primary w-full text-sm"
                    >
                      Create WhatsApp Session
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Connect Subaccount Modal */}
        {showConnectForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Connect New Location
                </h3>
                <ConnectSubaccountForm
                  onSubmit={handleConnectSubaccount}
                  onCancel={() => setShowConnectForm(false)}
                />
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <AuthWrapper>
      <DashboardContent />
    </AuthWrapper>
  )
}

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'
export const runtime = 'nodejs'