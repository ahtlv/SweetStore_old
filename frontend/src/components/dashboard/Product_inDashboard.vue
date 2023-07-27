<script setup>

defineProps({
    order: Object
})

import { tg_style } from '../func/ThemeParams'

</script>

<template>
    <router-link :to="'/panel/product_set/' + order._id">
        <div 
            :style="tg_style('secondary_bg_color')"
            class="flex justify-between items-center px-5 py-3 hover:opacity-80 cursor-pointer mb-4"
        >
            <div class="flex justify-between gap-y-2 flex-col">
                <div class="flex gap-x-4 items-center">
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
                        class="text-lg font-medium">
                            {{ order.title }}
                        </h3>
                        <span 
                        :style="tg_style('hint_color')">
                            {{ order.description.slice(0, 24) + '..' }}
                        </span>
                    </div>
                </div>

                <div class="flex gap-x-2">
                    <span class="bg-green-500 px-3 py-1 text-xs font-medium text-white rounded-full">Продаж: {{ order.sale }}</span>
                    
                    <span 
                        v-if="order.availability || order.availability > 0"
                        class="bg-slate-100 px-3 py-1 text-xs font-medium text-black rounded-full">В наличии: {{ order.availability === true ? '99+' : order.availability }}
                    </span>

                    <span 
                        v-else
                        class="bg-red-500 px-3 py-1 text-xs font-medium text-white rounded-full">Товар закончился
                    </span>
                </div>
            </div>
        </div>
    </router-link>
</template>