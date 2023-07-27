<script setup>

import { ref } from 'vue'
import { useOrdersStore } from '../../stores/Orders'
import { useRouter } from 'vue-router'
import { tg_style } from '../../components/func/ThemeParams'

import { 
    BackButton,
    useWebAppMainButton,
    useWebApp,
    useWebAppBackButton,
    MainButton,
    useWebAppPopup
} from "vue-tg"

const { 
    showMainButtonProgress,
    hideMainButtonProgress
} = useWebAppMainButton()

const { showAlert } = useWebAppPopup()

const {
    hideBackButton
} = useWebAppBackButton()

const {
    initDataUnsafe
} = useWebApp()

const ordersStore = useOrdersStore()

const router = useRouter()

const tag = ref('')

const backClick = () => {
    if (Object.entries(initDataUnsafe).length > 0) {
        hideBackButton()
        window.history.length > 1 ? router.go(-1) : router.push({name: 'Categories'})
    }
}

// Загрузка товара на сервер

const createTag = async () => {
    if (tag.value === '') {
        if (Object.entries(initDataUnsafe).length > 0) {
            showAlert('Категория не указана')
            return
        } else {
            alert('Категория не указана')
            return
        }
    }

    else
    showMainButtonProgress()
    await ordersStore.createTag(tag)
    hideMainButtonProgress()
    backButtonClick()
}

const backButtonClick = () => {
    window.history.length > 1 ? router.go(-1) : router.push({name: 'Categories'})
}

</script>

<template>
    <BackButton
        v-if="Object.entries(initDataUnsafe).length > 0"
        @click="backClick"
    />

    <MainButton v-if="Object.entries(initDataUnsafe).length > 0"
        text='Добавить'
        color="#4CAF50"
        @click="createTag()"
    />

    <button v-if="!Object.entries(initDataUnsafe).length > 0"
        @click="createTag()"
        class="flex z-10 fixed bottom-0 bg-green-500 px-5 py-3 w-[440px] max-[440px]:w-full justify-center items-center text-white font-medium hover:opacity-90"
        >
            Добавить
    </button>

    <div class="flex flex-col w-[440px] max-[440px]:w-full">
            <div class="flex flex-col w-full gap-y-2">

                <div class="flex flex-col gap-y-2">
                    <input 
                        @keyup.enter="(e) => e.target.blur()"
                        v-model="tag"
                        :style="tg_style('input')"
                        class="text-md px-5 py-3 outline-none"
                        type="text"
                        placeholder="Название категории"
                    />

                    <span 
                    :style="tg_style('hint_color')"
                    class="px-5 text-sm">Придумайте и введите название для новой категории товаров</span>
                </div>
            </div>

    </div>
</template>