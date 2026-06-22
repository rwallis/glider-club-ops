import { SiteHeader } from '../components/layout/SiteHeader'
import { SiteFooter } from '../components/layout/SiteFooter'
import { Hero, AboutSection } from '../components/home/Hero'
import { GallerySection } from '../components/home/GallerySection'
import { FleetSection } from '../components/home/FleetSection'
import { IntroFlightsSection } from '../components/home/IntroFlightsSection'
import { FeesSection, GuestPilotsSection } from '../components/home/FeesSection'
import { ContactSection } from '../components/home/ContactSection'

export function HomePage() {
  return (
    <div className="public-site min-h-screen">
      <SiteHeader />
      <main>
        <Hero />
        <AboutSection />
        <GallerySection />
        <FleetSection />
        <IntroFlightsSection />
        <FeesSection />
        <GuestPilotsSection />
        <ContactSection />
      </main>
      <SiteFooter />
    </div>
  )
}
