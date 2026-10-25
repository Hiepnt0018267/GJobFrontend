import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const appSource = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const layoutSource = readFileSync(new URL('../src/layouts/MainLayout.tsx', import.meta.url), 'utf8')
const transitionSource = readFileSync(new URL('../src/components/motion/PageTransition.tsx', import.meta.url), 'utf8')
const feedbackSource = readFileSync(new URL('../src/components/motion/CandidateNavigationFeedback.tsx', import.meta.url), 'utf8')
const scrollSource = readFileSync(new URL('../src/components/motion/CandidateScrollManager.tsx', import.meta.url), 'utf8')
const modulesSource = readFileSync(new URL('../src/config/candidateRouteModules.ts', import.meta.url), 'utf8')
const protectedRouteSource = readFileSync(new URL('../src/routes/ProtectedRoute.tsx', import.meta.url), 'utf8')
const cssSource = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8')

test('candidate layout keeps its shell mounted and owns navigation feedback', () => {
  assert.ok(layoutSource.includes('<CandidateNavigationFeedback />'))
  assert.ok(layoutSource.includes('<CandidateScrollManager />'))
  assert.ok(layoutSource.includes('<PageTransition variant="candidate">'))
  assert.ok(layoutSource.includes('<Suspense fallback={<CandidateRouteFallback />}>'))
  assert.ok(appSource.includes('<ProtectedRoute loadingVariant="candidate" />'))
  assert.ok(protectedRouteSource.includes("loadingVariant === 'candidate'"))
})

test('candidate page motion never starts fully transparent', () => {
  assert.ok(transitionSource.includes("variant?: 'workspace' | 'candidate'"))
  assert.ok(transitionSource.includes("'motion-page-candidate'"))
  const candidateKeyframes = cssSource.slice(cssSource.indexOf('@keyframes gjob-candidate-page-enter'))
  assert.ok(candidateKeyframes.includes('opacity: 0.985'))
  assert.equal(candidateKeyframes.split('}')[0].includes('opacity: 0;'), false)
})

test('candidate navigation preloads intent and reports real internal navigation', () => {
  assert.ok(feedbackSource.includes("document.addEventListener('pointerover'"))
  assert.ok(feedbackSource.includes("document.addEventListener('focusin'"))
  assert.ok(feedbackSource.includes("document.addEventListener('click'"))
  assert.ok(feedbackSource.includes('preloadCandidateRoute(destination.pathname)'))
  assert.ok(feedbackSource.includes('destination.origin === window.location.origin'))
  assert.ok(cssSource.includes('.candidate-navigation-progress.is-loading'))
  assert.ok(cssSource.includes('.candidate-navigation-progress.is-complete'))
})

test('all public and authenticated candidate pages are route-split', () => {
  for (const route of ['home', 'jobs', 'jobDetail', 'profile', 'profileEdit', 'cvs', 'cvTemplates', 'cvCreate', 'cvDetail', 'cvEdit', 'applications', 'applicationDetail', 'savedJobs', 'recommendations', 'settings']) {
    assert.ok(modulesSource.includes(`${route}: () => import(`), route)
    assert.ok(appSource.includes(`lazy(candidateRouteModules.${route})`), route)
  }
})

test('candidate scrolling starts new routes at the top and restores browser history', () => {
  assert.ok(scrollSource.includes("navigationType === 'POP'"))
  assert.ok(scrollSource.includes('scrollPositions.get(location.key) ?? 0'))
  assert.ok(scrollSource.includes('scrollPositions.set(currentLocationKey, window.scrollY)'))
  assert.ok(scrollSource.includes('location.hash'))
})
