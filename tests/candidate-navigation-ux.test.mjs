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
const headerSource = readFileSync(new URL('../src/components/layout/Header.tsx', import.meta.url), 'utf8')
const navigationSource = readFileSync(new URL('../src/config/candidateNavigation.ts', import.meta.url), 'utf8')
const templateLibrarySource = readFileSync(new URL('../src/pages/candidate/CandidateCVTemplatesPage.tsx', import.meta.url), 'utf8')
const cvLibrarySource = readFileSync(new URL('../src/pages/candidate/CandidateCVsPage.tsx', import.meta.url), 'utf8')

test('candidate layout keeps its shell mounted and owns navigation feedback', () => {
  assert.ok(layoutSource.includes('<CandidateNavigationFeedback />'))
  assert.ok(layoutSource.includes('<CandidateScrollManager />'))
  assert.ok(layoutSource.includes('<PageTransition variant="candidate"'))
  assert.ok(layoutSource.includes('<Suspense fallback={<CandidateRouteFallback />}>'))
  assert.ok(appSource.includes('<ProtectedRoute loadingVariant="candidate" />'))
  assert.ok(protectedRouteSource.includes("loadingVariant === 'candidate'"))
})

test('CV create and edit keep the candidate top bar while the editor owns the remaining viewport', () => {
  assert.match(appSource, /path="\/candidate\/cvs\/create"/)
  assert.match(appSource, /path="\/candidate\/cvs\/:id\/edit"/)
  assert.match(layoutSource, /<Header \/>/)
  assert.match(layoutSource, /const isCVEditor =/)
  assert.match(layoutSource, /isCVEditor \? 'h-full' : ''/)
  assert.match(layoutSource, /!isCVEditor && <Footer \/>/)
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

test('candidate Create CV opens an accessible mega menu backed by real filters and actions', () => {
  assert.match(headerSource, /candidate-cv-mega-menu/)
  assert.match(headerSource, /Mẫu CV theo phong cách/)
  assert.match(headerSource, /Mẫu CV theo vị trí ứng tuyển/)
  assert.match(headerSource, /aria-label="Tạo và quản lý CV"/)
  assert.match(headerSource, /function useDropdownAnchor\(\)/)
  assert.match(headerSource, /bounds\.left \+ bounds\.width \/ 2/)
  assert.match(headerSource, /data-candidate-menu-origin/)
  assert.match(headerSource, /preferredLeft = primaryTrigger\?\.getBoundingClientRect\(\)\.left/)
  assert.match(headerSource, /style=\{\{ left: panelLeft \}\}/)
  assert.match(headerSource, /fixed top-16.*w-\[min\(/)
  assert.match(headerSource, /style=\{\{ left: anchorX \}\}/)
  assert.match(headerSource, /fixed top-\[4\.25rem\].*rotate-45.*border-l.*border-t/)
  assert.match(headerSource, /function useDropdownInteraction\(/)
  assert.match(headerSource, /closeTimerRef\.current = setTimeout\(onClose, 220\)/)
  assert.match(headerSource, /onMouseEnter=\{openOnHover\} onMouseLeave=\{closeWithGrace\}/)
  assert.match(headerSource, /id="user-menu-button"[\s\S]*?style=\{\{ left: anchorX \}\}[\s\S]*?id="candidate-account-menu"/)
  assert.match(headerSource, /current === 'notifications' \? null : current/)
  assert.match(headerSource, /current === 'account' \? null : current/)
  assert.match(headerSource, /space-y-4 p-4/)
  for (const style of ['SIMPLE', 'IMPRESSIVE', 'PROFESSIONAL']) {
    assert.match(navigationSource, new RegExp(`\\?style=${style}`))
  }
  for (const position of ['SALES_EXECUTIVE', 'BACKEND_DEVELOPER', 'ACCOUNTANT', 'DIGITAL_MARKETING']) {
    assert.match(navigationSource, new RegExp(`job_position=${position}`))
  }
  assert.match(navigationSource, /\/candidate\/cvs\?upload=1/)
  assert.match(templateLibrarySource, /filtersFromSearchParams/)
  assert.match(cvLibrarySource, /searchParams\.get\('upload'\) === '1'/)
})

test('candidate jobs menu exposes taxonomy-backed position and industry filters without a company section', () => {
  assert.match(headerSource, /candidate-jobs-mega-menu/)
  assert.match(headerSource, /aria-label="Khám phá việc làm"/)
  assert.match(headerSource, /Việc làm theo vị trí/)
  assert.match(headerSource, /Việc làm theo ngành nghề/)
  assert.match(headerSource, /jobTaxonomyService[\s\S]*?\.getActive/)
  assert.match(headerSource, /\/jobs\?job_position=/)
  assert.match(headerSource, /\/jobs\?industry_group=/)
  assert.match(headerSource, /group-hover:translate-x-0 group-hover:opacity-100/)
  assert.match(headerSource, /group-focus-visible:translate-x-0 group-focus-visible:opacity-100/)
  assert.ok((headerSource.match(/data-menu-hover-arrow/g) ?? []).length >= 5)
  assert.match(headerSource, /w-\[min\(1000px,calc\(100vw-2rem\)\)\]/)
  assert.match(headerSource, /w-\[min\(680px,calc\(100vw-2rem\)\)\]/)
  assert.match(headerSource, /w-\[min\(28rem,calc\(100vw-2rem\)\)\]/)
  assert.doesNotMatch(headerSource, />\s*Công ty\s*</)
})
