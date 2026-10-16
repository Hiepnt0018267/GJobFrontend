import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8')

test('auth page delegates imagery to the bounded interactive visual panel', async () => {
  const [page, panel] = await Promise.all([
    read('../src/pages/auth/AuthPage.tsx'),
    read('../src/components/auth/AuthVisualPanel.tsx'),
  ])

  assert.match(page, /<AuthVisualPanel isLogin=\{isLogin\} \/>/)
  assert.match(panel, /auth_login_banner\.jpg/)
  assert.match(panel, /auth_register_banner\.jpg/)
  assert.match(panel, /onPointerMove=\{handlePointerMove\}/)
  assert.match(panel, /onPointerLeave=\{resetMotion\}/)
  assert.match(panel, /requestAnimationFrame/)
  assert.match(panel, /pointerType === 'touch'/)
  assert.match(panel, /prefers-reduced-motion: reduce/)
})

test('auth image interaction stays spatially bounded and restores its resting state', async () => {
  const panel = await read('../src/components/auth/AuthVisualPanel.tsx')

  assert.match(panel, /horizontal \* -18/)
  assert.match(panel, /vertical \* -14/)
  assert.match(panel, /'--auth-image-scale': '1\.035'/)
  assert.match(panel, /'--auth-image-x': '0px'/)
  assert.match(panel, /'--auth-image-y': '0px'/)
  assert.match(panel, /'--auth-image-scale': '1'/)
  assert.match(panel, /motion-reduce:transform-none/)
})
