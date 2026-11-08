import test from 'node:test'
import assert from 'node:assert/strict'
import React from 'react'
import { createServer } from 'vite'

let viteServer
let getJobTaxonomyDisplay
let adminJobTaxonomyService

test.before(async () => {
  viteServer = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
  })

  const jobDisplayModule = await viteServer.ssrLoadModule('/src/utils/jobDisplay.ts')
  getJobTaxonomyDisplay = jobDisplayModule.getJobTaxonomyDisplay

  const serviceModule = await viteServer.ssrLoadModule('/src/services/adminJobTaxonomyService.ts')
  adminJobTaxonomyService = serviceModule.adminJobTaxonomyService
})

test.after(async () => {
  if (viteServer) {
    await viteServer.close()
  }
})

test('1. getJobTaxonomyDisplay: prefers new taxonomy when available', () => {
  const job = {
    industry: 'INFORMATION_TECHNOLOGY',
    industry_group_taxonomy: {
      id: 'ind-1',
      code: 'IT_SOFTWARE',
      display_name: 'Công nghệ thông tin',
      is_active: true,
    },
    job_position_taxonomy: {
      id: 'pos-1',
      code: 'BACKEND_DEV',
      display_name: 'Lập trình viên Backend',
      is_active: true,
    },
  }

  const result = getJobTaxonomyDisplay(job)
  assert.equal(result.positionName, 'Lập trình viên Backend')
  assert.equal(result.industryName, 'Công nghệ thông tin')
  assert.equal(result.primaryName, 'Lập trình viên Backend · Công nghệ thông tin')
  assert.equal(result.isInactive, false)
  assert.equal(result.hasNewTaxonomy, true)
})

test('2. getJobTaxonomyDisplay: falls back to legacy industry when taxonomy is unmapped', () => {
  const unmappedJob = {
    industry: 'SALES',
    industry_group_taxonomy: null,
    job_position_taxonomy: null,
  }

  const result = getJobTaxonomyDisplay(unmappedJob)
  assert.equal(result.positionName, null)
  assert.equal(result.industryName, null)
  assert.equal(result.primaryName, 'Kinh doanh – Bán hàng')
  assert.equal(result.isInactive, false)
  assert.equal(result.hasNewTaxonomy, false)
})

test('3. getJobTaxonomyDisplay: flags isInactive when referencing inactive taxonomy item', () => {
  const inactiveJob = {
    industry: 'INFORMATION_TECHNOLOGY',
    industry_group_taxonomy: {
      id: 'ind-1',
      code: 'IT_SOFTWARE',
      display_name: 'Công nghệ thông tin',
      is_active: true,
    },
    job_position_taxonomy: {
      id: 'pos-archived',
      code: 'LEGACY_ROLE',
      display_name: 'Vị trí lưu trữ',
      is_active: false,
    },
  }

  const result = getJobTaxonomyDisplay(inactiveJob)
  assert.equal(result.primaryName, 'Vị trí lưu trữ · Công nghệ thông tin')
  assert.equal(result.isInactive, true)
  assert.equal(result.hasNewTaxonomy, true)
})

test('4. adminJobTaxonomyService exposes getStats method', () => {
  assert.equal(typeof adminJobTaxonomyService.getStats, 'function')
})

