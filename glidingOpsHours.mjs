/**
 * Server-side GlidingOps All Flights Report → hours since last annual.
 * Credentials from process env / repo .env (GLIDINGOPS_USER, GLIDINGOPS_PASSWORD).
 */

import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DEFAULT_BASE = 'https://glidingops.faultlineflyers.com'

export const CODE_TO_TAIL = {
  G5S: 'N1185S',
  G85: 'N1185S',
  G9W: 'N2479W',
  G0S: 'N7757S',
  G9S: 'N11139S',
  GYP: 'N136YP',
  GSS: 'N160SS',
}

const ROW_PAT =
  /^(\d{2}\/\d{2}\/\d{4})\t(\d+)\tFLF\t([^\t]*)\t([^\t]*)\t([^\t]*)\t([^\t]*)\t([^\t]*)\t([^\t]*)\t([^\t]*)\t([^\t]*)\t(\d{2}:\d{2})\t([^\t]*)\t([^\t]*)\t?(.*)$/gm

const HTML_ROW_HINT =
  /<tr[^>]*>\s*<td[^>]*>\s*(\d{2}\/\d{2}\/\d{4})\s*<\/td>([\s\S]*?)<\/tr>/gi
const DURATION_PAT = /^(\d{2}:\d{2})$/
const GLIDER_CODE_PAT = /\b(G[A-Z0-9]{2,3})\b/gi

function loadDotEnv() {
  const path = join(__dirname, '.env')
  if (!existsSync(path)) return
  for (const raw of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const line = raw.trim()
    if (!line || line.startsWith('#') || !line.includes('=')) continue
    const i = line.indexOf('=')
    const key = line.slice(0, i).trim()
    const val = line.slice(i + 1).trim().replace(/^['"]|['"]$/g, '')
    if (!(key in process.env)) process.env[key] = val
  }
}

loadDotEnv()

function isoDate(d) {
  return d.toISOString().slice(0, 10)
}

function formatUsDate(d) {
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${mm}/${dd}/${d.getFullYear()}`
}

function parseTableDate(s) {
  // DD/MM/YYYY
  const [dd, mm, yyyy] = s.trim().split('/').map(Number)
  return new Date(yyyy, mm - 1, dd)
}

function parseDuration(dur) {
  const [h, m] = dur.split(':').map(Number)
  return h * 60 + m
}

/** dueMmYy "10/26" → approx last annual = first of that month, prior year */
export function lastAnnualDateFromDue(dueMmYy) {
  if (!dueMmYy) return null
  const m = String(dueMmYy).trim().match(/^(\d{1,2})\/(\d{2})$/)
  if (!m) return null
  const month = Number(m[1])
  const yy = Number(m[2])
  const dueYear = 2000 + yy
  return new Date(dueYear - 1, month - 1, 1)
}

/** lastAnnual "05/25" or ISO "2025-05-01" */
export function parseLastAnnual(value) {
  if (!value) return null
  const s = String(value).trim()
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (iso) return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]))
  const mmyy = s.match(/^(\d{1,2})\/(\d{2})$/)
  if (mmyy) return new Date(2000 + Number(mmyy[2]), Number(mmyy[1]) - 1, 1)
  return null
}

function extractCsrf(html) {
  const a = html.match(/name=["']csrf_token["'][^>]*value=["']([^"']+)["']/i)
  if (a) return a[1]
  const b = html.match(/value=["']([^"']+)["'][^>]*name=["']csrf_token["']/i)
  if (b) return b[1]
  const c = html.match(/data-csrf=["']([^"']+)["']/i)
  if (c) return c[1]
  return null
}

function parseForms(html) {
  const forms = []
  const formRe = /<form\b([^>]*)>([\s\S]*?)<\/form>/gi
  let fm
  while ((fm = formRe.exec(html))) {
    const attrs = fm[1]
    const body = fm[2]
    const action = (attrs.match(/\baction=["']([^"']*)["']/i) || [])[1] || ''
    const method = ((attrs.match(/\bmethod=["']([^"']*)["']/i) || [])[1] || 'GET').toUpperCase()
    const fields = {}
    const dateFields = new Set()
    const submits = {}

    const inputRe = /<input\b([^>]*)\/?>/gi
    let im
    while ((im = inputRe.exec(body))) {
      const ia = im[1]
      const name = (ia.match(/\bname=["']([^"']*)["']/i) || [])[1]
      if (!name) continue
      const type = ((ia.match(/\btype=["']([^"']*)["']/i) || [])[1] || 'text').toLowerCase()
      const value = (ia.match(/\bvalue=["']([^"']*)["']/i) || [])[1] ?? ''
      if (type === 'submit' || type === 'button' || type === 'image') {
        submits[name] = value || '1'
        continue
      }
      if (type === 'checkbox' && !/\bchecked\b/i.test(ia)) continue
      if (type === 'radio' && !/\bchecked\b/i.test(ia)) continue
      fields[name] = value
      if (type === 'date') dateFields.add(name)
    }

    const buttonRe = /<button\b([^>]*)>([\s\S]*?)<\/button>/gi
    let bm
    while ((bm = buttonRe.exec(body))) {
      const ba = bm[1]
      const name = (ba.match(/\bname=["']([^"']*)["']/i) || [])[1]
      if (!name) continue
      const type = ((ba.match(/\btype=["']([^"']*)["']/i) || [])[1] || 'submit').toLowerCase()
      if (type !== 'submit') continue
      const valueAttr = (ba.match(/\bvalue=["']([^"']*)["']/i) || [])[1]
      const text = bm[2].replace(/<[^>]+>/g, '').trim()
      submits[name] = valueAttr || text || '1'
    }

    forms.push({ action, method, fields, dateFields, submits })
  }
  return forms
}

function pickReportForm(forms) {
  let best = null
  let bestScore = -1
  for (const form of forms) {
    const keys = Object.keys(form.fields).map((k) => k.toLowerCase()).join(' ')
    let score = 0
    if (/from|start|begin/.test(keys)) score += 2
    if (/to|end|until/.test(keys)) score += 2
    if (/date/.test(keys)) score += 1
    if (score > bestScore) {
      bestScore = score
      best = form
    }
  }
  return bestScore > 0 ? best : forms[0] || null
}

function isTokenField(lk) {
  return lk.includes('csrf') || lk === '_token' || lk === 'token' || lk.endsWith('_token')
}

function isFromDateField(lk) {
  return (
    (lk.includes('from') || lk.includes('start') || lk.includes('begin')) &&
    !lk.includes('until') &&
    lk !== 'todate' &&
    !lk.startsWith('to')
  )
}

function isToDateField(lk) {
  return (
    lk === 'todate' ||
    lk === 'to' ||
    lk === 'enddate' ||
    lk === 'end' ||
    lk.startsWith('to_') ||
    lk.startsWith('todate') ||
    (lk.includes('until') && lk.includes('date')) ||
    (lk.includes('end') && lk.includes('date'))
  )
}

function setDateFields(fields, dateFields, start, end) {
  let matchedFrom = false
  let matchedTo = false
  for (const key of Object.keys(fields)) {
    const lk = key.toLowerCase()
    if (isTokenField(lk)) continue
    const useIso = dateFields.has(key) || lk.endsWith('date')
    const startS = useIso ? isoDate(start) : formatUsDate(start)
    const endS = useIso ? isoDate(end) : formatUsDate(end)
    if (isFromDateField(lk)) {
      fields[key] = startS
      matchedFrom = true
    } else if (isToDateField(lk)) {
      fields[key] = endS
      matchedTo = true
    }
  }
  if (!matchedFrom) fields.fromdate = isoDate(start)
  if (!matchedTo) fields.todate = isoDate(end)
}

class CookieJar {
  constructor() {
    this.map = new Map()
  }

  store(response, url) {
    const raw = response.headers.getSetCookie?.() ?? []
    const fallback = response.headers.get('set-cookie')
    const list = raw.length ? raw : fallback ? [fallback] : []
    const host = new URL(url).hostname
    for (const line of list) {
      const [pair] = line.split(';')
      const eq = pair.indexOf('=')
      if (eq < 0) continue
      const name = pair.slice(0, eq).trim()
      const value = pair.slice(eq + 1).trim()
      this.map.set(`${host}:${name}`, { name, value })
    }
  }

  header(url) {
    const host = new URL(url).hostname
    const parts = []
    for (const [key, cookie] of this.map) {
      if (key.startsWith(`${host}:`)) parts.push(`${cookie.name}=${cookie.value}`)
    }
    return parts.join('; ')
  }
}

async function request(jar, url, { method = 'GET', body, headers = {} } = {}) {
  const cookie = jar.header(url)
  const res = await fetch(url, {
    method,
    redirect: 'manual',
    headers: {
      'User-Agent': 'FLF-AircraftBoard/1.0 (+hours sync)',
      Accept: 'text/html,application/xhtml+xml',
      ...(cookie ? { Cookie: cookie } : {}),
      ...headers,
    },
    body,
    signal: AbortSignal.timeout(120000),
  })
  jar.store(res, url)

  // Follow redirects manually to keep cookies
  if ([301, 302, 303, 307, 308].includes(res.status)) {
    const loc = res.headers.get('location')
    if (!loc) return res
    const nextUrl = new URL(loc, url).toString()
    const nextMethod = res.status === 303 ? 'GET' : method
    return request(jar, nextUrl, {
      method: nextMethod,
      body: nextMethod === 'GET' ? undefined : body,
      headers: nextMethod === 'GET' ? { Accept: headers.Accept } : headers,
    })
  }
  return res
}

function cleanName(s) {
  return String(s || '')
    .replace(/\s+/g, ' ')
    .replace(/&amp;/gi, '&')
    .trim()
}

function isGliderFlight(code, mins) {
  if (!code || code === 'G00') return false
  if (!/^G[A-Z0-9]{2,3}$/i.test(code)) return false
  return mins > 0
}

function extractFlightRows(html) {
  const rows = []
  const text = html.replace(/\r\n/g, '\n')
  let m
  ROW_PAT.lastIndex = 0
  while ((m = ROW_PAT.exec(text))) {
    const glider = m[5].trim().toUpperCase()
    if (!glider) continue
    rows.push({
      date: parseTableDate(m[1]),
      code: glider,
      mins: parseDuration(m[11]),
      launchType: cleanName(m[3]),
      towPilot: cleanName(m[6]),
      pic: cleanName(m[7]),
      p2: cleanName(m[8]),
    })
  }
  if (rows.length) return rows

  HTML_ROW_HINT.lastIndex = 0
  while ((m = HTML_ROW_HINT.exec(html))) {
    const dateS = m[1]
    const body = m[2]
    const cells = [...body.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((c) =>
      cleanName(c[1].replace(/<[^>]+>/g, ' ')),
    )
    let glider = (cells[4] || '').toUpperCase()
    if (!glider) {
      const codes = body.match(GLIDER_CODE_PAT) || []
      glider = codes[0]?.toUpperCase() || ''
    }
    const durs = cells.filter((c) => DURATION_PAT.test(c))
    if (!glider || !durs.length) continue
    rows.push({
      date: parseTableDate(dateS),
      code: glider,
      mins: parseDuration(durs[durs.length - 1]),
      launchType: cells[2] || '',
      towPilot: cells[5] || '',
      pic: cells[6] || '',
      p2: cells[7] || '',
    })
  }
  return rows
}

/** Collapse "Wilson Delenor" / "Delenor Wilson" to one identity. */
function nameKey(name) {
  const cleaned = cleanName(name)
  if (!cleaned) return ''
  return cleaned
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .sort()
    .join(' ')
}

function bumpNamed(counts, displays, name, by = 1) {
  const key = nameKey(name)
  if (!key) return
  counts.set(key, (counts.get(key) || 0) + by)
  if (!displays.has(key)) displays.set(key, new Map())
  const forms = displays.get(key)
  const label = cleanName(name)
  forms.set(label, (forms.get(label) || 0) + by)
}

function preferredDisplay(forms) {
  let best = ''
  let bestN = -1
  for (const [label, n] of forms) {
    if (n > bestN || (n === bestN && label.localeCompare(best) < 0)) {
      best = label
      bestN = n
    }
  }
  return best
}

function rankedNamed(counts, displays) {
  return [...counts.entries()]
    .map(([key, count]) => ({
      name: preferredDisplay(displays.get(key) || new Map([[key, 1]])),
      count,
    }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
}

function buildOpsStats(rows, { from, to, asOf }) {
  const currentYear = to.getFullYear()
  const yearStart = currentYear - 4
  const years = []
  for (let y = yearStart; y <= currentYear; y++) years.push(y)

  const flightCounts = new Map()
  const flightDisplays = new Map()
  const towCounts = new Map()
  const towDisplays = new Map()
  /** @type {Map<number, number>} */
  const minsByYear = new Map(years.map((y) => [y, 0]))

  for (const row of rows) {
    const year = row.date.getFullYear()
    if (year < yearStart || year > currentYear) continue

    if (isGliderFlight(row.code, row.mins) && minsByYear.has(year)) {
      minsByYear.set(year, minsByYear.get(year) + row.mins)
    }

    if (year !== currentYear) continue

    if (isGliderFlight(row.code, row.mins)) {
      bumpNamed(flightCounts, flightDisplays, row.pic)
      if (row.p2 && nameKey(row.p2) !== nameKey(row.pic)) {
        bumpNamed(flightCounts, flightDisplays, row.p2)
      }
    }

    if (/tow/i.test(row.launchType) && row.towPilot) {
      bumpNamed(towCounts, towDisplays, row.towPilot)
    }
  }

  const hoursByYear = years.map((year) => ({
    year,
    hours: Math.round((minsByYear.get(year) / 60) * 10) / 10,
  }))

  return {
    asOf,
    from: isoDate(from),
    to: isoDate(to),
    source: `All Flights Report ${formatUsDate(from)}–${formatUsDate(to)}`,
    flightRows: rows.length,
    currentYear,
    flightsByMember: rankedNamed(flightCounts, flightDisplays),
    towsByPilot: rankedNamed(towCounts, towDisplays),
    hoursByYear,
  }
}

let statsCache = /** @type {{ at: number, payload: object } | null} */ (null)
const STATS_CACHE_MS = 15 * 60 * 1000

/**
 * Club presentation stats from All Flights Report (5 calendar years).
 * @param {{ force?: boolean }} [options]
 */
export async function fetchOpsStats(options = {}) {
  if (!options.force && statsCache && Date.now() - statsCache.at < STATS_CACHE_MS) {
    return { ...statsCache.payload, cached: true }
  }

  const user = (process.env.GLIDINGOPS_USER || '').trim()
  const password = (process.env.GLIDINGOPS_PASSWORD || '').trim()
  if (!user || !password) {
    throw new Error(
      'Missing GLIDINGOPS_USER / GLIDINGOPS_PASSWORD in server environment (.env)',
    )
  }

  const base = (process.env.GLIDINGOPS_BASE_URL || DEFAULT_BASE).replace(/\/$/, '')
  const end = new Date()
  end.setHours(12, 0, 0, 0)
  const start = new Date(end.getFullYear() - 4, 0, 1, 12, 0, 0, 0)

  const jar = new CookieJar()
  await login(jar, base, user, password)
  const html = await fetchReportHtml(jar, base, start, end)
  const rows = extractFlightRows(html)
  if (!rows.length) {
    throw new Error('No flight rows parsed from All Flights Report')
  }

  const payload = buildOpsStats(rows, { from: start, to: end, asOf: isoDate(end) })
  statsCache = { at: Date.now(), payload }
  return { ...payload, cached: false }
}

async function login(jar, base, user, password) {
  const loginUrl = `${base}/Login.php`
  const page = await request(jar, loginUrl)
  const html = await page.text()
  const csrf = extractCsrf(html)
  if (!csrf) throw new Error('Could not find csrf_token on Login.php')

  const body = new URLSearchParams({
    csrf_token: csrf,
    user,
    pcode: password,
  })
  const res = await request(jar, `${base}/checklogin.php`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Origin: base,
      Referer: loginUrl,
    },
    body,
  })
  const landHtml = await res.text()
  if (
    landHtml.includes('name="pcode"') &&
    landHtml.includes('name="user"') &&
    landHtml.includes('Please enter your login')
  ) {
    throw new Error('GlidingOps login failed — check GLIDINGOPS_USER / GLIDINGOPS_PASSWORD')
  }
}

async function fetchReportHtml(jar, base, start, end) {
  const reportUrl = `${base}/app/allFlightsReport`
  const page = await request(jar, reportUrl)
  let html = await page.text()
  if (html.includes('name="pcode"') || page.url?.includes?.('Login.php')) {
    throw new Error('Session not authenticated for allFlightsReport')
  }

  const forms = parseForms(html)
  const form = pickReportForm(forms)
  if (!form) {
    throw new Error('Could not find All Flights Report form')
  }

  const fields = { ...form.fields }
  setDateFields(fields, form.dateFields, start, end)
  if (form.submits.view != null) fields.view = form.submits.view
  else if (Object.keys(form.submits).length) {
    const [name, value] = Object.entries(form.submits)[0]
    fields[name] = value
  } else {
    fields.view = 'View Report'
  }

  const action = new URL(form.action || reportUrl, reportUrl).toString()
  const res = await request(jar, action, {
    method: form.method === 'GET' ? 'GET' : 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Origin: base,
      Referer: reportUrl,
    },
    body: new URLSearchParams(fields),
  })
  html = await res.text()
  return html
}

function sumHours(rows, fleetSpecs) {
  /** @type {Record<string, { mins: number, n: number }>} */
  const byTail = {}
  for (const spec of fleetSpecs) {
    byTail[spec.tail] = { mins: 0, n: 0 }
  }

  const mappedTails = new Set(Object.values(CODE_TO_TAIL))

  for (const row of rows) {
    const tail = CODE_TO_TAIL[row.code]
    if (!tail || !byTail[tail]) continue
    const spec = fleetSpecs.find((s) => s.tail === tail)
    const since = spec?.lastAnnualDate ?? null
    if (since && row.date < since) continue
    byTail[tail].mins += row.mins
    byTail[tail].n += 1
  }

  /** @type {Record<string, number | null>} */
  const hoursByTail = {}
  for (const spec of fleetSpecs) {
    if (spec.category === 'tow' || !mappedTails.has(spec.tail) || !spec.lastAnnualDate) {
      hoursByTail[spec.tail] = null
      continue
    }
    hoursByTail[spec.tail] = Math.round((byTail[spec.tail].mins / 60) * 10) / 10
  }
  return hoursByTail
}

/**
 * @param {object} [options]
 * @param {Array<{ tail: string, category?: string, dueMmYy?: string | null, lastAnnual?: string | null }>} [options.fleet]
 */
export async function fetchHoursSinceAnnual(options = {}) {
  const user = (process.env.GLIDINGOPS_USER || '').trim()
  const password = (process.env.GLIDINGOPS_PASSWORD || '').trim()
  if (!user || !password) {
    throw new Error(
      'Missing GLIDINGOPS_USER / GLIDINGOPS_PASSWORD in server environment (.env)',
    )
  }

  const base = (process.env.GLIDINGOPS_BASE_URL || DEFAULT_BASE).replace(/\/$/, '')
  const end = new Date()
  end.setHours(12, 0, 0, 0)
  const start = new Date(end)
  start.setFullYear(start.getFullYear() - 1)

  const defaultFleet = [
    { tail: 'N1185S', category: 'glider', dueMmYy: '10/26' },
    { tail: 'N7757S', category: 'glider', dueMmYy: '05/27' },
    { tail: 'N2479W', category: 'glider', dueMmYy: '12/26' },
    { tail: 'N11139S', category: 'glider', dueMmYy: '05/27' },
    { tail: 'N27037', category: 'glider', dueMmYy: null },
    { tail: 'N136YP', category: 'glider', dueMmYy: '05/27' },
    { tail: 'N160SS', category: 'glider', dueMmYy: '01/27' },
    { tail: 'N42VA', category: 'tow', dueMmYy: '05/26' },
    { tail: 'N48887', category: 'tow', dueMmYy: '10/26' },
  ]

  const incoming = Array.isArray(options.fleet) && options.fleet.length ? options.fleet : defaultFleet
  const fleetSpecs = incoming.map((a) => {
    const lastAnnualDate =
      parseLastAnnual(a.lastAnnual) || lastAnnualDateFromDue(a.dueMmYy) || null
    return {
      tail: a.tail,
      category: a.category || 'glider',
      dueMmYy: a.dueMmYy ?? null,
      lastAnnualDate,
    }
  })

  const jar = new CookieJar()
  await login(jar, base, user, password)
  const html = await fetchReportHtml(jar, base, start, end)
  const rows = extractFlightRows(html)
  if (!rows.length) {
    throw new Error('No flight rows parsed from All Flights Report')
  }

  const hoursByTail = sumHours(rows, fleetSpecs)
  return {
    asOf: isoDate(end),
    from: isoDate(start),
    to: isoDate(end),
    source: `All Flights Report ${formatUsDate(start)}–${formatUsDate(end)}`,
    flightRows: rows.length,
    hoursByTail,
  }
}
