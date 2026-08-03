import { useEffect, useRef, useState } from 'react'

const RETRY_DELAY_MS = 4000

export function useBackendData(loader, deps) {
  const [data, setData] = useState(null)
  const loaderRef = useRef(loader)
  loaderRef.current = loader

  useEffect(() => {
    const controller = new AbortController()
    let cancelled = false
    let retryTimeoutId

    async function hydrate() {
      try {
        const result = await loaderRef.current(controller.signal)
        if (!cancelled) {
          setData(result)
        }
      } catch (error) {
        if (cancelled || error.name === 'AbortError') {
          return
        }
        retryTimeoutId = setTimeout(hydrate, RETRY_DELAY_MS)
      }
    }

    setData(null)
    hydrate()

    return () => {
      cancelled = true
      controller.abort()
      clearTimeout(retryTimeoutId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return data
}
