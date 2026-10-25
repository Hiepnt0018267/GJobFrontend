import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const appSource = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const recruiterLayout = readFileSync(new URL('../src/layouts/RecruiterLayout.tsx', import.meta.url), 'utf8')
const adminLayout = readFileSync(new URL('../src/layouts/AdminLayout.tsx', import.meta.url), 'utf8')
const transitionSource = readFileSync(new URL('../src/components/motion/PageTransition.tsx', import.meta.url), 'utf8')
const feedbackSource = readFileSync(new URL('../src/components/motion/WorkspaceNavigationFeedback.tsx', import.meta.url), 'utf8')
const scrollSource = readFileSync(new URL('../src/components/motion/WorkspaceScrollManager.tsx', import.meta.url), 'utf8')
const modulesSource = readFileSync(new URL('../src/config/workspaceRouteModules.ts', import.meta.url), 'utf8')
const protectedRouteSource = readFileSync(new URL('../src/routes/ProtectedRoute.tsx', import.meta.url), 'utf8')
const cssSource = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8')

test('recruiter and admin keep their workspace shell mounted during route loading', () => {
  for (const source of [recruiterLayout, adminLayout]) {
    assert.ok(source.includes('<WorkspaceNavigationFeedback />'))
    assert.ok(source.includes('<WorkspaceScrollManager />'))
    assert.ok(source.includes('<Suspense fallback={<WorkspaceRouteFallback />}>'))
    assert.equal(source.includes('setSidebarHovered(false)'), false)
  }
  assert.ok(protectedRouteSource.includes('return <WorkspaceRouteFallback />'))
})

test('workspace transition and progress never flash from transparent white', () => {
  assert.ok(transitionSource.includes("'motion-page-workspace'"))
  const workspaceKeyframes = cssSource.slice(cssSource.indexOf('@keyframes gjob-workspace-page-enter'))
  assert.ok(workspaceKeyframes.includes('opacity: 0.99'))
  assert.equal(workspaceKeyframes.split('}')[0].includes('opacity: 0;'), false)
  assert.ok(cssSource.includes('.workspace-navigation-progress.is-loading'))
  assert.ok(cssSource.includes('linear-gradient(90deg, #1c1c1c, #64748b)'))
})

test('workspace routes preload on pointer or keyboard intent', () => {
  assert.ok(feedbackSource.includes("document.addEventListener('pointerover'"))
  assert.ok(feedbackSource.includes("document.addEventListener('focusin'"))
  assert.ok(feedbackSource.includes('preloadWorkspaceRoute(destination.pathname)'))
  assert.ok(feedbackSource.includes('destination.origin === window.location.origin'))
})

test('all recruiter and admin pages are route-split', () => {
  const routes = [
    'recruiterDashboard', 'recruiterProfile', 'recruiterProfileEdit', 'recruiterJobs',
    'recruiterJobCreate', 'recruiterJobEdit', 'recruiterJobDetail', 'recruiterApplications',
    'recruiterApplicationDetail', 'recruiterPlans', 'recruiterPayment', 'recruiterSettings',
    'adminDashboard', 'adminJobs', 'adminJobDetail', 'adminUsers', 'adminUserDetail',
    'adminCVTemplates', 'adminCVTemplateCreate', 'adminCVTemplateDetail', 'adminCVTemplateEdit',
    'adminApplications', 'adminApplicationDetail', 'adminCandidateCVs', 'adminCandidateCVDetail',
    'adminSubscriptionPlans', 'adminPayments',
  ]
  for (const route of routes) {
    assert.ok(modulesSource.includes(`${route}: () => import(`), route)
    assert.ok(appSource.includes(`lazy(workspaceRouteModules.${route})`), route)
  }
})

test('workspace scrolling restores Back navigation without affecting new routes', () => {
  assert.ok(scrollSource.includes("navigationType === 'POP'"))
  assert.ok(scrollSource.includes('scrollPositions.get(location.key) ?? 0'))
  assert.ok(scrollSource.includes('scrollPositions.set(currentLocationKey, window.scrollY)'))
})
