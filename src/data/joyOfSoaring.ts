/** Local gallery assets — cropped from club photos in public/images/ */

export const JOY_OF_SOARING_VIDEO = {
  embedUrl: 'https://www.youtube.com/embed/AS_nMtm4esY',
  title: 'The joy of soaring at Fault Line Flyers',
} as const

export const JOY_OF_SOARING_QUOTE = {
  text: 'More than anything else the sensation is one of perfect peace mingled with an excitement that strains every nerve to the utmost, if you can conceive of such a combination.',
  author: 'Wilbur Wright',
} as const

export const INITIAL_JOY_VISIBLE = 6

export type JoyGalleryLayout = 'tall' | 'wide' | 'default'

export interface JoyImage {
  id: string
  src: string
  alt: string
  objectPosition: string
  layout: JoyGalleryLayout
  /** Use contain for strip segments */
  fit?: 'cover' | 'contain'
}

export const joyOfSoaringImages: readonly JoyImage[] = [
  {
    id: 'joy-1',
    src: '/images/hero-grob-field.jpg',
    alt: 'Grob glider on the grass at FLF Gliderport',
    objectPosition: '50% 18%',
    layout: 'wide',
  },
  {
    id: 'joy-2',
    src: '/images/hero-grob-field.jpg',
    alt: 'Sailplane rigged and ready at Briggs',
    objectPosition: '72% 35%',
    layout: 'tall',
  },
  {
    id: 'joy-3',
    src: '/images/hero-grob-field.jpg',
    alt: 'Field view toward the hangar and runway',
    objectPosition: '28% 42%',
    layout: 'default',
  },
  {
    id: 'joy-4',
    src: '/images/hero-grob-field.jpg',
    alt: 'Glider wings against the Texas sky',
    objectPosition: '50% 55%',
    layout: 'default',
  },
  {
    id: 'joy-5',
    src: '/images/gallery-strip.jpg',
    alt: 'Club gliders lined up at the field',
    objectPosition: '8% center',
    layout: 'default',
    fit: 'cover',
  },
  {
    id: 'joy-6',
    src: '/images/hero-grob-field.jpg',
    alt: 'Tow line and runway at TX23',
    objectPosition: '85% 60%',
    layout: 'tall',
  },
  {
    id: 'joy-7',
    src: '/images/hero-grob-field.jpg',
    alt: 'Cockpit and canopy detail',
    objectPosition: '40% 28%',
    layout: 'default',
  },
  {
    id: 'joy-8',
    src: '/images/gallery-strip.jpg',
    alt: 'Schweizer gliders on the ramp',
    objectPosition: '35% center',
    layout: 'wide',
    fit: 'cover',
  },
  {
    id: 'joy-9',
    src: '/images/hero-grob-field.jpg',
    alt: 'Afternoon light on the flight line',
    objectPosition: '15% 65%',
    layout: 'default',
  },
  {
    id: 'joy-10',
    src: '/images/gallery-strip.jpg',
    alt: 'Pilots and gliders at Fault Line Flyers',
    objectPosition: '62% center',
    layout: 'default',
    fit: 'cover',
  },
  {
    id: 'joy-11',
    src: '/images/hero-grob-field.jpg',
    alt: 'Wide view across FLF Gliderport',
    objectPosition: 'center bottom',
    layout: 'wide',
  },
  {
    id: 'joy-12',
    src: '/images/gallery-strip.jpg',
    alt: 'More club ships on a flying day',
    objectPosition: '88% center',
    layout: 'default',
    fit: 'cover',
  },
]
