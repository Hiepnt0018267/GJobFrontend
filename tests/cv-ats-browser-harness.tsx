import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import CVTemplateRenderer from '../src/components/cv/CVTemplateRenderer'
import type { CVCreateRequest, CVPresentationLocale, CVTemplateLayoutKey } from '../src/types/cv'
import '../src/index.css'

const params = new URLSearchParams(window.location.search)
const layout = (params.get('layout') || 'SIMPLE_SINGLE_COLUMN') as CVTemplateLayoutKey
const locale = (params.get('locale') === 'en' ? 'en' : 'vi') as CVPresentationLocale
const useLong = params.get('fixture') === 'long'
const printMode = params.get('mode') === 'print'

const normalFixture = (): CVCreateRequest => ({
  title: 'ATS_ROLE_TITLE', template_id: 'ats-browser-template',
  personal_info: { full_name: 'ATS_NAME_ALPHA', email: 'ats.alpha@example.test', phone: '0900-ATS-ALPHA', address: 'ATS_LOCATION_ALPHA', avatar_url: null },
  career_objective: 'ATS_OBJECTIVE_ALPHA — Kinh nghiệm Kỹ năng Ngôn ngữ Chứng chỉ',
  experiences: [{ company_name: 'ATS_EXP_COMPANY_ALPHA', position: 'ATS_EXP_ROLE_ALPHA', start_date: '2022-01', end_date: null, is_current: true, description: 'ATS_EXP_DESCRIPTION_ALPHA' }],
  educations: [{ school_name: 'ATS_EDU_SCHOOL_ALPHA', degree: 'ATS_EDU_DEGREE_ALPHA', field_of_study: 'ATS_EDU_MAJOR_ALPHA', start_date: '2018', end_date: '2022', is_current: false, description: 'ATS_EDU_DESCRIPTION_ALPHA' }],
  skills: [{ name: 'ATS_SKILL_ALPHA', level: 'EXPERT' }],
  projects: [{ name: 'ATS_PROJECT_ALPHA', role: 'ATS_PROJECT_ROLE_ALPHA', start_date: null, end_date: null, description: 'ATS_PROJECT_DESCRIPTION_ALPHA', technologies: ['ATS_TECH_ALPHA'], project_url: null }],
  certificates: [{ name: 'ATS_CERT_ALPHA', organization: 'ATS_CERT_ORG_ALPHA', issue_date: null, expiration_date: null, credential_url: null }],
  languages: [{ name: 'ATS_LANGUAGE_ALPHA', proficiency: 'NATIVE' }],
})

const fixture = normalFixture()
if (useLong) fixture.experiences = Array.from({ length: 10 }, (_, index) => ({
  ...fixture.experiences[0], company_name: index === 0 ? 'ATS_EXP_COMPANY_ALPHA' : `ATS_EXP_COMPANY_${index + 1}`,
  description: index === 9 ? 'ATS_LONG_TAIL_MARKER' : `ATS_LONG_DESCRIPTION_${index + 1} `.repeat(18),
}))

const rootElement = document.getElementById('root')!
rootElement.className = printMode ? 'cv-print-root' : 'mx-auto w-[210mm] bg-white'
createRoot(rootElement).render(<StrictMode><CVTemplateRenderer cv={fixture} template={{ layout_key: layout, theme_config: null }} presentation={{ locale }} mode="print" /></StrictMode>)

requestAnimationFrame(() => requestAnimationFrame(() => {
  const documentSurface = rootElement.querySelector<HTMLElement>('[data-cv-document="true"]')
  const text = documentSurface?.innerText.replace(/\s+/g, ' ').trim() ?? ''
  const evidence = {
    layout, locale, fixture: useLong ? 'long' : 'normal',
    visible: Boolean(documentSurface && getComputedStyle(documentSurface).display !== 'none' && getComputedStyle(documentSurface).visibility !== 'hidden'),
    text,
    order: ['ATS_NAME_ALPHA', 'ats.alpha@example.test', 'ATS_OBJECTIVE_ALPHA', 'ATS_EXP_ROLE_ALPHA', 'ATS_EDU_SCHOOL_ALPHA', 'ATS_SKILL_ALPHA', 'ATS_PROJECT_ALPHA', 'ATS_CERT_ALPHA', 'ATS_LANGUAGE_ALPHA'].map((marker) => [marker, text.indexOf(marker)]),
    longTail: !useLong || text.includes('ATS_LONG_TAIL_MARKER'),
  }
  document.getElementById('ats-browser-evidence')!.textContent = JSON.stringify(evidence)
  document.documentElement.dataset.atsReady = 'true'
}))
