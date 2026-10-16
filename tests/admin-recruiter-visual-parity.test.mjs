import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'
import test from 'node:test'

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8')

const collectTsx = async (relativeDirectory) => {
  const directory = new URL(relativeDirectory, import.meta.url)
  const entries = await readdir(directory, { withFileTypes: true })
  const nested = await Promise.all(entries.map(async (entry) => {
    const path = new URL(entry.name + (entry.isDirectory() ? '/' : ''), directory)
    if (entry.isDirectory()) return collectTsx(path.href)
    return entry.name.endsWith('.tsx') ? [await readFile(path, 'utf8')] : []
  }))
  return nested.flat()
}

const adminLayout = await read('../src/layouts/AdminLayout.tsx')
const recruiterLayout = await read('../src/layouts/RecruiterLayout.tsx')
const adminSidebar = await read('../src/components/admin/layout/AdminSidebar.tsx')
const adminTopbar = await read('../src/components/admin/layout/AdminTopbar.tsx')
const adminDashboard = await read('../src/pages/admin/AdminDashboardPage.tsx')
const adminMetricCard = await read('../src/components/admin/MetricCard.tsx')
const adminSources = [
  ...(await collectTsx('../src/components/admin/')),
  ...(await collectTsx('../src/pages/admin/')),
].join('\n')

test('admin and recruiter share the same workspace shell geometry and typography', () => {
  for (const source of [adminLayout, recruiterLayout]) {
    assert.match(source, /\bfont-recruiter\b/)
    assert.match(source, /lg:grid-cols-\[4\.5rem_minmax\(0,1fr\)\]/)
    assert.match(source, /lg:grid-cols-\[15rem_minmax\(0,1fr\)\]/)
    assert.match(source, /min-h-screen bg-white/)
  }
  assert.match(adminLayout, /\badmin-workspace\b/)
})

test('admin navigation uses the recruiter neutral visual language', () => {
  assert.match(adminSidebar, /bg-\[#1C1C1C\]/)
  assert.match(adminSidebar, /font-\[Inter,sans-serif\]/)
  assert.match(adminTopbar, /Đường dẫn phân cấp/)
  assert.match(adminTopbar, /text-\[#1C1C1C\]/)
  assert.doesNotMatch(`${adminSidebar}\n${adminTopbar}`, /teal-|Plus_Jakarta/)
})

test('admin surfaces do not reintroduce the former teal or Plus Jakarta brand layer', () => {
  assert.doesNotMatch(adminSources, /Plus_Jakarta/)
  assert.doesNotMatch(adminSources, /(?:bg|text|border|ring|from|to|accent|decoration|shadow)-teal-/)
})

test('admin dashboard mirrors recruiter cards while retaining semantic status colors', () => {
  assert.match(adminDashboard, /max-w-7xl space-y-6 px-4 py-8/)
  assert.match(adminDashboard, /text-xl font-semibold tracking-tight text-\[#1C1C1C\]/)
  assert.match(adminDashboard, /surface="mist"[\s\S]*surface="sky"[\s\S]*surface="mist"[\s\S]*surface="sky"/)
  assert.match(adminMetricCard, /mist: 'bg-\[#E5ECF6\]'/)
  assert.match(adminMetricCard, /sky: 'bg-\[#E3F5FF\]'/)
  assert.match(adminSources, /bg-emerald-50/)
  assert.match(adminSources, /bg-amber-50/)
  assert.match(adminSources, /bg-red-50/)
})
