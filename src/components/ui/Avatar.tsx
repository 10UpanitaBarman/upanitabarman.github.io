const palette = ['bg-hsorange-500', 'bg-hsteal-500', 'bg-purple-500', 'bg-blue-500', 'bg-navy-600']

function hashString(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) % palette.length
  }
  return Math.abs(hash)
}

interface AvatarProps {
  name: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'h-7 w-7 text-[11px]',
  md: 'h-9 w-9 text-xs',
  lg: 'h-14 w-14 text-lg',
}

export function Avatar({ name, size = 'md' }: AvatarProps) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')
  const color = palette[hashString(name)]
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-bold text-white ${color} ${sizeClasses[size]}`}
    >
      {initials}
    </div>
  )
}
