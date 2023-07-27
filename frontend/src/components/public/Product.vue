<script setup>

import { ref, onMounted } from 'vue' 
import { tg_style } from '../func/ThemeParams'

import { useBasketStore } from '../../stores/Basket'

const basketStore = useBasketStore()

const count = ref(0)

const { order, conf } = defineProps({
    order: Object, conf: Promise
})

// Инициализация количества товара, который был добавлен в корзину

onMounted(() => {
    const product = basketStore.orders ? basketStore.orders.find(el => el._id === order._id) : false

    product
        ? count.value = product.count
        : count.value = 0
})

</script>

<template>
    <div :class="{'opacity-60' : !order.availability, 'flex flex-col items-center justify-between gap-y-2 relative' : true}">

        <transition name="bounce">
            <span v-if="count > 0"
                :style="conf.color ? {'background-color': conf.color} : {'background-color': '#FF9800'}"
                class="border-2 border-white flex justify-center items-center w-7 h-7 text-sm font-bold text-white rounded-full absolute -top-2 right-0 cursor-pointer">
                    {{ count }}
            </span>
        </transition>

        <router-link :to="'/detailed/' + order._id">

            <div class="flex flex-col gap-y-2 items-center justify-between">
                <img 
                    class="h-[72px]"
                    :src='order.image[0].url'
                    :alt='order.title'
                />
                <h3 class="font-medium text-center text-xs" :style="tg_style('text_color')">
                    {{ order.title.slice(0, 18) }} ·
                        <span class="font-semibold text-xs">
                            {{ order.price + conf.currency.bage }}
                        </span>
                </h3>
            </div>

        </router-link>

        <div class="flex flex-col gap-y-2 relative">
            <button v-if="count < 1 && order.availability"
                @click="() => {
                    basketStore.addOrderToBasket(order)
                    if (count < order.availability || order.availability === true) {
                        count++
                    }
                }"
                :style="conf.color ? {'background-color': conf.color} : {'background-color': '#FF9800'}"
                class="uppercase text-xs font-bold w-24 h-8 rounded-lg text-white hover:opacity-90 transition-all flex items-center justify-center">
                    Купить
            </button>

        <div v-else-if="count > 0 && order.availability"
            class="flex gap-x-2">
            <button 
                @click="() => {
                    basketStore.removeOrderInBasket(order)
                    count--
                }"
                class="uppercase text-xs font-bold bg-red-500 w-11 h-8 rounded-lg text-white hover:opacity-90 transition-all justify-center flex items-center">
                <img
                    class="w-4"
                    src="../../assets/minus.svg"
                    alt="minus"
                />
            </button>

            <button 
                @click="() => {
                    basketStore.addOrderToBasket(order)
                    if (count < order.availability || order.availability === true) {
                        count++
                    }
                }"
                :style="conf.color ? {'background-color': conf.color} : {'background-color': '#FF9800'}"
                class="uppercase text-xs font-bold w-11 h-8 py-2 rounded-lg text-white hover:opacity-90 transition-all justify-center flex items-center">
                <img 
                    class="w-4"
                    src="../../assets/plus.svg"
                    alt="plus"
                />
            </button>
        </div>

        <button v-else
            disabled
            class="uppercase text-sm font-bold bg-slate-500 w-24 h-8 rounded-lg text-white hover:opacity-90 transition-all flex items-center justify-center">
                Скоро
        </button>
        </div>
    </div>
</template>

<style>

.bounce-enter-active {
  animation: bounce-in 0.2s
}

.bounce-leave-active {
  animation: bounce-in 0.2s reverse
}

@keyframes bounce-in {

  0% {
    transform: scale(0)
  }
  50% {
    transform: scale(1.25)
  }
  100% {
    transform: scale(1)
  }

}

</style>