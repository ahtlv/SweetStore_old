<script setup>

import { 
    ref,
    computed,
    onMounted
} from 'vue'

import { tg_style } from '../../components/func/ThemeParams'

import { useOrdersStore } from '../../stores/Orders'
import Order from '../../components/dashboard/Order.vue'
import Indicator from '../../components/dashboard/GoodsLoadingIndicator_dashboard.vue'

const ordersStore = useOrdersStore()

onMounted(() => {
    ordersStore.getIncome(1)
})

const query = ref('')

const queryResults = computed(() => {
    return ordersStore.incoming.reverse().filter((income) => income.date.toLowerCase().indexOf(query.value.toLowerCase()) !== -1)
})

</script>

<template>
    <main class="w-[440px] max-[440px]:w-full overflow-x-hidden pt-12">

        <div 
        :style="tg_style('secondary_bg_color')"
        class="fixed top-0 left-0 right-0 w-[440px] max-[440px]:w-full z-10">
            <div 
            :style="tg_style('secondary_bg_color')"
            class="flex items-center px-5">
            <img 
                src="../../assets/Search.svg"
                alt="search"
            />

            <input
                @keyup.enter="(e) => e.target.blur()"
                v-model="query"
                :style="tg_style('input')"
                class="p-3 text-base text-theme_black w-full rounded-r-xl outline-none"
                type="search"
                placeholder="Поиск по дате..."
            />
            </div>
        </div>

        <Indicator 
            v-if="ordersStore.loading"
        />

        <div 
            v-if="queryResults.length > 0 && !ordersStore.loading"
        >
            
            <Order
                v-for="income in queryResults"
                :key="income._id"
                :income="income"
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
            >Список заказов<br />пуст</span>
        </div>

    </main>
</template>