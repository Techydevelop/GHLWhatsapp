'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  XMarkIcon, 
  PaperAirplaneIcon,
  PaperClipIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

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

interface Message {
  id: string
  from_number: string
  to_number: string
  body?: string
  media_url?: string
  media_mime?: string
  direction: 'in' | 'out'
  created_at: string
}

interface ChatPaneProps {
  subaccount: Subaccount
  onClose: () => void
}

export default function ChatPane({ subaccount, onClose }: ChatPaneProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [recipientPhone, setRecipientPhone] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (subaccount.session?.id) {
      loadMessages()
    }
  }, [subaccount.session?.id])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadMessages = async () => {
    if (!subaccount.session?.id) return

    try {
      setIsLoading(true)
      const token = 'temp-token' // This should come from your auth system
      
      const response = await fetch(`${API_URL}/messages/${subaccount.session.id}?limit=50`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
      } else {
        toast.error('Failed to load messages')
      }
    } catch (error) {
      console.error('Error loading messages:', error)
      toast.error('Failed to load messages')
    } finally {
      setIsLoading(false)
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newMessage.trim() || !recipientPhone.trim() || !subaccount.session?.id) {
      return
    }

    try {
      setIsSending(true)
      const token = 'temp-token' // This should come from your auth system
      
      const response = await fetch(`${API_URL}/messages/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          sessionId: subaccount.session.id,
          to: recipientPhone,
          body: newMessage.trim()
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        toast.success('Message sent successfully!')
        setNewMessage('')
        loadMessages() // Refresh messages
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to send message')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')
    } finally {
      setIsSending(false)
    }
  }

  const formatPhoneNumber = (phone: string) => {
    // Simple phone number formatting
    if (phone.startsWith('+')) {
      return phone
    }
    return `+${phone}`
  }

  const formatMessageTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Chat - {subaccount.name}
            </h3>
            <p className="text-sm text-gray-500">
              {subaccount.session?.phone_number && `📱 ${subaccount.session.phone_number}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No messages yet. Send your first message below!</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.direction === 'out' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.direction === 'out'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-900'
                  }`}
                >
                  {message.body && (
                    <p className="text-sm">{message.body}</p>
                  )}
                  {message.media_url && (
                    <div className="mt-2">
                      <p className="text-xs opacity-75">
                        📎 {message.media_mime || 'Media'}
                      </p>
                    </div>
                  )}
                  <p className={`text-xs mt-1 ${
                    message.direction === 'out' ? 'text-primary-100' : 'text-gray-500'
                  }`}>
                    {formatMessageTime(message.created_at)}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="border-t border-gray-200 p-4">
          <form onSubmit={sendMessage} className="space-y-3">
            <div>
              <input
                type="tel"
                value={recipientPhone}
                onChange={(e) => setRecipientPhone(e.target.value)}
                placeholder="Enter phone number (e.g., +1234567890)"
                className="input text-sm"
                required
              />
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="input flex-1 text-sm"
                required
              />
              <button
                type="submit"
                disabled={isSending || !newMessage.trim() || !recipientPhone.trim()}
                className="btn-primary px-4 py-2 text-sm"
              >
                {isSending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <PaperAirplaneIcon className="w-4 h-4" />
                )}
              </button>
            </div>
          </form>
          
          <div className="mt-2 text-xs text-gray-500">
            💡 Tip: Use international format (e.g., +1234567890) for best results
          </div>
        </div>
      </div>
    </div>
  )
}
