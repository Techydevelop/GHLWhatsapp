import Link from 'next/link'
import { ArrowRightIcon, ChatBubbleLeftRightIcon, LinkIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                  <ChatBubbleLeftRightIcon className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-bold text-gray-900">WhatsApp Integration</h1>
                <p className="text-sm text-gray-500">LeadConnector Marketplace</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                Login
              </Link>
              <Link href="/signup" className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            WhatsApp + LeadConnector
            <span className="block text-blue-600">Integration</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Seamlessly connect your WhatsApp Business with GoHighLevel LeadConnector. 
            Send and receive messages directly from your CRM.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div className="rounded-md shadow">
              <Link href="/signup" className="bg-blue-600 text-white hover:bg-blue-700 w-full flex items-center justify-center px-8 py-3 text-base rounded-md">
                Get Started
                <ArrowRightIcon className="ml-2 w-5 h-5" />
              </Link>
            </div>
            <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
              <Link href="/login" className="text-gray-600 hover:text-gray-900 w-full flex items-center justify-center px-8 py-3 text-base border border-gray-300 rounded-md">
                Login
              </Link>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-20">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <LinkIcon className="w-8 h-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Easy Integration</h3>
                  <p className="mt-2 text-gray-500">
                    Connect your LeadConnector account with just a few clicks using OAuth 2.0.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ChatBubbleLeftRightIcon className="w-8 h-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Real-time Messaging</h3>
                  <p className="mt-2 text-gray-500">
                    Send and receive WhatsApp messages directly from your CRM dashboard.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ShieldCheckIcon className="w-8 h-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Secure & Reliable</h3>
                  <p className="mt-2 text-gray-500">
                    Enterprise-grade security with multi-tenant isolation and RLS policies.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-20">
          <div className="bg-blue-600 rounded-2xl px-6 py-16 sm:px-16 text-center">
            <h2 className="text-3xl font-bold text-white">Ready to Get Started?</h2>
            <p className="mt-4 text-xl text-blue-100">
              Connect your WhatsApp Business with LeadConnector today
            </p>
            <div className="mt-8">
              <Link href="/signup" className="bg-white text-blue-600 hover:bg-gray-50 px-8 py-3 text-lg rounded-md inline-flex items-center">
                Get Started
                <ArrowRightIcon className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500">
            <p>&copy; 2024 WhatsApp Integration. Built for LeadConnector Marketplace.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}