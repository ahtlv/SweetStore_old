<script setup>

import { tg_style } from '../func/ThemeParams'

</script>

<template>
    <div class="flex flex-col gap-y-2 justify-center items-center">
        <div 
            class="flex w-full h-32 rounded-xl blink_me"
            :style="tg_style('bg_color')"
        ></div>
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