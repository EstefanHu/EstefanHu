'use client'

import { useState } from 'react'

const PLACEHOLDER = '/cover-placeholder.svg'

/**
 * Open Library has no cover for some editions and answers with a 404, so the
 * broken response swaps in a local placeholder instead of leaving a torn-image
 * icon in the card.
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
    isbn ? `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg` : PLACEHOLDER,
  )

  return (
    <img
      src={src}
      alt={`Cover of ${title}`}
      className={className}
      loading="lazy"
      onError={() => setSrc(PLACEHOLDER)}
    />
  )
}