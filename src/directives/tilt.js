// v-tilt — subtle, tasteful 3D hover tilt.
//
// Usage:  v-tilt            (default max 6°)
//         v-tilt="9"        (custom max degrees)
//         v-tilt="{ max: 5, lift: 4 }"
//
// Pointer-tracked rotateX/rotateY with perspective + a small lift.
// No-ops on touch / coarse pointers and when the user prefers reduced
// motion. Pairs with the global `.mo-tilt` base class (transition +
// preserve-3d), which it adds automatically.

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
const fineHover = window.matchMedia('(hover: hover) and (pointer: fine)')

function motionEnabled() {
  return !reducedMotion.matches && fineHover.matches
}

function readOpts(value, arg) {
  if (value && typeof value === 'object') {
    return { max: Number(value.max ?? 6), lift: Number(value.lift ?? 3) }
  }
  const max = Number(value ?? arg ?? 6)
  return { max: Number.isFinite(max) ? max : 6, lift: 3 }
}

export default {
  mounted(el, binding) {
    let { max, lift } = readOpts(binding.value, binding.arg)
    el.classList.add('mo-tilt')
    let raf = null

    const onMove = (e) => {
      if (!motionEnabled()) return
      const r = el.getBoundingClientRect()
      if (!r.width || !r.height) return
      const px = (e.clientX - r.left) / r.width // 0 → 1
      const py = (e.clientY - r.top) / r.height // 0 → 1
      const ry = (px - 0.5) * (max * 2)
      const rx = (0.5 - py) * (max * 2)
      if (raf) cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        el.style.transform =
          `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateY(-${lift}px)`
      })
    }
    const onLeave = () => {
      if (raf) cancelAnimationFrame(raf)
      raf = null
      el.style.transform = ''
    }

    el.__tilt = { onMove, onLeave, update: (v, a) => ({ max, lift } = readOpts(v, a)) }
    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
  },
  updated(el, binding) {
    el.__tilt?.update(binding.value, binding.arg)
  },
  unmounted(el) {
    const t = el.__tilt
    if (!t) return
    el.removeEventListener('mousemove', t.onMove)
    el.removeEventListener('mouseleave', t.onLeave)
    delete el.__tilt
  },
}
