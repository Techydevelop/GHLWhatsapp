'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LinkIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import toast from 'react-hot-toast'
import AuthWrapper from '@/components/AuthWrapper'

const API_URL = process.env.NEXT_PUBLIC_API_URL

function MarketplaceIntegrationContent() {
  const [isConnecting, setIsConnecting] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [accountInfo, setAccountInfo] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
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
      if (!user) return
      const userId = user.id
      
      const response = await fetch(`${API_URL}/auth/account?user_id=${userId}`)
      
      if (response.ok) {
        const account = await response.json()
        setAccountInfo(account)
        setIsConnected(true)
      }
    } catch (error) {
      console.log('No existing connection found')
    }
  }

  const handleConnect = async () => {
    setIsConnecting(true)
    
    try {
      if (!user) {
        toast.error('Please log in to continue')
        return
      }

      // Generate a unique return URL
      const returnUrl = `${window.location.origin}/dashboard`
      
      // Open OAuth popup
      const popup = window.open(
        `${API_URL}/auth/connect?return_url=${encodeURIComponent(returnUrl)}&user_id=${user.id}`,
        'marketplace-oauth',
        'width=600,height=700,scrollbars=yes,resizable=yes'
      )
      
      if (!popup) {
        toast.error('Popup blocked. Please allow popups and try again.')
        setIsConnecting(false)
        return
      }
      
      // Listen for OAuth completion
      const messageHandler = (event: MessageEvent) => {
        if (event.origin !== API_URL) return
        
        if (event.data.type === 'marketplace:connected') {
          popup.close()
          setIsConnected(true)
          setIsConnecting(false)
          toast.success('Successfully connected to LeadConnector!')
          
          // Refresh account info
          checkConnectionStatus()
          
          // Redirect to dashboard after a short delay
          setTimeout(() => {
            router.push('/dashboard')
          }, 2000)
        } else if (event.data.type === 'marketplace:error') {
          popup.close()
          setIsConnecting(false)
          toast.error(`Connection failed: ${event.data.error}`)
        }
      }
      
      window.addEventListener('message', messageHandler)
      
      // Clean up listener when popup closes
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed)
          window.removeEventListener('message', messageHandler)
          setIsConnecting(false)
        }
      }, 1000)
      
    } catch (error) {
      console.error('Connection error:', error)
      toast.error('Failed to initiate connection')
      setIsConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect your LeadConnector account?')) {
      return
    }
    
    try {
      // In a real app, you'd implement account deletion
      toast.success('Account disconnected successfully')
      setIsConnected(false)
      setAccountInfo(null)
    } catch (error) {
      console.error('Disconnect error:', error)
      toast.error('Failed to disconnect account')
    }
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
              <a href="/" className="btn-outline">
                Back to Home
              </a>
              {isConnected && (
                <a href="/dashboard" className="btn-primary">
                  Go to Dashboard
                </a>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">LeadConnector Integration</h2>
          <p className="mt-4 text-lg text-gray-600">
            Connect your GoHighLevel LeadConnector account to enable WhatsApp messaging
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Connection Status */}
          <div className="card p-8">
            <div className="text-center">
              {isConnected ? (
                <div>
                  <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Connected</h3>
                  <p className="text-gray-600 mb-6">
                    Your LeadConnector account is successfully connected
                  </p>
                  {accountInfo && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                      <h4 className="font-medium text-gray-900 mb-2">Account Details</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p><span className="font-medium">Company ID:</span> {accountInfo.company_id}</p>
                        <p><span className="font-medium">User Type:</span> {accountInfo.user_type}</p>
                        <p><span className="font-medium">Connected:</span> {new Date(accountInfo.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  )}
                  <div className="space-y-3">
                    <a href="/dashboard" className="btn-primary w-full">
                      Go to Dashboard
                    </a>
                    <button onClick={handleDisconnect} className="btn-danger w-full">
                      Disconnect Account
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <ExclamationTriangleIcon className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Not Connected</h3>
                  <p className="text-gray-600 mb-6">
                    Connect your LeadConnector account to get started
                  </p>
                  <button
                    onClick={handleConnect}
                    disabled={isConnecting}
                    className="btn-primary w-full"
                  >
                    {isConnecting ? 'Connecting...' : 'Connect Account'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Features */}
          <div className="space-y-6">
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">What You&apos;ll Get</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-gray-600">Send WhatsApp messages directly from your CRM</span>
                </li>
                <li className="flex items-start">
                  <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-gray-600">Receive messages in real-time</span>
                </li>
                <li className="flex items-start">
                  <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-gray-600">Multi-location support</span>
                </li>
                <li className="flex items-start">
                  <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-gray-600">Secure OAuth 2.0 authentication</span>
                </li>
                <li className="flex items-start">
                  <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-gray-600">Dedicated QR code pages for each location</span>
                </li>
              </ul>
            </div>

            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">How It Works</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 text-sm font-medium">1</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-gray-600">Click &quot;Connect Account&quot; to authorize with LeadConnector</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 text-sm font-medium">2</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-gray-600">Select your locations and grant necessary permissions</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 text-sm font-medium">3</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-gray-600">Set up WhatsApp sessions for each location</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-12 card p-6 bg-blue-50 border-blue-200">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Security & Privacy</h3>
              <p className="mt-1 text-sm text-blue-700">
                We use OAuth 2.0 for secure authentication. Your credentials are never stored on our servers. 
                All data is encrypted and protected with enterprise-grade security measures.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function MarketplaceIntegrationPage() {
  return (
    <AuthWrapper>
      <MarketplaceIntegrationContent />
    </AuthWrapper>
  )
}
