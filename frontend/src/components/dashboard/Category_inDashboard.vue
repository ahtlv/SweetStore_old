<script setup>

import { useOrdersStore } from '../../stores/Orders'
import { tg_style } from '../func/ThemeParams'
const ordersStore = useOrdersStore()

const { tag, index } = defineProps({
    tag: Object,
    index: Number
})

</script>

<template>
    <div 
    :style="tg_style('secondary_bg_color')"
    class="flex justify-between items-center font-medium pl-4 mb-2 hover:opacity-80 cursor-pointer">
        <span
        :style="tg_style('text_color')"
        >{{ tag.title }}</span>
        <button 
        @click="() => {
            ordersStore.deleteTag(tag._id)
        }"
        class="text-white bg-red-500 px-4 py-3 font-medium">Удалить</button>
    </div>
</template>