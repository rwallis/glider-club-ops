import {
  JOY_OF_SOARING_QUOTE,
  JOY_OF_SOARING_VIDEO,
  joyGalleryLayout,
  joyOfSoaringImages,
} from '../../data/joyOfSoaring'

const layoutClass: Record<(typeof joyGalleryLayout)[number], string> = {
  tall: 'sm:row-span-2',
  wide: 'sm:col-span-2',
  default: '',
}

export function GallerySection() {
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

        <div className="mt-14 grid auto-rows-[180px] grid-cols-2 gap-3 sm:auto-rows-[200px] sm:grid-cols-4 sm:gap-4">
          {joyOfSoaringImages.map((image, index) => {
            const layout = joyGalleryLayout[index] ?? 'default'
            return (
              <figure
                key={image.id}
                className={`group relative overflow-hidden rounded-2xl bg-sky-200 shadow-lg shadow-sky-900/10 ring-1 ring-white/60 ${layoutClass[layout]}`}
              >
                <img
                  src={image.thumb}
                  srcSet={`${image.thumb} 600w, ${image.src} 1200w`}
                  sizes="(max-width: 640px) 50vw, 25vw"
                  alt={image.alt}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-sky-950/35 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
              </figure>
            )
          })}
        </div>

        <p className="mt-8 text-center text-sm text-slate-500">
          Photos and video from{' '}
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
