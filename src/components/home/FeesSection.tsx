import { site, towFees } from '../../data/siteContent'

export function FeesSection() {
  return (
    <section id="fees" className="scroll-mt-28 bg-white py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-600">Membership & fees</p>
          <h2 className="mt-3 text-4xl font-bold tracking-tight text-sky-950 sm:text-5xl">
            Transparent club pricing
          </h2>
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-3">
          <div className="rounded-3xl border border-sky-100 bg-sky-50 p-8">
            <h3 className="text-lg font-bold text-sky-950">Membership</h3>
            <ul className="mt-5 space-y-3 text-sm text-slate-600">
              <li className="flex justify-between border-b border-sky-100 pb-2">
                <span>Full membership</span>
                <span className="font-semibold text-sky-950">$600</span>
              </li>
              <li className="flex justify-between border-b border-sky-100 pb-2">
                <span>Student membership</span>
                <span className="font-semibold text-sky-950">$100</span>
              </li>
              <li className="flex justify-between border-b border-sky-100 pb-2">
                <span>Regular dues / month</span>
                <span className="font-semibold text-sky-950">$46</span>
              </li>
              <li className="flex justify-between border-b border-sky-100 pb-2">
                <span>Student dues / month</span>
                <span className="font-semibold text-sky-950">$13</span>
              </li>
              <li className="flex justify-between">
                <span>SSA membership / year</span>
                <span className="font-semibold text-sky-950">$75</span>
              </li>
            </ul>
          </div>

          <div className="rounded-3xl border border-sky-100 bg-white p-8 shadow-lg shadow-sky-900/5">
            <h3 className="text-lg font-bold text-sky-950">Aero tow by height</h3>
            <ul className="mt-5 space-y-2">
              {towFees.map((row) => (
                <li key={row.height} className="flex justify-between text-sm text-slate-600">
                  <span>{row.height}</span>
                  <span className="font-semibold text-sky-950">{row.fee}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-xs text-slate-500">
              Demo flights in 2-33 or Twin Astir: $100. Group & student discounts available on demo days.
            </p>
          </div>

          <div className="rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-8">
            <h3 className="text-lg font-bold text-sky-950">Billing</h3>
            <ul className="mt-5 space-y-3 text-sm text-slate-600">
              <li>
                <span className="font-medium text-sky-950">Zelle / Venmo:</span>{' '}
                {site.billingEmail}
              </li>
              <li>
                <span className="font-medium text-sky-950">Venmo:</span> {site.venmo}
              </li>
              <li>
                <span className="font-medium text-sky-950">Phone:</span> {site.billingPhone}
              </li>
            </ul>
            <p className="mt-6 text-xs text-slate-500">
              Instruction fees are negotiated with your instructor (~$15/hr or $5/flight).
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export function GuestPilotsSection() {
  return (
    <section className="border-y border-sky-100 bg-sky-50 py-16">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
        <h2 className="text-2xl font-bold text-sky-950">Guest pilots welcome</h2>
        <p className="mt-4 text-slate-600 leading-relaxed">
          On the basis of reciprocity, FLF welcomes visiting pilots from other SSA chapters
          bringing their own ships. Tow fees match member rates. Advance notice is required — contact{' '}
          <a href={`mailto:${site.email}`} className="font-medium text-sky-700 hover:underline">
            {site.email}
          </a>{' '}
          for requirements. Outlanding during cross-country? One member-cost tow is provided for SSA pilots of reciprocating clubs.
        </p>
      </div>
    </section>
  )
}
