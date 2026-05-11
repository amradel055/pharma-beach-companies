<template>
    <div class="lp">
        <!-- RIGHT (in RTL) — Form panel. DOM first => first grid track => right side in RTL. -->
        <div class="lp-form-side">
            <div class="lp-form-wrap">
                <!-- Child auth views render here. The left visual panel (below) lives outside
                     the router-view, so it persists across /login → /forgot etc. —
                     only the form swaps (with a fade). -->
                <RouterView v-slot="{ Component }">
                    <Transition name="lp-form-swap" mode="out-in">
                        <component :is="Component" />
                    </Transition>
                </RouterView>
            </div>
        </div>

        <!-- LEFT (in RTL) — Visual panel. DOM second => second grid track => left side in RTL. -->
        <div class="lp-visual">
            <!-- Background photo for the whole visual section (sits beneath the mesh blobs) -->
            <img src="https://picsum.photos/seed/pharma-resort-view/1400/1600" alt="" class="lp-visual__bg" aria-hidden="true" />

            <div class="lp-mesh">
                <div class="lp-mesh__blob lp-mesh__blob--a"></div>
                <div class="lp-mesh__blob lp-mesh__blob--b"></div>
                <div class="lp-mesh__blob lp-mesh__blob--c"></div>
                <div class="lp-mesh__blob lp-mesh__blob--d"></div>
                <div class="lp-mesh__noise"></div>
            </div>

            <div class="lp-particles">
                <span v-for="n in 12" :key="n" class="lp-particle" :style="particleStyle(n)"></span>
            </div>

            <div class="lp-visual__content">
                <div class="lp-visual__brand lp-anim" style="--d:0s">
                    <img :src="logoUrl" alt="فارما بيتش" class="lp-visual__logo" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import logoImg from '@/assets/images/logo.png'
import '@/styles/auth-layout.css'

const logoUrl = logoImg

const particleStyle = (n) => {
    const seeds = [
        { x: 8,  y: 12, s: 3, dur: 14, del: 0 },  { x: 85, y: 8,  s: 2, dur: 18, del: 2 },
        { x: 72, y: 75, s: 4, dur: 16, del: 5 },  { x: 20, y: 88, s: 2, dur: 20, del: 1 },
        { x: 45, y: 30, s: 3, dur: 22, del: 7 },  { x: 92, y: 45, s: 2, dur: 15, del: 3 },
        { x: 15, y: 55, s: 3, dur: 19, del: 9 },  { x: 60, y: 92, s: 2, dur: 17, del: 4 },
        { x: 35, y: 15, s: 2, dur: 21, del: 6 },  { x: 78, y: 60, s: 3, dur: 13, del: 8 },
        { x: 50, y: 50, s: 2, dur: 24, del: 10 }, { x: 5,  y: 35, s: 2, dur: 16, del: 11 },
    ]
    const p = seeds[(n - 1) % seeds.length]
    return { left: p.x + '%', top: p.y + '%', width: p.s + 'px', height: p.s + 'px', animationDuration: p.dur + 's', animationDelay: p.del + 's' }
}
</script>
