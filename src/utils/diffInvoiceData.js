// Deep-diffs two invoice `data` objects (originalData vs proposedData) and
// returns only the leaf fields that actually changed.

const isEmptyVal = (v) => v === null || v === undefined || v === ''
const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v)

const valuesEqual = (a, b) => {
  if (isEmptyVal(a) && isEmptyVal(b)) return true
  return JSON.stringify(a) === JSON.stringify(b)
}

const walk = (original, proposed, pathParts, out) => {
  const keys = new Set([
    ...Object.keys(original || {}),
    ...Object.keys(proposed || {}),
  ])

  keys.forEach((key) => {
    const oVal = original?.[key]
    const pVal = proposed?.[key]
    const nextPath = [...pathParts, key]

    if (Array.isArray(oVal) || Array.isArray(pVal)) {
      const oArr = Array.isArray(oVal) ? oVal : []
      const pArr = Array.isArray(pVal) ? pVal : []
      const maxLen = Math.max(oArr.length, pArr.length)
      for (let i = 0; i < maxLen; i++) {
        const oItem = oArr[i]
        const pItem = pArr[i]
        if (isPlainObject(oItem) || isPlainObject(pItem)) {
          walk(oItem || {}, pItem || {}, [...nextPath, `Item ${i + 1}`], out)
        } else if (!valuesEqual(oItem, pItem)) {
          out.push({ path: [...nextPath, `Item ${i + 1}`], oldValue: oItem, newValue: pItem })
        }
      }
      return
    }

    if (isPlainObject(oVal) || isPlainObject(pVal)) {
      walk(oVal || {}, pVal || {}, nextPath, out)
      return
    }

    if (!valuesEqual(oVal, pVal)) {
      out.push({ path: nextPath, oldValue: oVal, newValue: pVal })
    }
  })
}

// Returns: [{ section, sectionKey, fieldPath, fieldLabel, oldValue, newValue }]
export const diffInvoiceData = (originalData = {}, proposedData = {}) => {
  const raw = []
  walk(originalData, proposedData, [], raw)

  return raw.map((entry) => {
    const [sectionKey, ...rest] = entry.path
    return {
      sectionKey,
      fieldPath: rest,
      oldValue: entry.oldValue,
      newValue: entry.newValue,
    }
  })
}

// Groups flat diff entries by section for rendering.
export const groupDiffBySection = (diffEntries) => {
  const map = new Map()
  diffEntries.forEach((entry) => {
    if (!map.has(entry.sectionKey)) map.set(entry.sectionKey, [])
    map.get(entry.sectionKey).push(entry)
  })
  return Array.from(map.entries()).map(([sectionKey, fields]) => ({ sectionKey, fields }))
}