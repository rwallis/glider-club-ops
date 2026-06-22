import { images } from '../../data/images'
import { site } from '../../data/siteContent'

interface ClubLogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
}

const sizes = {
  sm: 'h-9 w-9',
  md: 'h-11 w-11',
  lg: 'h-16 w-16',
}

export function ClubLogo({ size = 'md', showText = true, className = '' }: ClubLogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img
        src={images.logo}
        alt={`${site.name} logo`}
        className={`${sizes[size]} rounded-full object-cover shadow-sm ring-2 ring-white/50`}
      />
      {showText && (
        <div className="leading-tight">
          <p className="text-sm font-bold tracking-tight text-sky-950">{site.name}</p>
          <p className="text-xs text-sky-700/80">{site.tagline}</p>
        </div>
      )}
    </div>
  )
}
