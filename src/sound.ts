// 음원 파일 없이 Web Audio로 만든 기차 주행음 (낮은 진동음 + 레일 이음새 소리)
// 기차가 멈춰 있을 때(speed 0)는 소리가 나지 않습니다

let ctx: AudioContext | null = null
let master: GainNode | null = null
let rumble: GainNode | null = null
let clackTimer: number | null = null
let speed = 0

function noiseBuffer(ac: AudioContext, seconds: number, brown: boolean) {
  const buf = ac.createBuffer(1, ac.sampleRate * seconds, ac.sampleRate)
  const data = buf.getChannelData(0)
  let last = 0
  for (let i = 0; i < data.length; i++) {
    const white = Math.random() * 2 - 1
    if (brown) {
      last = (last + 0.02 * white) / 1.02
      data[i] = last * 3.5
    } else {
      data[i] = white
    }
  }
  return buf
}

function clack() {
  if (!ctx || !master || speed < 0.05) return
  const ac = ctx
  const burst = noiseBuffer(ac, 0.08, false)
  for (const delay of [0, 0.11]) {
    const src = ac.createBufferSource()
    src.buffer = burst
    const filter = ac.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = 900
    filter.Q.value = 1.2
    const g = ac.createGain()
    const t = ac.currentTime + delay
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(0.18 * speed, t + 0.005)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.07)
    src.connect(filter).connect(g).connect(master)
    src.start(t)
  }
}

function scheduleClacks() {
  if (clackTimer !== null) window.clearTimeout(clackTimer)
  const interval = speed > 0.05 ? 1100 - speed * 600 : 400
  clackTimer = window.setTimeout(() => {
    clack()
    scheduleClacks()
  }, interval)
}

export function soundOn() {
  if (!ctx) {
    ctx = new AudioContext()
    master = ctx.createGain()
    master.gain.value = 0.6
    master.connect(ctx.destination)

    const src = ctx.createBufferSource()
    src.buffer = noiseBuffer(ctx, 4, true)
    src.loop = true
    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 220
    rumble = ctx.createGain()
    rumble.gain.value = 0
    src.connect(lp).connect(rumble).connect(master)
    src.start()
  }
  void ctx.resume()
  master!.gain.setTargetAtTime(0.6, ctx.currentTime, 0.2)
  scheduleClacks()
}

export function soundOff() {
  if (!ctx || !master) return
  master.gain.setTargetAtTime(0, ctx.currentTime, 0.15)
  if (clackTimer !== null) window.clearTimeout(clackTimer)
  clackTimer = null
}

// 0(정차) ~ 1(최고 속도)
export function setTrainSpeed(v: number) {
  speed = v
  if (ctx && rumble) rumble.gain.setTargetAtTime(v * 0.6, ctx.currentTime, 0.15)
}
