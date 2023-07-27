<script setup>

import { tg_style } from '../func/ThemeParams'

defineProps({
    order: Object, conf: Promise
})

</script>

<template>
    <div 
        class="flex justify-between">
            <div class="flex justify-between items-center gap-x-4">
                <div class="flex justify-center items-center h-10 w-12">
                    <img 
                        class="h-10"
                        :src='order.image[0].url'
                        :alt='order.title'
                    />
                </div>
                <div class="flex flex-col">
                    <h3 
                    :style="tg_style('text_color')"
                    class="text-md font-bold">
                        {{ order.title.slice(0, 18) }} <span 
                        :style="conf.color ? {'color': conf.color} : {'color': '#FF9800'}">
                            {{ order.count }}x
                        </span>
                    </h3>
                    <p 
                    :style="tg_style('hint_color')"
                    class="text-sm">
                        {{ order.description.slice(0, 26) + '..' }}
                    </p>
                </div>
            </div>
            <div class="text-lg font-semibold">
                <span
                    :style="tg_style('text_color')"
                >
                    {{ (order.price * order.count) + conf.currency.bage }}
                </span>
            </div>
        </div>
</template>