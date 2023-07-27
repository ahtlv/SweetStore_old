<script setup>
import { useOrdersStore } from '../../stores/Orders'
import { tg_style } from '../func/ThemeParams'
const ordersStore = useOrdersStore()

defineProps({
    income: Object
})

const stat = ['created', 'paid', 'not paid', 'cancelled']

</script>

<template>
        <div 
        :style="tg_style('secondary_bg_color')"
        class="rounded-md p-4 flex flex-col mb-4">
            <span 
            :style="tg_style('text_color')"
            class="text-md font-medium">Заказ #{{ income.order_number }}</span>
            <div class="flex">
                <span 
                :style="tg_style('hint_color')"
                class="text-sm font-medium">{{ income.date }} · <span class="text-green-500 font-medium">{{ income.status }}</span></span>
            </div>
            <hr 
            :style="tg_style('bg_color')"
            class="my-3"/>
            <div
                class="flex justify-between items-center"
                v-for="order in income.goods"
                :key="order._id"
            >
                <div class="flex gap-x-3 items-center">
                    <img 
                        class="w-12"
                        :src="order.image[0].url"
                        :alt="order.title"
                    />
                    <div class="flex flex-col">
                        <span 
                        :style="tg_style('text_color')"
                        class="font-medium">{{ order.title }}</span>
                        <span 
                        :style="tg_style('hint_color')"
                        class="text-sm">{{ order.description.slice(0, 24) + '..' }}</span>
                    </div>
                </div>
                <div class="flex flex-col items-end">
                    <span 
                    :style="tg_style('text_color')"
                    class="font-medium">{{ (order.price * order.count) + income.currency.bage }}</span>
                    <span 
                    :style="tg_style('hint_color')"
                    class="text-sm">{{ order.count + 'шт.' }}</span>
                </div>
            </div>
            <hr 
            :style="tg_style('bg_color')"
            class="my-3"/>
            <span 
            :style="tg_style('text_color')"
            v-if="income.note">Комментарий к заказу: <span class="text-slate-500">{{ income.note }}</span></span>
            <span 
            :style="tg_style('text_color')"
            v-if="income.user">Пользователь: <a 
            :style="tg_style('link_color')"
            class="font-medium" target="_blank" :href="'https://t.me/' + income.user.user.username" >{{ income.user.user.first_name }}</a></span>

            <hr 
            :style="tg_style('bg_color')"
            class="my-3"/>
            <div class="flex gap-x-2 overflow-x-auto whitespace-nowrap">
                <button 
                    @click="() => {
                        ordersStore.setIncomeStatus(income._id, name)
                    }"
                :class="name === income.status && 'border-2 border-green-500'"
                :style="tg_style('bg_color')"
                class="rounded-full px-3 py-1 hover:opacity-75"
                v-for="name in stat"><span
                :style="tg_style('text_color')"
                >{{ name }}</span></button>
            </div>
        </div>
</template>