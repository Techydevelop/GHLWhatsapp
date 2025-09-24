'use client'

import { useState } from 'react'
import { 
  QrCodeIcon, 
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  PlusIcon
} from '@heroicons/react/24/outline'

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

interface SubaccountListProps {
  subaccounts: Subaccount[]
  onCreateSession: (locationId: string) => void
  onOpenQR: (locationId: string) => void
  onOpenChat: (subaccount: Subaccount) => void
  onConnectNew: () => void
}

export default function SubaccountList({
  subaccounts,
  onCreateSession,
  onOpenQR,
  onOpenChat,
  onConnectNew
}: SubaccountListProps) {
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

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
    
    switch (status) {
      case 'ready':
        return `${baseClasses} bg-green-100 text-green-800`
      case 'qr':
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      case 'initializing':
        return `${baseClasses} bg-blue-100 text-blue-800`
      case 'disconnected':
      case 'auth_failure':
        return `${baseClasses} bg-red-100 text-red-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  if (subaccounts.length === 0) {
    return (
      <div className="text-center py-12">
        <ChatBubbleLeftRightIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No locations connected</h3>
        <p className="text-gray-600 mb-6">
          Connect your first LeadConnector location to start using WhatsApp integration
        </p>
        <button
          onClick={onConnectNew}
          className="btn-primary"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Connect Your First Location
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">
          Connected Locations ({subaccounts.length})
        </h2>
        <button
          onClick={onConnectNew}
          className="btn-outline"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Add Location
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subaccounts.map((subaccount) => (
          <div key={subaccount.id} className="card p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {subaccount.name}
                </h3>
                <p className="text-sm text-gray-500 mb-2">
                  ID: {subaccount.location_id}
                </p>
                {subaccount.session && (
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(subaccount.session.status)}
                    <span className={getStatusBadge(subaccount.session.status)}>
                      {getStatusText(subaccount.session.status)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {subaccount.session && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                {subaccount.session.phone_number && (
                  <p className="text-sm text-gray-700 mb-1">
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
                    onClick={() => onOpenQR(subaccount.location_id)}
                    className="btn-outline w-full text-sm"
                  >
                    <QrCodeIcon className="w-4 h-4 mr-2" />
                    Open QR Page
                  </button>
                  
                  {subaccount.session.status !== 'ready' && (
                    <button
                      onClick={() => onCreateSession(subaccount.location_id)}
                      className="btn-primary w-full text-sm"
                    >
                      Rescan QR Code
                    </button>
                  )}
                  
                  {subaccount.session.status === 'ready' && (
                    <button
                      onClick={() => onOpenChat(subaccount)}
                      className="btn-success w-full text-sm"
                    >
                      <ChatBubbleLeftRightIcon className="w-4 h-4 mr-2" />
                      Open Chat
                    </button>
                  )}
                </>
              ) : (
                <button
                  onClick={() => onCreateSession(subaccount.location_id)}
                  className="btn-primary w-full text-sm"
                >
                  Create WhatsApp Session
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
