'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  PlusIcon, 
  QrCodeIcon, 
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

export default function DashboardPage() {
  const [subaccounts, setSubaccounts] = useState<Array<{
    id: string;
    location_id: string;
    name: string;
    status: string;
    phone_number: string | null;
    created_at: string;
  }>>([
    {
      id: '1',
      location_id: 'LOC123',
      name: 'Main Office',
      status: 'ready',
      phone_number: '+1234567890',
      created_at: '2024-01-15'
    }
  ])
  const [showConnectForm, setShowConnectForm] = useState(false)
  const [newLocationId, setNewLocationId] = useState('')
  const [newName, setNewName] = useState('')

  const handleConnectSubaccount = () => {
    if (!newLocationId.trim()) {
      toast.error('Please enter a location ID')
      return
    }

    const newSubaccount = {
      id: Date.now().toString(),
      location_id: newLocationId.trim(),
      name: newName.trim() || `Location ${newLocationId}`,
      status: 'qr',
      phone_number: null as string | null,
      created_at: new Date().toISOString()
    }

    setSubaccounts(prev => [newSubaccount, ...prev])
    setShowConnectForm(false)
    setNewLocationId('')
    setNewName('')
    toast.success('Subaccount connected successfully!')
  }

  const handleCreateSession = () => {
    toast.success('WhatsApp session created! Check the QR page to connect.')
  }

  const handleOpenQR = (locationId: string) => {
    toast(`Opening QR page for location: ${locationId}`)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />
      case 'qr':
        return <QrCodeIcon className="w-5 h-5 text-yellow-500" />
      case 'initializing':
        return <ClockIcon className="w-5 h-5 text-blue-500" />
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
      default:
        return 'No Session'
    }
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
              <div className="text-sm text-gray-600">
                Welcome, user@example.com
              </div>
              <Link href="/" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                Back to Home
              </Link>
              <button
                onClick={() => setShowConnectForm(true)}
                className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium flex items-center"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Connect Location
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
              className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium flex items-center mx-auto"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Connect Your First Location
            </button>
          </div>
        ) : (
          /* Subaccounts Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subaccounts.map((subaccount) => (
              <div key={subaccount.id} className="bg-white p-6 rounded-lg shadow-sm">
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
                  <p className="text-sm text-gray-600 mb-2">
                    📱 {subaccount.phone_number}
                  </p>
                )}

                <div className="space-y-2">
                  <button
                    onClick={() => handleOpenQR(subaccount.location_id)}
                    className="w-full text-gray-600 hover:text-gray-900 border border-gray-300 hover:border-gray-400 px-3 py-2 rounded-md text-sm font-medium flex items-center justify-center"
                  >
                    <QrCodeIcon className="w-4 h-4 mr-2" />
                    Open QR Page
                  </button>
                  {subaccount.status !== 'ready' && (
                    <button
                      onClick={handleCreateSession}
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

        {/* Connect Subaccount Modal */}
        {showConnectForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Connect New Location
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Location ID *
                    </label>
                    <input
                      type="text"
                      value={newLocationId}
                      onChange={(e) => setNewLocationId(e.target.value)}
                      placeholder="Enter your GHL location ID"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Display Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="e.g., Main Office, Downtown Location"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={() => setShowConnectForm(false)}
                      className="flex-1 text-gray-600 hover:text-gray-900 border border-gray-300 hover:border-gray-400 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConnectSubaccount}
                      className="flex-1 bg-blue-600 text-white hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Connect Location
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
