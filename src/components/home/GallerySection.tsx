import { images } from '../../data/images'

export function GallerySection() {
  return (
    <section id="gallery" className="scroll-mt-28 overflow-hidden bg-sky-50 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-600">Life at the field</p>
          <h2 className="mt-3 text-4xl font-bold tracking-tight text-sky-950 sm:text-5xl">
            Silent flight, wide skies
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Weekends at Briggs — rigging gliders, thermaling above the Hill Country, and sharing
            the deck with fellow pilots.
          </p>
        </div>

        <div className="mt-10 overflow-hidden rounded-3xl shadow-2xl shadow-sky-900/10 ring-1 ring-sky-200/80">
          <img
            src={images.gallery}
            alt="Collage of Fault Line Flyers gliders, cockpits, field views, and pilots at Briggs Texas"
            className="w-full object-cover"
          />
        </div>
      </div>
    </section>
  )
}
