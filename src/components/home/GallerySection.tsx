import { useState } from 'react'
import {
  INITIAL_JOY_VISIBLE,
  JOY_OF_SOARING_QUOTE,
  JOY_OF_SOARING_VIDEO,
  joyOfSoaringImages,
  type JoyGalleryLayout,
  type JoyImage,
} from '../../data/joyOfSoaring'

const layoutClass: Record<JoyGalleryLayout, string> = {
  tall: 'sm:row-span-2',
  wide: 'sm:col-span-2',
  default: '',
}

function GalleryTile({ image }: { image: JoyImage }) {
  const fit = image.fit ?? 'cover'

  return (
    <figure
      className={`group relative overflow-hidden rounded-2xl bg-sky-200 shadow-lg shadow-sky-900/10 ring-1 ring-white/60 ${layoutClass[image.layout]}`}
    >
      <img
        src={image.src}
        alt={image.alt}
        loading="lazy"
        decoding="async"
        style={{ objectPosition: image.objectPosition }}
        className={`h-full w-full transition duration-500 group-hover:scale-105 ${
          fit === 'contain' ? 'object-contain bg-sky-900/80 p-1' : 'object-cover'
        }`}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-sky-950/35 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
    </figure>
  )
}

function GalleryGrid({ images }: { images: readonly JoyImage[] }) {
  return (
    <div className="grid auto-rows-[180px] grid-cols-2 gap-3 sm:auto-rows-[200px] sm:grid-cols-4 sm:gap-4">
      {images.map((image) => (
        <GalleryTile key={image.id} image={image} />
      ))}
    </div>
  )
}

export function GallerySection() {
  const [expanded, setExpanded] = useState(false)
  const visibleImages = joyOfSoaringImages.slice(0, INITIAL_JOY_VISIBLE)
  const extraImages = joyOfSoaringImages.slice(INITIAL_JOY_VISIBLE)
  const hasMore = extraImages.length > 0

  return (
    <section id="gallery" className="scroll-mt-28 overflow-hidden bg-gradient-to-b from-sky-50 via-white to-sky-100/80 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-600">
              Life at the field
            </p>
            <h2 className="mt-3 text-4xl font-bold tracking-tight text-sky-950 sm:text-5xl">
              The joy of soaring
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-slate-600">
              Weekends at Briggs — rigging gliders, thermaling above the Hill Country, and sharing
              the deck with fellow pilots at FLF Gliderport.
            </p>

            <blockquote className="mt-8 border-l-4 border-sky-400/70 pl-5">
              <p className="text-base italic leading-relaxed text-slate-700 sm:text-lg">
                &ldquo;{JOY_OF_SOARING_QUOTE.text}&rdquo;
              </p>
              <footer className="mt-3 text-sm font-semibold text-sky-800">
                — {JOY_OF_SOARING_QUOTE.author}
              </footer>
            </blockquote>
          </div>

          <div className="relative overflow-hidden rounded-3xl shadow-2xl shadow-sky-900/15 ring-1 ring-sky-200/80">
            <div className="aspect-video w-full bg-sky-950">
              <iframe
                src={`${JOY_OF_SOARING_VIDEO.embedUrl}?rel=0&modestbranding=1`}
                title={JOY_OF_SOARING_VIDEO.title}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            </div>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-sky-950/80 to-transparent px-5 py-4">
              <p className="text-sm font-medium text-white">{JOY_OF_SOARING_VIDEO.title}</p>
            </div>
          </div>
        </div>

        <div className="mt-14">
          <GalleryGrid images={visibleImages} />

          {hasMore && (
            <div
              className={`grid transition-[grid-template-rows] duration-500 ease-in-out ${
                expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
              }`}
            >
              <div className="overflow-hidden">
                <div className="pt-3 sm:pt-4">
                  <GalleryGrid images={extraImages} />
                </div>
              </div>
            </div>
          )}

          {hasMore && (
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={() => setExpanded((open) => !open)}
                aria-expanded={expanded}
                className="inline-flex min-h-[48px] items-center gap-2 rounded-full border border-sky-200 bg-white px-6 py-3 text-sm font-semibold text-sky-800 shadow-sm transition hover:border-sky-300 hover:bg-sky-50"
              >
                {expanded ? 'Show fewer photos' : `Show ${extraImages.length} more photos`}
                <span aria-hidden className="text-base leading-none">
                  {expanded ? '▴' : '▾'}
                </span>
              </button>
            </div>
          )}
        </div>

        <p className="mt-8 text-center text-sm text-slate-500">
          Photos from FLF Gliderport and{' '}
          <a
            href="https://www.faultlineflyers.com/the-joy-of-soaring"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-sky-700 underline decoration-sky-300 underline-offset-2 hover:text-sky-900"
          >
            faultlineflyers.com
          </a>
        </p>
      </div>
    </section>
  )
}
