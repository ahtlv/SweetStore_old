<script setup>

import { tg_style } from '../func/ThemeParams'

</script>

<template>
    <div class="flex flex-col gap-y-2 mt-2 justify-center items-center">
        <div 
        :style="tg_style('secondary_bg_color')"
        class="flex w-5/6 h-10 rounded-xl blink_me"></div>
        <div 
        :style="tg_style('secondary_bg_color')"
        class="flex w-2/6 h-10 rounded-xl blink_me"></div>
        <div 
        :style="tg_style('secondary_bg_color')"
        class="flex w-3/6 h-10 rounded-xl blink_me"></div>
    </div>
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