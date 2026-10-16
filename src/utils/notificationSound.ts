const NOTE_VOLUME = 0.035

type BrowserWindowWithWebkitAudio = Window & typeof globalThis & {
  webkitAudioContext?: typeof AudioContext
}

let audioContext: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (audioContext) return audioContext

  const AudioContextConstructor = window.AudioContext
    ?? (window as BrowserWindowWithWebkitAudio).webkitAudioContext
  if (!AudioContextConstructor) return null

  audioContext = new AudioContextConstructor()
  return audioContext
}

function scheduleNote(
  context: AudioContext,
  frequency: number,
  startsAt: number,
  duration: number,
  volume: number,
) {
  const oscillator = context.createOscillator()
  const gain = context.createGain()
  const endsAt = startsAt + duration

  oscillator.type = 'sine'
  oscillator.frequency.setValueAtTime(frequency, startsAt)
  gain.gain.setValueAtTime(0.0001, startsAt)
  gain.gain.exponentialRampToValueAtTime(volume, startsAt + 0.012)
  gain.gain.exponentialRampToValueAtTime(0.0001, endsAt)
  oscillator.connect(gain)
  gain.connect(context.destination)
  oscillator.start(startsAt)
  oscillator.stop(endsAt + 0.02)
  oscillator.addEventListener('ended', () => {
    oscillator.disconnect()
    gain.disconnect()
  }, { once: true })
}

export function shouldPlayNotificationSound(previousCount: number | null, nextCount: number): boolean {
  return previousCount !== null && nextCount > previousCount
}

export async function enableNotificationSound(): Promise<void> {
  const context = getAudioContext()
  if (!context || context.state === 'running') return

  try {
    await context.resume()
  } catch {
    // Browser autoplay policy may keep audio suspended until a later interaction.
  }
}

export function playNotificationSound(): void {
  const context = getAudioContext()
  if (!context || context.state !== 'running') return

  const startsAt = context.currentTime + 0.01
  scheduleNote(context, 784, startsAt, 0.24, NOTE_VOLUME)
  scheduleNote(context, 1046.5, startsAt + 0.1, 0.32, NOTE_VOLUME * 0.82)
}
