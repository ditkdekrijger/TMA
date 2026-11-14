import { useEffect } from 'react'
import { shop } from './config'

export function useTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} | ${shop.name}` : `${shop.name} — Muziekinstrumenten & accessoires`
  }, [title])
}
