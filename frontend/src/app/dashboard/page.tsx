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

interface Location {
  id: string;
  name: string;
  address: string;
  phone: string;
  timezone: string;
}

export default function DashboardPage() {
  const [subaccounts, setSubaccounts] = useState<Subaccount[]>([])
  const [showConnectForm, setShowConnectForm] = useState(false)
  const [showLocationSelector, setShowLocationSelector] = useState(false)
  const [locations, setLocations] = useState<Location[]>([])
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [newName, setNewName] = useState('')
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingLocations, setIsLoadingLocations] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkUser()
    loadSubaccounts()
  }, [])

  const checkUser = async () => {
    try {
      if (!supabase) {
        toast.error('Supabase is not configured. Please set up environment variables.')
        router.push('/login')
        return
      }

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

  const loadLocations = async () => {
    setIsLoadingLocations(true)
    try {
      // Get user token for API calls
      if (!supabase) {
        toast.error('Supabase is not configured')
        return
      }

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        toast.error('Please login first')
        return
      }

      // Call backend API to get locations from LeadConnector
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/locations`, {
        headers: { 
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch locations')
      }

      const data = await response.json()
      setLocations(data.locations || [])
      setShowLocationSelector(true)
    } catch (error) {
      console.error('Error loading locations:', error)
      toast.error('Failed to load locations from LeadConnector')
      
      // Fallback to mock data for development
      const mockLocations: Location[] = [
        {
          id: 'LOC001',
          name: 'Main Office',
          address: '123 Business St, City, State',
          phone: '+1234567890',
          timezone: 'America/New_York'
        },
        {
          id: 'LOC002', 
          name: 'Branch Office',
          address: '456 Commerce Ave, City, State',
          phone: '+1987654321',
          timezone: 'America/Los_Angeles'
        },
        {
          id: 'LOC003',
          name: 'Remote Office',
          address: '789 Remote Rd, City, State', 
          phone: '+1555123456',
          timezone: 'America/Chicago'
        }
      ]
      
      setLocations(mockLocations)
      setShowLocationSelector(true)
    } finally {
      setIsLoadingLocations(false)
    }
  }

  const handleConnectSubaccount = async () => {
    if (!selectedLocation) {
      toast.error('Please select a location')
      return
    }

    try {
      const newSubaccount: Subaccount = {
        id: Date.now().toString(),
        location_id: selectedLocation.id,
        name: newName.trim() || selectedLocation.name,
        status: 'qr',
        phone_number: selectedLocation.phone,
        created_at: new Date().toISOString()
      }

      setSubaccounts(prev => [newSubaccount, ...prev])
      setShowLocationSelector(false)
      setSelectedLocation(null)
      setNewName('')
      toast.success(`Subaccount connected successfully for ${selectedLocation.name}!`)
    } catch (error) {
      toast.error('Failed to connect subaccount')
    }
  }

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location)
    setNewName(location.name) // Pre-fill with location name
  }

  const handleLogout = async () => {
    try {
      if (!supabase) {
        toast.error('Supabase is not configured')
        return
      }
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
            {/* Location Selector Modal */}
            {showLocationSelector && (
              <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
                  <div className="mt-3">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Select Location from LeadConnector</h3>
                    
                    {locations.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-500">No locations found. Please check your LeadConnector connection.</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {locations.map((location) => (
                          <div
                            key={location.id}
                            onClick={() => handleLocationSelect(location)}
                            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                              selectedLocation?.id === location.id
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium text-gray-900">{location.name}</h4>
                                <p className="text-sm text-gray-600 mt-1">{location.address}</p>
                                <p className="text-sm text-gray-500 mt-1">📞 {location.phone}</p>
                                <p className="text-xs text-gray-400 mt-1">ID: {location.id}</p>
                              </div>
                              {selectedLocation?.id === location.id && (
                                <div className="text-blue-600">
                                  <CheckCircleIcon className="w-5 h-5" />
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {selectedLocation && (
                      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">Selected Location:</h4>
                        <p className="text-sm text-gray-600">{selectedLocation.name}</p>
                        <p className="text-xs text-gray-500">ID: {selectedLocation.id}</p>
                        
                        <div className="mt-4">
                          <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
                            Display Name (Optional)
                          </label>
                          <input
                            type="text"
                            id="displayName"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="Custom name for this location"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex space-x-3 pt-6">
                      <button
                        type="button"
                        onClick={() => {
                          setShowLocationSelector(false)
                          setSelectedLocation(null)
                          setNewName('')
                        }}
                        className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-md text-sm font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleConnectSubaccount}
                        disabled={!selectedLocation}
                        className="flex-1 bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Connect Location
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Subaccounts</h2>
              <button
                onClick={loadLocations}
                disabled={isLoadingLocations}
                className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium flex items-center disabled:opacity-50"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                {isLoadingLocations ? 'Loading...' : 'Connect Location'}
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
                  onClick={loadLocations}
                  disabled={isLoadingLocations}
                  className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium flex items-center mx-auto disabled:opacity-50"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  {isLoadingLocations ? 'Loading...' : 'Connect Your First Location'}
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
