<script setup>

import { 
    onMounted, ref
} from 'vue'

import { useOrdersStore } from '../../stores/Orders'
import axios from 'axios'
import { host } from '../../config.json'

import { tg_style } from '../../components/func/ThemeParams'

const ordersStore = useOrdersStore()
const config = ref(null)
const selectCurr = ref(null)
const color = ref('#FFFFFF')

const list = ref([
    {
        slug: 'RUB',
        bage: '₽'
    },
    {
        slug: 'USD',
        bage: '$'
    },
    {
        slug: 'EUR',
        bage: '€'
    },
    {
        slug: 'BYN',
        bage: 'Br'
    },
])

onMounted(async () => {
    await axios
        .get(host + '/config/' + 1)
        .then((res) => {
            config.value = res.data[0]
            selectCurr.value = res.data[0].currency
            color.value = res.data[0].color

            if (config.value.mode === 'store') {
                checkStatus.value = true
            } else {
                checkStatus.value = false
            }

            if (config.value.ton) {
                tonStatus.value = true
            } else {
                tonStatus.value = false
            }
            
        })
        .catch((error) => {
            console.log('Loading data is fail!')
            console.log(error)
        })

    await ordersStore.getUsers(1)
})

const checkStatus = ref(null)
const tonStatus = ref(null)

const check = () => {
    if (checkStatus.value) {
        ordersStore.setConfigMode(config.value._id, 'default')
        checkStatus.value = false
    } else {
        ordersStore.setConfigMode(config.value._id, 'store')
        checkStatus.value = true
    }
}

const ton = () => {
    if (tonStatus.value) {
        ordersStore.setTon(config.value._id, false)
        tonStatus.value = false
    } else {
        ordersStore.setTon(config.value._id, true)
        tonStatus.value = true
    }
}

</script>

<template>
    <main 
    v-if="!ordersStore.loading"
    class="flex flex-col gap-y-2 w-[440px] max-[440px]:w-full overflow-x-hidden">
        <div 
        :style="tg_style('secondary_bg_color')"
        class="flex p-4">
            <span 
            :style="tg_style('hint_color')"
            class="text-medium">Подписчиков: <span 
            :style="tg_style('text_color')"
            >{{ ordersStore.users.length }}</span></span>
        </div>

        <div class="px-4">

            <div 
                @click="check"
                class="flex gap-x-2 items-center cursor-pointer hover:opacity-90 mt-2">
                    <span 
                    :style="tg_style('secondary_bg_color')"
                    class="flex justify-center items-center w-10 h-10">
                    <span 
                            v-if="checkStatus"
                            :style="tg_style('bg_text_color')"
                            class="w-2 h-2 rounded-full"
                        />
                    </span>
                    <span 
                    :style="tg_style('hint_color')"
                    class="font-medium text-sm">Нативные платежи включены</span>
            </div>

            <div 
                @click="ton"
                class="flex gap-x-2 items-center cursor-pointer hover:opacity-90 mt-2">
                    <span 
                    :style="tg_style('secondary_bg_color')"
                    class="flex justify-center items-center w-10 h-10">
                        <span 
                            v-if="tonStatus"
                            :style="tg_style('bg_text_color')"
                            class="w-2 h-2 rounded-full"
                        />
                    </span>
                    <span 
                    :style="tg_style('hint_color')"
                    class="font-medium text-sm">Прием оплаты в TON</span>
            </div>

            <div class="flex justify-between">
                <div
                v-for="val in list"
                @click="() => {
                    if (val.slug !== selectCurr.slug) {
                        selectCurr = val
                        ordersStore.setCurrency(config._id, val)
                    }
                }"
                class="flex gap-x-2 items-center cursor-pointer hover:opacity-90 mt-2">
                    <span 
                    :style="tg_style('secondary_bg_color')"
                    class="flex justify-center items-center w-10 h-10">
                        <span 
                            v-if="val.slug === selectCurr.slug"
                            :style="tg_style('bg_text_color')"
                            class="w-2 h-2 rounded-full"
                        />
                    </span>
                    <span 
                    :style="tg_style('hint_color')"
                    class="font-medium text-sm">{{ val.slug }}</span>
                </div>
            </div>

            <div class="flex gap-x-2 items-center cursor-pointer hover:opacity-90 mt-2">
                    <input 
                        class="flex justify-center items-center w-10 h-10"
                        type="color"
                        v-model="color"
                        @change="ordersStore.setColor(config._id, color)"
                    />
                    <span 
                    :style="tg_style('hint_color')"
                    class="font-medium text-sm">Тема магазина</span>
            </div>
        </div>
    </main>
</template>