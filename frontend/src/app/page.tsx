import Link from 'next/link'
import { ArrowRightIcon, ChatBubbleLeftRightIcon, LinkIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-whatsapp-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-whatsapp-600 rounded-lg flex items-center justify-center">
                  <ChatBubbleLeftRightIcon className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-bold text-gray-900">WhatsApp Integration</h1>
                <p className="text-sm text-gray-500">LeadConnector Marketplace</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/integrations/marketplace" className="btn-outline">
                Connect Account
              </Link>
              <Link href="/dashboard" className="btn-primary">
                Dashboard
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
            <span className="block text-primary-600">Integration</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Seamlessly connect your WhatsApp Business with GoHighLevel LeadConnector. 
            Send and receive messages directly from your CRM.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div className="rounded-md shadow">
              <Link href="/integrations/marketplace" className="btn-primary w-full flex items-center justify-center px-8 py-3 text-base">
                Get Started
                <ArrowRightIcon className="ml-2 w-5 h-5" />
              </Link>
            </div>
            <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
              <Link href="/dashboard" className="btn-outline w-full flex items-center justify-center px-8 py-3 text-base">
                View Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-20">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="card p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <LinkIcon className="w-8 h-8 text-primary-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Easy Integration</h3>
                  <p className="mt-2 text-gray-500">
                    Connect your LeadConnector account with just a few clicks using OAuth 2.0.
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ChatBubbleLeftRightIcon className="w-8 h-8 text-whatsapp-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Real-time Messaging</h3>
                  <p className="mt-2 text-gray-500">
                    Send and receive WhatsApp messages directly from your CRM dashboard.
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-6">
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

        {/* How it Works */}
        <div className="mt-20">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
            <p className="mt-4 text-lg text-gray-500">
              Get up and running in minutes with our simple 3-step process
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-primary-100 rounded-full">
                <span className="text-primary-600 font-bold text-lg">1</span>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Connect Account</h3>
              <p className="mt-2 text-gray-500">
                Authorize your LeadConnector account using our secure OAuth flow.
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-whatsapp-100 rounded-full">
                <span className="text-whatsapp-600 font-bold text-lg">2</span>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Scan QR Code</h3>
              <p className="mt-2 text-gray-500">
                Link your WhatsApp Business account by scanning the QR code.
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-green-100 rounded-full">
                <span className="text-green-600 font-bold text-lg">3</span>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Start Messaging</h3>
              <p className="mt-2 text-gray-500">
                Send and receive messages directly from your CRM dashboard.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-20">
          <div className="bg-primary-600 rounded-2xl px-6 py-16 sm:px-16 text-center">
            <h2 className="text-3xl font-bold text-white">Ready to Get Started?</h2>
            <p className="mt-4 text-xl text-primary-100">
              Connect your WhatsApp Business with LeadConnector today
            </p>
            <div className="mt-8">
              <Link href="/integrations/marketplace" className="btn bg-white text-primary-600 hover:bg-gray-50 px-8 py-3 text-lg">
                Connect Now
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
