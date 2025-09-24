'use client'

import { useState, useEffect } from 'react'
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  ArrowTopRightOnSquareIcon,
  LinkIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import AuthWrapper from '@/components/AuthWrapper'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'
export const runtime = 'nodejs'

const API_URL = process.env.NEXT_PUBLIC_API_URL

interface MarketplaceAccount {
  id: string
  company_id: string
  user_type: string
  created_at: string
}

function MarketplaceContent() {
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [account, setAccount] = useState<MarketplaceAccount | null>(null)
  const [user, setUser] = useState<any>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    getUser()
    checkConnectionStatus()
  }, [])

  const getUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }

  const checkConnectionStatus = async () => {
    try {
      setIsLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        toast.error('Please log in to continue')
        return
      }
      const token = session.access_token
      
      const response = await fetch(`${API_URL}/admin/marketplace/status`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setIsConnected(data.connected)
        setAccount(data.account)
      } else {
        setIsConnected(false)
      }
    } catch (error) {
      console.error('Error checking connection status:', error)
      setIsConnected(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleConnect = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        toast.error('Please log in to continue')
        return
      }
      const token = session.access_token
      
      const response = await fetch(`${API_URL}/admin/marketplace/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        window.location.href = data.authUrl
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to initiate connection')
      }
    } catch (error) {
      console.error('Error connecting to marketplace:', error)
      toast.error('Failed to connect to marketplace')
    }
  }

  const handleDisconnect = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        toast.error('Please log in to continue')
        return
      }
      const token = session.access_token
      
      const response = await fetch(`${API_URL}/admin/marketplace/disconnect`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        setIsConnected(false)
        setAccount(null)
        toast.success('Disconnected from LeadConnector successfully')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to disconnect')
      }
    } catch (error) {
      console.error('Error disconnecting from marketplace:', error)
      toast.error('Failed to disconnect from marketplace')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking connection status...</p>
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
              <LinkIcon className="w-8 h-8 text-primary-600" />
              <div className="ml-3">
                <h1 className="text-xl font-bold text-gray-900">Marketplace Integration</h1>
                <p className="text-sm text-gray-500">Connect your LeadConnector account</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Welcome, {user?.email}
              </div>
              <a href="/dashboard" className="btn-outline">
                Back to Dashboard
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          {/* Connection Status */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              {isConnected ? (
                <CheckCircleIcon className="w-8 h-8 text-green-500 mr-3" />
              ) : (
                <ExclamationTriangleIcon className="w-8 h-8 text-yellow-500 mr-3" />
              )}
              <h2 className="text-2xl font-bold text-gray-900">
                {isConnected ? 'Connected to LeadConnector' : 'Not Connected'}
              </h2>
            </div>
            
            {isConnected && account ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                  <span className="text-green-800 font-medium">Successfully connected!</span>
                </div>
                <div className="mt-2 text-sm text-green-700">
                  <p>Company ID: {account.company_id}</p>
                  <p>User Type: {account.user_type}</p>
                  <p>Connected: {new Date(account.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500 mr-2" />
                  <span className="text-yellow-800 font-medium">Not connected to LeadConnector</span>
                </div>
                <p className="mt-2 text-sm text-yellow-700">
                  Connect your LeadConnector account to start using WhatsApp integration.
                </p>
              </div>
            )}
          </div>

          {/* What You'll Get */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">What You&apos;ll Get</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start">
                <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                <div>
                  <h4 className="font-medium text-gray-900">WhatsApp Integration</h4>
                  <p className="text-sm text-gray-600">Connect WhatsApp to your LeadConnector locations</p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                <div>
                  <h4 className="font-medium text-gray-900">Message Sync</h4>
                  <p className="text-sm text-gray-600">Automatic message synchronization between platforms</p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                <div>
                  <h4 className="font-medium text-gray-900">Contact Management</h4>
                  <p className="text-sm text-gray-600">Seamless contact and lead management</p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                <div>
                  <h4 className="font-medium text-gray-900">Real-time Updates</h4>
                  <p className="text-sm text-gray-600">Instant notifications and message delivery</p>
                </div>
              </div>
            </div>
          </div>

          {/* Permissions */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Required Permissions</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2">
                This integration requires the following permissions:
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Read and write access to your locations</li>
                <li>• Read and write access to your contacts</li>
                <li>• Read access to your business information</li>
                <li>• Read and write access to your users</li>
                <li>• Read and write access to your media files</li>
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            {isConnected ? (
              <>
                <a
                  href="/dashboard"
                  className="btn-primary flex items-center justify-center"
                >
                  <ArrowTopRightOnSquareIcon className="w-4 h-4 mr-2" />
                  Go to Dashboard
                </a>
                <button
                  onClick={handleDisconnect}
                  className="btn-outline text-red-600 border-red-300 hover:bg-red-50"
                >
                  Disconnect Account
                </button>
              </>
            ) : (
              <button
                onClick={handleConnect}
                className="btn-primary flex items-center justify-center"
              >
                <LinkIcon className="w-4 h-4 mr-2" />
                Connect Account
              </button>
            )}
          </div>

          {/* Help Text */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Need Help?</h4>
            <p className="text-sm text-blue-800">
              If you&apos;re having trouble connecting, make sure you have the necessary permissions 
              in your LeadConnector account. Contact your administrator if you need assistance.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function MarketplacePage() {
  return (
    <AuthWrapper>
      <MarketplaceContent />
    </AuthWrapper>
  )
}

// Ensure this page is never statically generated
export async function generateStaticParams() {
  return []
}
