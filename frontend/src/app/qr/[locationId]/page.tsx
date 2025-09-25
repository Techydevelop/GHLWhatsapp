'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { 
  QrCodeIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

export const dynamic = 'force-dynamic'

export default function QRPage() {
  const params = useParams()
  const router = useRouter()
  const locationId = params.locationId as string
  
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [status, setStatus] = useState<'loading' | 'qr' | 'ready' | 'error'>('loading')
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    checkUser()
    loadQRCode()
  }, [locationId])

  const checkUser = async () => {
    try {
      if (!supabase) {
        toast.error('Supabase is not configured')
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
    }
  }

  const loadQRCode = async () => {
    try {
      if (!supabase) {
        toast.error('Supabase is not configured')
        return
      }

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        toast.error('Please login first')
        return
      }

      // Call backend API to get QR code for this location
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/location/${locationId}/qr`, {
        headers: { 
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch QR code')
      }

      const data = await response.json()
      setQrCode(data.qr)
      setStatus(data.status)
      setPhoneNumber(data.phone_number)
    } catch (error) {
      console.error('Error loading QR code:', error)
      setStatus('error')
      toast.error('Failed to load QR code')
    } finally {
      setIsLoading(false)
    }
  }

  const refreshQR = async () => {
    setIsLoading(true)
    setStatus('loading')
    await loadQRCode()
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'ready':
        return <CheckCircleIcon className="w-8 h-8 text-green-500" />
      case 'qr':
        return <QrCodeIcon className="w-8 h-8 text-blue-500" />
      case 'error':
        return <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
      default:
        return <QrCodeIcon className="w-8 h-8 text-gray-500" />
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'ready':
        return 'WhatsApp Connected'
      case 'qr':
        return 'Scan QR Code to Connect'
      case 'error':
        return 'Connection Error'
      default:
        return 'Loading...'
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'ready':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'qr':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading QR Code...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
              >
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                Back to Dashboard
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">WhatsApp QR Code</h1>
                <p className="text-sm text-gray-500">Location ID: {locationId}</p>
              </div>
            </div>
            <button
              onClick={refreshQR}
              disabled={isLoading}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              <ArrowPathIcon className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          {/* Status */}
          <div className={`inline-flex items-center px-4 py-2 rounded-full border ${getStatusColor()}`}>
            {getStatusIcon()}
            <span className="ml-2 font-medium">{getStatusText()}</span>
          </div>

          {phoneNumber && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Connected Phone:</span> {phoneNumber}
              </p>
            </div>
          )}

          {/* QR Code */}
          <div className="mt-8 text-center">
            {status === 'qr' && qrCode ? (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Scan this QR code with WhatsApp Business
                </h2>
                <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg">
                  <img 
                    src={qrCode} 
                    alt="WhatsApp QR Code" 
                    className="w-64 h-64 mx-auto"
                  />
                </div>
                <p className="mt-4 text-sm text-gray-600">
                  1. Open WhatsApp Business on your phone<br/>
                  2. Go to Settings → Linked Devices<br/>
                  3. Tap "Link a Device"<br/>
                  4. Scan this QR code
                </p>
              </div>
            ) : status === 'ready' ? (
              <div className="text-center">
                <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-lg font-medium text-gray-900 mb-2">
                  WhatsApp Connected Successfully!
                </h2>
                <p className="text-gray-600">
                  Your WhatsApp Business is now connected to this location.
                </p>
              </div>
            ) : status === 'error' ? (
              <div className="text-center">
                <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-lg font-medium text-gray-900 mb-2">
                  Connection Error
                </h2>
                <p className="text-gray-600 mb-4">
                  There was an error connecting WhatsApp. Please try again.
                </p>
                <button
                  onClick={refreshQR}
                  className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Generating QR Code...</p>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-blue-900 mb-3">
              How to Connect WhatsApp Business
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-blue-800">
              <li>Make sure you have WhatsApp Business installed on your phone</li>
              <li>Open WhatsApp Business and go to Settings</li>
              <li>Tap on "Linked Devices"</li>
              <li>Tap "Link a Device"</li>
              <li>Scan the QR code above with your phone camera</li>
              <li>Wait for the connection to be established</li>
            </ol>
          </div>
        </div>
      </main>
    </div>
  )
}
