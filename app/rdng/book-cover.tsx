'use client'

import { useEffect, useRef, useState } from 'react'

const PLACEHOLDER = '/cover-placeholder.svg'

/**
 * Open Library has no cover for some editions. By default it answers those
 * with a 200 and a blank 1×1 GIF, which never trips onError; `default=false`
 * makes it 404 instead, so the broken response swaps in a local placeholder.
 */
export default function BookCover({
  isbn,
  title,
  className,
}: {
  isbn: string | null
  title: string
  className?: string
}) {
  const [src, setSrc] = useState(
    isbn
      ? `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg?default=false`
      : PLACEHOLDER,
  )
  const ref = useRef<HTMLImageElement>(null)

  // The <img> is server-rendered, so a load that settles before hydration
  // fires its events with no React handler attached. Catch those here by
  // patching the element directly; the swap is one-way, so state can lag.
  useEffect(() => {
    const img = ref.current
    if (img?.complete && img.naturalWidth <= 1) img.src = PLACEHOLDER
  }, [])

  const fallBack = () => setSrc(PLACEHOLDER)

  return (
    // a plain <img>: next/image has no onError fallback for a remote 404
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      src={src}
      alt={`Cover of ${title}`}
      className={className}
      loading="lazy"
      onError={fallBack}
      // backstop for any other blank 1×1 pixel that slips through
      onLoad={(e) => e.currentTarget.naturalWidth <= 1 && fallBack()}
    />
  )
}
