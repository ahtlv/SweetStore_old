<script setup>

import { tg_style } from '../../components/func/ThemeParams'
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Indicator from '../../components/public/DetailedLoadingIndicator.vue'

import { Carousel, Slide, Navigation } from 'vue3-carousel'
import 'vue3-carousel/dist/carousel.css'

import { useOrdersStore } from '../../stores/Orders'
import { useBasketStore } from '../../stores/Basket'

import { 
    BackButton,
    useWebAppMainButton,
    useWebApp,
    useWebAppBackButton
} from "vue-tg"

const { 
    hideMainButton
} = useWebAppMainButton()

const {
    hideBackButton
} = useWebAppBackButton()

const router = useRouter()
const route = useRoute()

const ordersStore = useOrdersStore()
const basketStore = useBasketStore()

const count = ref(0)

const id = route.params.id

const conf = ref({
    currency: {
        bage: null,
        slug: null
    }
})

const {
    initDataUnsafe
} = useWebApp()

onMounted(async () => {
    await ordersStore.getOrder(id)
    conf.value = await ordersStore.getСonfig(1)

    const product = basketStore.orders.find(el => el._id === id)

    product
        ? count.value = product.count
        : count.value = 0

    hideMainButton()
})

const backClick = () => {
    if (Object.entries(initDataUnsafe).length > 0) {
        hideBackButton()
        window.history.length > 1 ? router.go(-1) : router.push({name: 'Index'})
    }
}

</script>

<template>

    <BackButton
        v-if="Object.entries(initDataUnsafe).length > 0"
        @click="backClick"
    />

    <main class="grid w-[440px] max-[440px]:w-full p-4">
        <Indicator 
            v-if="ordersStore.loading"
        />

        <transition name="fade" appear :duration="150">
            <section 
                v-if="!ordersStore.loading"
            class="flex flex-col gap-y-3">
                
                <div class="flex flex-col gap-y-3">

                    <Carousel>
                        <Slide v-for="slide in ordersStore.separateProduct.image" :key="slide">
                            <div class="flex justify-center py-4 relative">
                                <img
                                    class="w-64"
                                    :src="slide.url"
                                    :alt="ordersStore.separateProduct.title"
                                />
                            </div>
                        </Slide>

                        <template #addons>
                            <Navigation />
                        </template>
                    </Carousel>

                    <div class="flex justify-between">
                        <div>
                        <p 
                        :style="tg_style('hint_color')"
                        class="text-sm">Наименование</p>
                        <h2 
                        :style="tg_style('text_color')"
                        class="text-xl font-semibold uppercase">{{ ordersStore.separateProduct.title }}</h2>
                        </div>

                        <div>
                        <p 
                        :style="tg_style('hint_color')"
                        class="text-sm">Цена</p>
                        <h2 class="text-xl font-semibold text-theme_black uppercase">
                            <span
                            :style="tg_style('text_color')"
                            >{{ ordersStore.separateProduct.price + conf.currency.bage }}</span>
                        </h2>
                        </div>
                    </div>

                </div>

                <div class="flex justify-between gap-x-2">
                    <button
                        @click="() => {
                            basketStore.addOrderToBasket(ordersStore.separateProduct)
                            if (count < ordersStore.separateProduct.availability || ordersStore.separateProduct.availability === true) {
                                count++
                            }
                        }"
                        v-show="count < 1 && ordersStore.separateProduct.availability"
                        :style="conf.color ? {'background-color': conf.color} : {'background-color': '#FF9800'}"
                        class="flex w-full text-md font-semibold text-white p-2.5 justify-center rounded-xl hover:opacity-90 transition-all noted"
                        href="#"
                        >
                        Добавить в корзину
                    </button>

                    <button
                        @click="() => {
                            basketStore.removeOrderInBasket(ordersStore.separateProduct)
                            count--
                            }"
                        v-show="count > 0"
                        class="flex items-center bg-red-500 w-full text-md font-semibold text-white p-3.5 justify-center rounded-xl hover:opacity-90 transition-all noted"
                        href="#"
                        >
                        <img
                            class="w-4"
                            src="../../assets/minus.svg"
                            alt="minus"
                        />
                    </button>

                    <span
                        v-if="count > 0"
                        :style="tg_style('text_color')"
                        class="flex items-center border-2 w-full text-md font-semibold justify-center rounded-xl hover:opacity-90 transition-all noted"
                    >
                        {{ count }}
                    </span>

                    <button
                        @click="() => {
                            basketStore.addOrderToBasket(ordersStore.separateProduct)
                            if (count < ordersStore.separateProduct.availability || ordersStore.separateProduct.availability === true) {
                                count++
                            }
                        }"
                        v-show="count > 0"
                        :style="conf.color ? {'background-color': conf.color} : {'background-color': '#FF9800'}"
                        class="flex items-center w-full text-md font-semibold text-white p-3.5 justify-center rounded-xl hover:opacity-90 transition-all noted"
                        href="#"
                        >
                        <img
                            class="w-4"
                            src="../../assets/plus.svg"
                            alt="plus"
                        />
                    </button>

                    <div 
                        v-if="!ordersStore.separateProduct.availability || ordersStore.separateProduct.availability === 0"
                        class="flex text-md font-semibold w-full bg-slate-500 text-white p-2.5 justify-center rounded-xl"
                        >Скоро
                    </div>
                </div>

                <div>
                    <div 
                    :style="tg_style('text_color')"
                    class="font-semibold text-lg">Описание</div>
                    <p 
                    :style="tg_style('text_color')"
                    class="text-md text-theme_black whitespace-pre-wrap text-justify">{{ ordersStore.separateProduct.description }}</p>
                </div>

                <div class="flex flex-col gap-y-2">
                    <div 
                    :style="tg_style('text_color')"
                    class="font-semibold text-lg">Категории товара:</div>
                    <div class="flex flex-col gap-y-2">
                        <span
                            :style="tg_style('text_color')"
                            class="border-2 flex w-fit px-5 py-2 text-sm hover:opacity-90 cursor-pointer rounded-full font-medium"
                            v-for="tag in ordersStore.separateProduct.addons"
                        >
                        {{ tag }}
                        </span>
                    </div>
                </div>

            </section>
        </transition>
    </main>
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

.fade-enter-active {
    transition: all 0.3s
}

.fade-leave-active {
    transition: all 0.3s
}

.fade-enter-from, .fade-leave-to {
    opacity: 0
}

.carousel__prev,
.carousel__next {
  box-sizing: content-box
}

</style>