import { useState, useEffect, useRef, useCallback } from 'react'
import { itemApi } from '../../services/itemApi'

/**
 * ItemTypeSearch
 *
 * A self-contained searchable dropdown for Item Type.
 *
 * Props:
 *   value      {string}   – current field value (controlled)
 *   onChange   {fn}       – called with the selected itemName string
 *   placeholder{string}   – input placeholder text
 *   className  {string}   – extra class names forwarded to the input
 *   disabled   {boolean}
 */
const ItemTypeSearch = ({ value = '', onChange, placeholder = 'Item Type', className = '', disabled = false }) => {
  const [inputValue, setInputValue]     = useState(value)
  const [suggestions, setSuggestions]   = useState([])
  const [isOpen, setIsOpen]             = useState(false)
  const [isLoading, setIsLoading]       = useState(false)
  const [activeIndex, setActiveIndex]   = useState(-1)
  const [initialItems, setInitialItems] = useState([])
  const [dropdownStyle, setDropdownStyle] = useState({})   // ← NEW

  const debounceTimer = useRef(null)
  const containerRef  = useRef(null)
  const inputRef      = useRef(null)

  // ── Load all items once on mount ─────────────────────────────────────────
  useEffect(() => {
    let cancelled = false
    itemApi.getAll().then((res) => {
      if (cancelled) return
      const items = res?.data ?? []
      setInitialItems(items)
    }).catch(() => {})
    return () => { cancelled = true }
  }, [])

  // ── Keep input in sync when parent resets the value ──────────────────────
  useEffect(() => {
    setInputValue(value)
  }, [value])

  // ── Close dropdown on outside click ──────────────────────────────────────
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
        setActiveIndex(-1)
        setInputValue(value)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [value])

  // ── Reposition dropdown on scroll/resize so it tracks the input ──────────
  useEffect(() => {
    if (!isOpen) return
    const reposition = () => {
      if (!inputRef.current) return
      const rect = inputRef.current.getBoundingClientRect()
      setDropdownStyle({
        position: 'fixed',
        top:      rect.bottom,
        left:     rect.left,
        minWidth: rect.width,
        zIndex:   9999,
      })
    }
    window.addEventListener('scroll',  reposition, true)
    window.addEventListener('resize',  reposition)
    return () => {
      window.removeEventListener('scroll',  reposition, true)
      window.removeEventListener('resize',  reposition)
    }
  }, [isOpen])

  // ── Calculate dropdown position from input bounding rect ─────────────────
  const updateDropdownPosition = useCallback(() => {
    if (!inputRef.current) return
    const rect = inputRef.current.getBoundingClientRect()
    setDropdownStyle({
      position: 'fixed',
      top:      rect.bottom,
      left:     rect.left,
      minWidth: rect.width,
      zIndex:   9999,
    })
  }, [])

  // ── Debounced suggest call ────────────────────────────────────────────────
  const fetchSuggestions = useCallback((q) => {
    clearTimeout(debounceTimer.current)

    if (!q.trim()) {
      setSuggestions(initialItems)
      setIsOpen(initialItems.length > 0)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    debounceTimer.current = setTimeout(async () => {
      try {
        const res = await itemApi.suggest(q)
        const items = res?.data ?? []
        setSuggestions(items)
        setIsOpen(true)
      } catch {
        setSuggestions([])
      } finally {
        setIsLoading(false)
      }
    }, 350)
  }, [initialItems])

  // ── Input change handler ──────────────────────────────────────────────────
  const handleInputChange = (e) => {
    const q = e.target.value
    setInputValue(q)
    setActiveIndex(-1)
    fetchSuggestions(q)
  }

  // ── Focus: show all items immediately ────────────────────────────────────
  const handleFocus = () => {
    updateDropdownPosition()   // ← calculate position before opening
    if (!inputValue.trim()) {
      setSuggestions(initialItems)
      setIsOpen(initialItems.length > 0)
    } else {
      fetchSuggestions(inputValue)
    }
  }

  // ── Select an item ───────────────────────────────────────────────────────
  const handleSelect = (itemName) => {
    setInputValue(itemName)
    setIsOpen(false)
    setActiveIndex(-1)
    onChange?.(itemName)
  }

  // ── Keyboard navigation ──────────────────────────────────────────────────
  const handleKeyDown = (e) => {
    if (!isOpen) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setActiveIndex((i) => Math.max(i - 1, 0))
        break
      case 'Enter':
        e.preventDefault()
        if (activeIndex >= 0 && suggestions[activeIndex]) {
          handleSelect(suggestions[activeIndex].itemName)
        }
        break
      case 'Escape':
        setIsOpen(false)
        setActiveIndex(-1)
        setInputValue(value)
        break
      default:
        break
    }
  }

  // ── Styles ────────────────────────────────────────────────────────────────
  const inputClass = [
    'border-0 rounded-none bg-transparent shadow-none px-2 py-1 text-xs text-ink-900',
    'placeholder:text-ink-400 outline-none w-full',
    className,
  ].join(' ')

  return (
    <div ref={containerRef} className="relative w-full">
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
        className={inputClass}
        aria-autocomplete="list"
        aria-expanded={isOpen}
        role="combobox"
      />

      {isOpen && (
        <ul
          role="listbox"
          style={dropdownStyle}
          className="max-h-48 overflow-y-auto rounded-lg border border-cloud-200 bg-white shadow-md text-xs"
        >
          {isLoading ? (
            <li className="px-3 py-2 text-ink-400">Loading…</li>
          ) : suggestions.length === 0 ? (
            <li className="px-3 py-2 text-ink-400">No items found</li>
          ) : (
            suggestions.map((item, idx) => (
              <li
                key={item.id ?? item.itemName}
                role="option"
                aria-selected={idx === activeIndex}
                onMouseDown={(e) => {
                  e.preventDefault()
                  handleSelect(item.itemName)
                }}
                onMouseEnter={() => setActiveIndex(idx)}
                className={[
                  'cursor-pointer px-3 py-2 text-ink-800 transition-colors',
                  idx === activeIndex ? 'bg-cloud-100' : 'hover:bg-cloud-50',
                ].join(' ')}
              >
                {item.itemName}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}

export default ItemTypeSearch