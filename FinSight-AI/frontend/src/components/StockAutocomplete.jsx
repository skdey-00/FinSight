import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Search, Check, Loader2, Building2 } from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Popular stocks for quick access
const POPULAR_STOCKS = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corporation' },
  { symbol: 'GOOGL', name: 'Alphabet Inc. (Class A)' },
  { symbol: 'GOOG', name: 'Alphabet Inc. (Class C)' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation' },
  { symbol: 'META', name: 'Meta Platforms Inc.' },
  { symbol: 'TSLA', name: 'Tesla Inc.' },
  { symbol: 'BRK.B', name: 'Berkshire Hathaway Inc.' },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.' },
  { symbol: 'V', name: 'Visa Inc.' },
  { symbol: 'JNJ', name: 'Johnson & Johnson' },
  { symbol: 'WMT', name: 'Walmart Inc.' },
  { symbol: 'PG', name: 'Procter & Gamble Co.' },
  { symbol: 'MA', name: 'Mastercard Inc.' },
  { symbol: 'HD', name: 'Home Depot Inc.' },
  { symbol: 'DIS', name: 'Walt Disney Co.' },
  { symbol: 'NFLX', name: 'Netflix Inc.' },
  { symbol: 'PYPL', name: 'PayPal Holdings Inc.' },
  { symbol: 'INTC', name: 'Intel Corporation' },
  { symbol: 'AMD', name: 'Advanced Micro Devices' },
  { symbol: 'CRM', name: 'Salesforce Inc.' },
  { symbol: 'ORCL', name: 'Oracle Corporation' },
  { symbol: 'ADBE', name: 'Adobe Inc.' },
  { symbol: 'IBM', name: 'IBM' },
  { symbol: 'BTC', name: 'Bitcoin' },
  { symbol: 'ETH', name: 'Ethereum' },
  { symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust' },
  { symbol: 'QQQ', name: 'Invesco QQQ Trust' },
  { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF' },
]

export default function StockAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = 'Search stocks...'
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState(value || '')
  const [results, setResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [companyName, setCompanyName] = useState(null)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 })
  const wrapperRef = useRef(null)
  const inputRef = useRef(null)
  const searchTimeoutRef = useRef(null)
  const isMountedRef = useRef(true)

  // Clean up on unmount
  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [])

  // Update search when value prop changes (but only if different)
  useEffect(() => {
    if (value !== undefined && value !== search) {
      setSearch(value)
    }
  }, [value, search])

  // Fetch company name from backend (with useCallback to prevent re-renders)
  const fetchCompanyName = useCallback(async (ticker) => {
    if (!ticker || !isMountedRef.current) return

    try {
      const res = await fetch(`${API_BASE}/api/market/company-info?ticker=${ticker.toUpperCase()}`)
      if (res.ok && isMountedRef.current) {
        const data = await res.json()
        if (data.success && data.data?.name) {
          setCompanyName(data.data.name)
        }
      }
    } catch (err) {
      // Silently fail - company name is optional
    }
  }, [])

  // Fetch company name when value changes
  useEffect(() => {
    if (value && value.length >= 1) {
      fetchCompanyName(value)
    } else {
      setCompanyName(null)
    }
  }, [value, fetchCompanyName])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Search for stocks
  const searchStocks = useCallback(async (query) => {
    if (!query || query.length < 1) {
      setResults(POPULAR_STOCKS.slice(0, 8))
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch(`${API_BASE}/api/market/search?q=${encodeURIComponent(query)}`)
      if (res.ok) {
        const data = await res.json()
        if (data.success && data.data?.results && isMountedRef.current) {
          setResults(data.data.results)
        }
      }
    } catch (err) {
      // Fall back to local search
      const filtered = POPULAR_STOCKS.filter(
        stock =>
          stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
          stock.name.toLowerCase().includes(query.toLowerCase())
      )
      if (isMountedRef.current) {
        setResults(filtered.slice(0, 8))
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false)
      }
    }
  }, [])

  // Handle input change
  const handleInputChange = (e) => {
    const newValue = e.target.value.toUpperCase()
    setSearch(newValue)
    onChange(newValue)

    // Clear company name if input is cleared
    if (!newValue) {
      setCompanyName(null)
    }

    // Debounced search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchStocks(newValue)
    }, 200)

    setIsOpen(true)
  }

  // Handle stock selection
  const handleSelect = (stock) => {
    setSearch(stock.symbol)
    onChange(stock.symbol)
    setCompanyName(stock.name)
    setIsOpen(false)
    if (onSelect) {
      onSelect(stock)
    }
    inputRef.current?.blur()
  }

  // Handle input focus - calculate dropdown position
  const handleFocus = () => {
    if (!search && results.length === 0) {
      setResults(POPULAR_STOCKS.slice(0, 8))
    }

    // Calculate dropdown position
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect()
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left
      })
    }

    setIsOpen(true)
  }

  // Memoize the dropdown styles to prevent recalculations
  const dropdownStyle = useMemo(() => ({
    top: dropdownPosition.top + 'px',
    left: dropdownPosition.left + 'px'
  }), [dropdownPosition])

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value !== undefined ? value : search}
          onChange={handleInputChange}
          onFocus={handleFocus}
          placeholder={placeholder}
          className="w-full rounded border border-slate-700 bg-slate-800 px-2 py-1.5 pr-8 text-sm text-white placeholder:text-slate-500 focus:border-primary-500 focus:outline-none"
          autoComplete="off"
        />
        <Search className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 pointer-events-none" />
      </div>

      {/* Company Name Display */}
      {companyName && (
        <div className="mt-1 flex items-center gap-1.5">
          <Building2 className="h-3 w-3 text-slate-500 flex-shrink-0" />
          <p className="text-xs text-slate-400 truncate" title={companyName}>{companyName}</p>
        </div>
      )}

      {/* Dropdown - using fixed positioning to escape table overflow */}
      {isOpen && (
        <div className="fixed z-[9999] max-h-64 w-64 overflow-auto rounded-lg bg-slate-800 border border-slate-700 shadow-xl" style={dropdownStyle}>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
            </div>
          ) : results.length > 0 ? (
            <ul className="py-1">
              {results.map((stock, idx) => (
                <li
                  key={stock.symbol}
                  onClick={() => handleSelect(stock)}
                  className="flex cursor-pointer items-center gap-3 px-4 py-2.5 hover:bg-slate-700 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">{stock.symbol}</span>
                      {value?.toUpperCase() === stock.symbol && (
                        <Check className="h-3.5 w-3.5 text-green-400 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-400 truncate" title={stock.name}>{stock.name}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-4 text-center text-sm text-slate-500">
              No results found
            </div>
          )}
        </div>
      )}
    </div>
  )
}
