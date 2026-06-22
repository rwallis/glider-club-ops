export const site = {
  name: 'Fault Line Flyers',
  tagline: 'Glider Club',
  location: 'Briggs, Texas',
  email: 'soar.flf@gmail.com',
  billingEmail: 'billing@faultlineflyers.com',
  phone: '(512) 489-0460',
  billingPhone: '(737) 341-4767',
  venmo: '@Faultline-Billing',
  mapsUrl: 'https://www.google.com/maps/dir//30.856293,-97.945853',
  airportName: 'FLF Gliderport (TX23)',
  airportAddress: '2409 County Road 210, Briggs, TX 78608',
  airportNote: '2 miles SW of Briggs · Burnet County',
  mailingAddress: 'Fault Line Flyers, P.O. Box 1428, Leander, Texas 78646-1428',
  runwayLength: '4,800',
  ssaUrl: 'https://www.ssa.org',
} as const

export const navLinks = [
  { label: 'About', href: '#about' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Fleet', href: '#fleet' },
  { label: 'Intro Flights', href: '#intro-flights' },
  { label: 'Fees', href: '#fees' },
  { label: 'Visit', href: '#visit' },
  { label: 'Contact', href: '#contact' },
] as const

export const gliders = [
  { name: 'Schweizer 2-33', count: 2, detail: 'Two-seat metal & cloth', rate: '$0.25/min' },
  { name: 'Grob Twin Astir', count: 1, detail: 'Two-seat fiberglass', rate: '$0.30/min' },
  { name: 'Schweizer 1-26', count: 2, detail: 'Single-seat (A & E models)', rate: '$0.25/min' },
  { name: 'Schweizer 1-36', count: 1, detail: 'Single-seat metal', rate: '$0.25/min' },
] as const

export const towPlanes = [
  { name: 'Pawnee 235HP', reg: 'N42VA' },
  { name: 'Cessna 152 180HP', reg: 'N48887' },
] as const

export const towFees = [
  { height: 'Minimum (rope break, etc.)', fee: '$25' },
  { height: '1,000 ft', fee: '$25' },
  { height: '2,000 ft', fee: '$35' },
  { height: '3,000 ft', fee: '$45' },
  { height: '4,000 ft', fee: '$55' },
] as const

export const board = [
  { role: 'President', name: 'Bins Ely' },
  { role: 'Vice President', name: 'Ron Wallis' },
  { role: 'Treasurer', name: 'Jon Henderson' },
  { role: 'Secretary', name: 'Luis Mailly' },
  { role: 'Chief Safety Officer', name: 'Lawrence Spinetta' },
  { role: 'Chief Tow Pilot', name: 'Doug Witkowski' },
  { role: 'Chief Duty Officer', name: 'Paul Slutes' },
  { role: 'Chief Maintenance Officer', name: 'Tom Barkow' },
] as const
