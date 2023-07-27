<script setup>
    import { ref, onMounted } from 'vue'
    import { useOrdersStore } from '../../stores/Orders'
    import axios from 'axios'
    import { host } from '../../config.json'

    import { tg_style } from '../../components/func/ThemeParams'

    import { 
        MainButton,
        useWebApp,
        useWebAppPopup,
        useWebAppMainButton
    } from "vue-tg"

    const { 
    showMainButtonProgress,
    hideMainButtonProgress
} = useWebAppMainButton()

    const { showAlert } = useWebAppPopup()

    const {
        initDataUnsafe
    } = useWebApp()

    const ordersStore = useOrdersStore()
    const locale_loading = ref(true)

    onMounted(async () => {
        await axios
            .get(host + '/config/' + 1)
            .then((res) => {
                success_message.value = res.data[0].success_message
                error_message.value = res.data[0].error_message
                moderate_message.value = res.data[0].moderate_message
                config_id.value = res.data[0]._id
                locale_loading.value = false
            })
            .catch((error) => {
                console.log('Loading data is fail!')
                console.log(error)
            })
    })

    const config_id = ref(null)
    const success_message = ref('')
    const error_message = ref('')
    const moderate_message = ref('')

    const mainButtonClick = async () => {
        showMainButtonProgress()
        if (success_message.value === '') {
            success_message.value = 'Заказ успешно оплачен!'
        }

        if (error_message.value === '') {
            error_message.value = 'Ошибка платежа!'
        }

        if (moderate_message.value === '') {
            moderate_message.value = 'Заказ был создан, ожидайте ответа оператора!'
        }

        await ordersStore.setMessageText(config_id.value, {
            success_message: success_message.value,
            error_message: error_message.value,
            moderate_message: moderate_message.value
        })

        hideMainButtonProgress()
        showAlert('Данные успешно сохранены!')
    }

</script>

<template>

    <MainButton 
        v-if="Object.entries(initDataUnsafe).length > 0 && locale_loading !== true"
        text='Сохранить'
        color="#4CAF50"
        @click="mainButtonClick"
    />

    <button v-if="!Object.entries(initDataUnsafe).length > 0 && locale_loading !== true"
        @click="mainButtonClick"
        class="flex z-10 fixed bottom-0 bg-green-500 px-5 py-3 w-[440px] max-[440px]:w-full justify-center items-center text-white font-medium hover:opacity-90"
    >
        Сохранить
    </button>
    <transition name="fade" :duration="100">
    <main 
    v-if="locale_loading !== true"
    class="w-[440px] max-[440px]:w-full">
        <h1 
        :style="tg_style('text_color')"
        class="p-4 text-md font-medium">Увидит пользователь после совершения успешной оплаты</h1>
        <resize-textarea
            :placeholder="success_message"
            :value="success_message"
            v-model="success_message"
            :style="tg_style('input')"
            class="w-full !px-4 text-sm outline-none !min-h-fit"
            >
        </resize-textarea>

        <h1
        :style="tg_style('text_color')"
        class="p-4 text-md font-medium">Увидит пользователь если оплата не прошла</h1>
        <resize-textarea
            :placeholder="error_message"
            :value="error_message"
            v-model="error_message"
            :style="tg_style('input')"
            class="w-full !px-4 text-sm outline-none !min-h-fit"
            >
        </resize-textarea>

        <h1 
        :style="tg_style('text_color')"
        class="p-4 text-md font-medium">Увидит пользователь при создании нового заказа без нативной оплаты</h1>
        <resize-textarea
            :placeholder="moderate_message"
            :value="moderate_message"
            v-model="moderate_message"
            :style="tg_style('input')"
            class="w-full !px-4 text-sm outline-none !min-h-fit"
            >
        </resize-textarea>
    </main>
    </transition>
</template>

<style>

.fade-enter-active {
    transition: all 0.3s
}

.fade-leave-active {
    transition: all 0.3s
}

.fade-enter-from, .fade-leave-to {
    opacity: 0
}

</style>