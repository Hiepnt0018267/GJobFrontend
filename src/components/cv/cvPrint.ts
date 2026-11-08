import type { CVCreateRequest } from '../../types/cv'
import type { CVTemplateRenderable } from './CVTemplateRenderer'
import type { CVRenderPresentation } from './templates/types'

export type CVPrintRenderState = {
  cv: CVCreateRequest
  template: CVTemplateRenderable
  presentation: CVRenderPresentation
  photoUrl: string | null
}

export function derivePrintRenderState({ cv, template, presentation, photoUrl }: CVPrintRenderState): CVPrintRenderState {
  return { cv, template, presentation, photoUrl }
}

export function sanitizePrintTitle(value: string | null | undefined): string {
  const sanitized = (value ?? '')
    .replace(/[<>:"/\\|?*]/g, ' ')
    .split('').map((character) => character.charCodeAt(0) < 32 ? ' ' : character).join('')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 100)
  return sanitized ? `CV - ${sanitized}` : 'CV - GJob'
}

const settleWithin = async (task: Promise<unknown>, timeoutMs: number) => {
  let timeout: ReturnType<typeof setTimeout> | undefined
  await Promise.race([
    task.catch(() => undefined),
    new Promise<void>((resolve) => { timeout = setTimeout(resolve, timeoutMs) }),
  ])
  if (timeout) clearTimeout(timeout)
}

export async function waitForPrintAssets(root: HTMLElement, documentRef: Document = document, timeoutMs = 4_000) {
  if (documentRef.fonts?.ready) await settleWithin(documentRef.fonts.ready, timeoutMs)
  const images = Array.from(root.querySelectorAll('img'))
  await Promise.all(images.map(async (image) => {
    if (!image.complete) {
      await settleWithin(new Promise<void>((resolve) => {
        image.addEventListener('load', () => resolve(), { once: true })
        image.addEventListener('error', () => resolve(), { once: true })
      }), timeoutMs)
    }
    if (image.complete && image.naturalWidth > 0 && typeof image.decode === 'function') await settleWithin(image.decode(), timeoutMs)
  }))
  await new Promise<void>((resolve) => setTimeout(resolve, 0))
}

type PrintRequest = { root: HTMLElement; title: string }
type BrowserPrintEnvironment = { document: Document; print: () => void }

export function createBrowserPrintController(environment: BrowserPrintEnvironment = { document, print: () => window.print() }) {
  let activePrint: Promise<void> | null = null
  return {
    print(request: PrintRequest) {
      if (activePrint) return activePrint
      activePrint = (async () => {
        const previousTitle = environment.document.title
        try {
          await waitForPrintAssets(request.root, environment.document)
          environment.document.title = sanitizePrintTitle(request.title)
          environment.print()
        } finally {
          environment.document.title = previousTitle
        }
      })().finally(() => { activePrint = null })
      return activePrint
    },
  }
}
