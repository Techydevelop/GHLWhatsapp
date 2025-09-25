'use client'

import { useState, useEffect } from 'react'

export const dynamic = 'force-dynamic'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { 
  PlusIcon, 
  QrCodeIcon, 
  ChatBubbleLeftRightIcon, 
  ExclamationTriangleIcon, 
  CheckCircleIcon, 
  ClockIcon,
  UserIcon,
  BuildingOfficeIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

interface Subaccount {
  id: string;
  location_id: string;
  name: string;
  status: string;
  phone_number: string | null;
  created_at: string;
}

export default function DashboardPage() {
  const [subaccounts, setSubaccounts] = useState<Subaccount[]>([])
  const [showConnectForm, setShowConnectForm] = useState(false)
  const [newLocationId, setNewLocationId] = useState('')
  const [newName, setNewName] = useState('')
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkUser()
    loadSubaccounts()
  }, [])

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)
    } catch (error) {
      console.error('Error checking user:', error)
      router.push('/login')
    } finally {
      setIsLoading(false)
    }
  }

  const loadSubaccounts = async () => {
    try {
      // Mock data for now - replace with actual API call
      const mockSubaccounts: Subaccount[] = [
        {
          id: '1',
          location_id: 'LOC123',
          name: 'Main Office',
          status: 'ready',
          phone_number: '+1234567890',
          created_at: '2024-01-15'
        }
      ]
      setSubaccounts(mockSubaccounts)
    } catch (error) {
      console.error('Error loading subaccounts:', error)
    }
  }

  const handleConnectSubaccount = async () => {
    if (!newLocationId.trim()) {
      toast.error('Please enter a location ID')
      return
    }

    try {
      const newSubaccount: Subaccount = {
        id: Date.now().toString(),
        location_id: newLocationId.trim(),
        name: newName.trim() || `Location ${newLocationId}`,
        status: 'qr',
        phone_number: null,
        created_at: new Date().toISOString()
      }

      setSubaccounts(prev => [newSubaccount, ...prev])
      setShowConnectForm(false)
      setNewLocationId('')
      setNewName('')
      toast.success('Subaccount connected successfully!')
    } catch (error) {
      toast.error('Failed to connect subaccount')
    }
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      toast.success('Logged out successfully!')
      router.push('/')
    } catch (error) {
      toast.error('Logout failed')
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
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
              <ChatBubbleLeftRightIcon className="w-8 h-8 text-blue-600" />
              <div className="ml-3">
                <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-sm text-gray-500">Manage your WhatsApp integrations</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user?.email}</span>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium flex items-center"
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 bg-white rounded-lg shadow-sm p-6 mr-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Navigation</h2>
            <nav className="space-y-2">
              <a href="#" className="flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md">
                <BuildingOfficeIcon className="w-4 h-4 mr-3" />
                Subaccounts
              </a>
              <a href="#" className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md">
                <UserIcon className="w-4 h-4 mr-3" />
                Users
              </a>
            </nav>

            <div className="mt-8">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Stats</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Locations:</span>
                  <span className="font-medium">{subaccounts.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Connected:</span>
                  <span className="font-medium text-green-600">
                    {subaccounts.filter(s => s.status === 'ready').length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Pending:</span>
                  <span className="font-medium text-yellow-600">
                    {subaccounts.filter(s => s.status === 'qr').length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {showConnectForm && (
              <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                  <div className="mt-3">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Connect New Location</h3>
                    <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleConnectSubaccount(); }}>
                      <div>
                        <label htmlFor="locationId" className="block text-sm font-medium text-gray-700">
                          Location ID *
                        </label>
                        <input
                          type="text"
                          id="locationId"
                          value={newLocationId}
                          onChange={(e) => setNewLocationId(e.target.value)}
                          placeholder="Enter your GHL location ID"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                          Display Name (Optional)
                        </label>
                        <input
                          type="text"
                          id="name"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          placeholder="e.g., Main Office"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                      <div className="flex space-x-3 pt-4">
                        <button
                          type="button"
                          onClick={() => setShowConnectForm(false)}
                          className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-md text-sm font-medium"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="flex-1 bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium"
                        >
                          Connect Location
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Subaccounts</h2>
              <button
                onClick={() => setShowConnectForm(true)}
                className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium flex items-center"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Connect Location
              </button>
            </div>

            {subaccounts.length === 0 ? (
              <div className="text-center py-12">
                <ChatBubbleLeftRightIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No locations connected</h3>
                <p className="text-gray-600 mb-6">
                  Connect your first LeadConnector location to start using WhatsApp integration
                </p>
                <button
                  onClick={() => setShowConnectForm(true)}
                  className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium flex items-center mx-auto"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Connect Your First Location
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subaccounts.map((subaccount) => (
                  <div key={subaccount.id} className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {subaccount.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          ID: {subaccount.location_id}
                        </p>
                      </div>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(subaccount.status)}
                        <span className="text-sm font-medium text-gray-700">
                          {getStatusText(subaccount.status)}
                        </span>
                      </div>
                    </div>

                    {subaccount.phone_number && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-2">
                          📱 {subaccount.phone_number}
                        </p>
                        <p className="text-xs text-gray-500">
                          Last updated: {new Date(subaccount.created_at).toLocaleString()}
                        </p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <button
                        onClick={() => toast(`Opening QR page for location: ${subaccount.location_id}`)}
                        className="w-full text-gray-600 hover:text-gray-900 border border-gray-300 hover:border-gray-400 px-3 py-2 rounded-md text-sm font-medium flex items-center justify-center"
                      >
                        <QrCodeIcon className="w-4 h-4 mr-2" />
                        Open QR Page
                      </button>
                      {subaccount.status !== 'ready' && (
                        <button
                          onClick={() => toast.success('WhatsApp session created! Check the QR page to connect.')}
                          className="w-full bg-blue-600 text-white hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium"
                        >
                          Rescan QR Code
                        </button>
                      )}
                      {subaccount.status === 'ready' && (
                        <div className="text-center text-green-600 text-sm font-medium">
                          ✅ WhatsApp Connected
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
