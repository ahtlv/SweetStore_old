<script setup>

import { 
    ref,
    computed,
    onMounted
} from 'vue'

import { tg_style } from '../../components/func/ThemeParams'

import { useRouter } from 'vue-router'

import { useOrdersStore } from '../../stores/Orders'
import Category from '../../components/dashboard/Category_inDashboard.vue'
import Indicator from '../../components/dashboard/GoodsLoadingIndicator_dashboard.vue'

import {
    MainButton,
    useWebApp
} from "vue-tg"

const router = useRouter()

const { initDataUnsafe } = useWebApp()

const ordersStore = useOrdersStore()

onMounted(() => {
    ordersStore.getTags(1)
})

// Поиск по наименованию

const query = ref('')

const queryResults = computed(() => {
    return ordersStore.tags.reverse().filter((tag) => tag.title.toLowerCase().indexOf(query.value.toLowerCase()) !== -1)
})

const mainButtonText = ref('Добавить категорию')

const mainButtonClick = () => {
    router.push({name: 'Category_set'})
}

</script>

<template>
    <main class="w-[440px] max-[440px]:w-full overflow-x-hidden pt-12">

        <MainButton v-if="Object.entries(initDataUnsafe).length > 0"
            :text='mainButtonText'
            color="#4CAF50"
            @click="mainButtonClick"
        />

        <button v-if="!Object.entries(initDataUnsafe).length > 0 && !ordersStore.loading"
        @click="mainButtonClick"
        class="flex z-10 fixed bottom-0 bg-green-500 px-5 py-3 w-[440px] max-[440px]:w-full justify-center items-center text-white font-medium hover:opacity-90"
        >
            {{ mainButtonText }}
        </button>

        <div 
        :style="tg_style('secondary_bg_color')"
        class="fixed top-0 left-0 right-0 w-[440px] max-[440px]:w-full z-10">
            <div 
            :style="tg_style('input')"
            class="flex items-center px-5">
            <img 
                src="../../assets/Search.svg"
                alt="search"
            />

            <input
                @keyup.enter="(e) => e.target.blur()"
                v-model="query"
                :style="tg_style('secondary_bg_color')"
                class="p-3 text-base text-theme_black w-full rounded-r-xl outline-none"
                type="search"
                placeholder="Поиск..."
            />
            </div>
        </div>

        <Indicator 
            v-if="ordersStore.loading"
        />

        <div 
            v-if="queryResults.length > 0 && !ordersStore.loading"
        >
            
            <Category
                v-for="tag, index in queryResults"
                :key="tag.id"
                :tag="tag"
                :index="index"
            />

        </div>

        <div 
        v-else-if="!ordersStore.loading && queryResults.length < 1"
        class="flex justify-center items-center flex-col py-5 px-3">
            <img 
                class="w-24"
                src="../../assets/eco.svg"
                alt="eco"
            />
            <span 
            :style="tg_style('text_color')"
            class="font-medium text-md text-center"
            >Список категорий<br />пуст</span>
        </div>

    </main>
</template>