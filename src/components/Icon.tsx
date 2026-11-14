const paths: Record<string, string> = {
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zm9 16-4.35-4.35',
  cart: 'M3 4h2l2.4 10.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 1.9-1.4L21 8H6.2M10 20.5a1 1 0 1 0 0-.01M17 20.5a1 1 0 1 0 0-.01',
  heart: 'M12 20s-7-4.4-9.2-8.6C1.2 8.3 3 5 6.4 5c2 0 3.2 1.1 3.9 2.2l1.7 2 1.7-2C14.4 6.1 15.6 5 17.6 5 21 5 22.8 8.3 21.2 11.4 19 15.6 12 20 12 20z',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-8 9a8 8 0 0 1 16 0',
  menu: 'M4 7h16M4 12h16M4 17h16',
  close: 'M6 6l12 12M18 6 6 18',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  truck: 'M3 6h11v10H3zM14 9h4l3 3.5V16h-7M7 18.5a1.5 1.5 0 1 0 0-.01M17 18.5a1.5 1.5 0 1 0 0-.01',
  return: 'M9 14 4 9l5-5M4 9h10a6 6 0 0 1 0 12h-3',
  shield: 'M12 3 4 6v6c0 4.5 3.4 8 8 9 4.6-1 8-4.5 8-9V6z',
  chat: 'M4 5h16v11H8l-4 4z',
  chevron: 'M9 6l6 6-6 6',
  chevronDown: 'M6 9l6 6 6-6',
  compare: 'M7 4v16M17 4v16M4 8h6M14 16h6',
  filter: 'M4 6h16M7 12h10M10 18h4',
  minus: 'M5 12h14',
  plus: 'M12 5v14M5 12h14',
  trash: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13',
  star: 'M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8L3.5 9.7l5.9-.8z',
  store: 'M4 9l1.5-5h13L20 9M4 9v11h16V9M4 9h16M9 20v-6h6v6',
  spark: 'M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6',
  gift: 'M4 10h16v10H4zM2 7h20v3H2zM12 7v13M12 7c-2-4-6-4-6-1 0 1 1 1 6 1zm0 0c2-4 6-4 6-1 0 1-1 1-6 1z',
  lock: 'M6 11h12v9H6zM8 11V8a4 4 0 0 1 8 0v3',
  grid: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
  list: 'M4 6h16M4 12h16M4 18h16',
}

export default function Icon({ name, size = 20, className, fill }: { name: keyof typeof paths | string; size?: number; className?: string; fill?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true"
      fill={fill ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={paths[name] ?? ''} />
    </svg>
  )
}
