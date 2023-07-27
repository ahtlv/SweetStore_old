<script setup>

import { tg_style } from '../func/ThemeParams'

</script>

<template>
    <div 
    :style="tg_style('secondary_bg_color')"
    class="flex w-full h-36 bg-slate-100 rounded-xl blink_me"></div>
</template>

<style>

    .blink_me {
        animation: blinker 1.5s linear infinite
    }

    @keyframes blinker {
        50% {
            opacity: 0.5
        }
    }

</style>