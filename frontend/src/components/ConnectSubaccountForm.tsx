'use client'

import { useState } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'

interface ConnectSubaccountFormProps {
  onSubmit: (locationId: string, name?: string) => void
  onCancel: () => void
}

export default function ConnectSubaccountForm({ onSubmit, onCancel }: ConnectSubaccountFormProps) {
  const [locationId, setLocationId] = useState('')
  const [name, setName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!locationId.trim()) {
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(locationId.trim(), name.trim() || undefined)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="locationId" className="label">
          Location ID *
        </label>
        <input
          type="text"
          id="locationId"
          value={locationId}
          onChange={(e) => setLocationId(e.target.value)}
          placeholder="Enter your GHL location ID"
          className="input"
          required
        />
        <p className="mt-1 text-xs text-gray-500">
          You can find this in your GoHighLevel settings
        </p>
      </div>

      <div>
        <label htmlFor="name" className="label">
          Display Name (Optional)
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Main Office, Downtown Location"
          className="input"
        />
        <p className="mt-1 text-xs text-gray-500">
          A friendly name to identify this location
        </p>
      </div>

      <div className="flex space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="btn-outline flex-1"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn-primary flex-1"
          disabled={isSubmitting || !locationId.trim()}
        >
          {isSubmitting ? 'Connecting...' : 'Connect Location'}
        </button>
      </div>
    </form>
  )
}
