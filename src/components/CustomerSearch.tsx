import { useState, useCallback, useRef, useEffect } from 'react'
import { Search, User, Phone } from 'lucide-react'
import { formatPhoneForDisplay } from '../utils/phone'

interface Customer {
  id: string
  name: string
  phone: string
  email?: string
}

interface CustomerSearchProps {
  tenantId: string
  value?: string
  onSelect: (customer: Customer) => void
  onChange?: (phone: string) => void
  placeholder?: string
  disabled?: boolean
}

export function CustomerSearch({
  tenantId,
  value,
  onSelect,
  onChange,
  placeholder = 'Cari nama atau nomor...',
  disabled = false
}: CustomerSearchProps) {
  const [query, setQuery] = useState(value || '')
  const [results, setResults] = useState<Customer[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const searchCustomers = useCallback(async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 2) {
      setResults([])
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch(
        `/api/customers/search?tenant_id=${tenantId}&q=${encodeURIComponent(searchQuery)}`
      )
      const data = await res.json()
      setResults(data.results || [])
    } catch (error) {
      console.error('Customer search error:', error)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, [tenantId])

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (query.length >= 2) {
        searchCustomers(query)
      }
    }, 300)

    return () => clearTimeout(debounce)
  }, [query, searchCustomers])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setQuery(newValue)
    setIsOpen(true)
    onChange?.(newValue)
  }

  const handleSelectCustomer = (customer: Customer) => {
    setQuery(customer.name)
    setIsOpen(false)
    onSelect(customer)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <Search className="w-4 h-4" />
        </div>
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
          {results.map((customer) => (
            <div
              key={customer.id}
              onClick={() => handleSelectCustomer(customer)}
              className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{customer.name}</div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Phone className="w-3 h-3" />
                    <span>{formatPhoneForDisplay(customer.phone)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isOpen && query.length >= 2 && results.length === 0 && !isLoading && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg p-4 text-center text-gray-500 text-sm">
          Customer tidak ditemukan
        </div>
      )}
    </div>
  )
}

interface CustomerDisplayProps {
  customer?: Customer | null
  onClear?: () => void
  onEdit?: () => void
}

export function CustomerDisplay({ customer, onClear, onEdit }: CustomerDisplayProps) {
  if (!customer) return null

  return (
    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-blue-700" />
        </div>
        <div>
          <div className="font-medium text-sm">{customer.name}</div>
          <div className="text-xs text-gray-600">{formatPhoneForDisplay(customer.phone)}</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {onEdit && (
          <button
            onClick={onEdit}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Ubah
          </button>
        )}
        {onClear && (
          <button
            onClick={onClear}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            ×
          </button>
        )}
      </div>
    </div>
  )
}
