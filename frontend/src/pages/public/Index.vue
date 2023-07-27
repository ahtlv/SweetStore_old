<script setup>

import { tg_style } from '../../components/func/ThemeParams'

import { 
    ref, computed,
    onMounted, onUpdated,
} from 'vue'

import {
    token, pay_token, support_chat, host, domain
} from '../../config.json'

import axios from 'axios'

import Product from '../../components/public/Product.vue'
import Product_inBasket from '../../components/public/Product_inBasket.vue'
import Indicator from '../../components/public/GoodsLoadingIndicator.vue'

import { useOrdersStore } from '../../stores/Orders'
import { useBasketStore } from '../../stores/Basket'

import { 
    MainButton,
    BackButton,
    useWebAppMainButton,
    useWebAppBackButton,
    useWebApp,
    useWebAppNavigation,
    useWebAppViewport
} from "vue-tg"

import pdfMake from "pdfmake/build/pdfmake"
import pdfFonts from "pdfmake/build/vfs_fonts"

import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()

const { expand } = useWebAppViewport()
const pay_link = ref(null)

const conf = ref({
    currency: {
        bage: null,
        slug: null
    },
    color: null
})

onMounted(async () => {
    expand()

    conf.value = await ordersStore.getСonfig()
    await ordersStore.getOrders(1)
    await ordersStore.getTags(1)

    pdfMake.addVirtualFileSystem(pdfFonts)
})

const { openInvoice } = useWebAppNavigation()

const { 
    hideMainButton,
    showMainButton,
    setMainButtonText,
    showMainButtonProgress,
    hideMainButtonProgress
} = useWebAppMainButton()

const {
    hideBackButton
} = useWebAppBackButton()

const {
    close,
    initDataUnsafe
} = useWebApp()

const ordersStore = useOrdersStore()
const basketStore = useBasketStore()

const comment = ref('')
const mainButtonText = ref('Корзина')
const basketOpened = ref(false)
const selectOpened = ref(false)

const selectTag = ref('')

const order_number = ref(null)

const mainButtonClick = () => {
    mainButtonText.value = 'Оформить заказ'

    if (Object.entries(initDataUnsafe).length > 0) {
        if (basketOpened.value) {
            showMainButtonProgress()
            PlaceAnOrder()
        }

        basketOpened.value = true
        setMainButtonText(mainButtonText.value)
    } else {
        if (basketOpened.value) {
            PlaceAnOrder()
        }

        basketOpened.value = true
    }
}

onUpdated(() => {
    if (Object.entries(initDataUnsafe).length > 0) {
        basketStore.orders.length < 1
        ? hideMainButton()
        : showMainButton()
    }
})

// Сортировка по умолчанию, убирает товары которые недоступны в конец списка

const queryResults = computed(() => {
    let defaultSort = ordersStore.orders.reverse().sort((a, b) => {
        if (b.availability === false || b.availability < 1) return -1
    })

    if (selectTag.value !== '') {
        return defaultSort.filter((product) => product.addons.includes(selectTag.value))
    } else {
        return defaultSort
    }
})

const backClick = () => {
    basketOpened.value = false
    mainButtonText.value = 'Корзина'

    if (Object.entries(initDataUnsafe).length > 0) {
        hideBackButton()
        setMainButtonText(mainButtonText.value)
    }
}

// Формируем документ с данными о заказе и отправляем в чат

const PlaceAnOrder = async (replace) => {
    order_number.value = Math.random().toString().slice(2).substr(0, 4)

    let goods = [
        ['Цена', 'Наименование', 'Количество']
    ]

    let price = 0

    basketStore.orders.forEach((e) => {
        price = price + (e.price * e.count)

        goods.push([
                        (e.price * e.count),
                        { text: e.title, color: 'gray' },
                        { text: e.count + ' шт.', color: 'gray' }
                    ])

    })

    let document = {
        content: [
            { text: 'Заказ #' + order_number.value, style: 'header' },
            { text: new Date().toLocaleString(), style: 'subheader' },
            {
                style: 'tableExample',
                table: {
                    widths: [50, '*', 100],
                    body: goods
                }
            },
            { text: `К оплате: ${price} ${ordersStore.config.currency.bage}`, style: 'subheader' }
        ],
        styles: {
            header: {
                fontSize: 24,
                bold: true,
            },
            subheader: {
                fontSize: 16,
                bold: true,
                margin: [0, 10, 0, 10]
            },
            tableExample: {
                margin: [0, 5, 0, 15]
            }
        }
        
    }

    if (ordersStore.config.mode === 'store') {
        if (Object.entries(initDataUnsafe).length > 0) {
            showMainButtonProgress()

            const invoice = {
                provider_token: pay_token,
                start_parametr: 'get_access',
                title: `Заказ #${order_number.value}`,
                description: 'Здесь должно быть описание, но его нет..',
                currency: ordersStore.config.currency.slug,
                prices: basketStore.orders.map((item) => ({
                    label: `${item.title} х${item.count}`,
                    amount: (item.price * item.count * 100).toFixed(0)
                })),
                payload: order_number.value
            }

            await axios
                .post(
                    `https://api.telegram.org/bot${token}/createInvoiceLink`,
                    invoice
                )
                .then((response) => {
                    hideMainButtonProgress()
                    pay_link.value = response.data.result
                    openInvoice(response.data.result, closeInvoice)
                })
                .catch((error) => {
                    console.log(error)
                })
        }

        else {
            console.log('Режим Store доступен исключительно из клиента telegram')
        }
    } else {

        pdfMake.createPdf(document).getBlob().then(async (blob) => {
            let formData = new FormData()
            formData.append('document', blob, `Заказ #${order_number.value}.pdf`)

            // Формируем сообщение

            if (Object.entries(initDataUnsafe).length > 0) {
                let user_id = initDataUnsafe.user.id
                let first_name = initDataUnsafe.user.first_name

                let reply_from_admin = `Пользователь <a href='tg://user?id=${user_id}'>${first_name}</a> совершил заказ!`
                let reply = ordersStore.config.moderate_message ? ordersStore.config.moderate_message : `Благодарим за заказ! Вскоре с вами свяжется оператор, чтобы уточнить адрес доставки.`

                await ordersStore.createIncome({
                    order_number: order_number.value,
                    title: '',
                    goods: basketStore.orders,
                    note: comment.value,
                    user: initDataUnsafe,
                    status: 'created',
                    currency: conf.value.currency,
                    pay_link: pay_link.value
                })

                localStorage.removeItem('basket')

                await axios
                    .post(
                        `https://api.telegram.org/bot${token}/sendDocument?chat_id=${support_chat}&caption=${reply_from_admin}&parse_mode=HTML`, formData
                    )
                    .then((res) => {})
                    .catch((error) => console.log(error.response.data.description))

                await axios
                    .post(
                        `https://api.telegram.org/bot${token}/sendDocument?chat_id=${user_id}&caption=${reply}`, formData
                    )
                    .then((res) => {
                        
                    })
                    .catch((error) => console.log(error.response.data.description))

                close()

            } else {
                let test = ordersStore.config.moderate_message ? ordersStore.config.moderate_message : 'Тестовый заказ успешно создан!'

                await axios
                    .post(
                        `https://api.telegram.org/bot${token}/sendDocument?chat_id=${support_chat}&caption=${test}&parse_mode=HTML`, formData
                    )
                    .then((res) => console.log('Заказ успешно отправлен!'))
                    .catch((error) => console.log(error.response.data.description))

                await ordersStore.createIncome({
                    order_number: order_number.value,
                    title: 'browser',
                    goods: basketStore.orders,
                    note: comment.value,
                    user: null,
                    status: 'created',
                    currency: conf.value.currency,
                    pay_link: pay_link.value
                })
            }
        }, err => {
            console.error(err)
        })

    }

}

// Обрабатываем закрытие платежного окна

const closeInvoice = async (status) => {
    if (status == 'paid') {

        let goods = [
            ['Цена', 'Наименование', 'Количество']
        ]

        let price = 0

        basketStore.orders.forEach((e) => {
            price = price + (e.price * e.count)

            goods.push([
                (e.price * e.count),
                { text: e.title, color: 'gray' },
                { text: e.count + ' шт.', color: 'gray' }
            ])

            ordersStore.theProductIsSold(e._id, e.count)

        })

        let document = {
            content: [
                { text: 'Заказ #' + order_number.value, style: 'header' },
                { text: new Date().toLocaleString(), style: 'subheader' },
                {
                    style: 'tableExample',
                    table: {
                        widths: [50, '*', 100],
                        body: goods
                    }
                },
                { text: `Оплачено: ${price} ${ordersStore.config.currency.bage}`, style: 'subheader' }
            ],
            styles: {
                header: {
                    fontSize: 24,
                    bold: true,
                },
                subheader: {
                    fontSize: 16,
                    bold: true,
                    margin: [0, 10, 0, 10]
                },
                tableExample: {
                    margin: [0, 5, 0, 15]
                }
            }
            
        }

        pdfMake.createPdf(document).getBlob().then(async (blob) => {
            let formData = new FormData()
            formData.append('document', blob, `Заказ #${order_number.value}.pdf`)

            // Формируем сообщение
                let user_id = initDataUnsafe.user.id
                let first_name = initDataUnsafe.user.first_name

                let reply_from_admin = `Пользователь <a href='tg://user?id=${user_id}'>${first_name}</a> совершил заказ!`
                let reply = ordersStore.config.success_message ? ordersStore.config.success_message : `Заказ успешно оплачен!`

                await axios
                    .post(
                        `https://api.telegram.org/bot${token}/sendDocument?chat_id=${support_chat}&caption=${reply_from_admin}&parse_mode=HTML`, formData
                    )
                    .then((res) => {})
                    .catch((error) => console.log(error.response.data.description))

                await axios
                    .post(
                        `https://api.telegram.org/bot${token}/sendMessage?chat_id=${user_id}&text=${reply}`
                    )
                    .then((res) => {})
                    .catch((error) => console.log(error.response.data.description))

                await ordersStore.createIncome({
                    order_number: order_number.value,
                    title: '',
                    goods: basketStore.orders,
                    note: comment.value,
                    user: initDataUnsafe,
                    status: 'paid',
                    currency: conf.value.currency,
                    pay_link: pay_link.value
                })

                localStorage.removeItem('basket')

                close()
            
        }, err => {
            console.error(err)
        })
    } else if (status === 'window') {
        order_number.value = Math.random().toString().slice(2).substr(0, 4)

        if (Object.entries(initDataUnsafe).length > 0) {
            showMainButtonProgress()
        }

        const invoice = {
            provider_token: pay_token,
            start_parametr: 'get_access',
            title: `Заказ #${order_number.value}`,
            description: 'Здесь должно быть описание, но его нет..',
            currency: ordersStore.config.currency.slug,
            prices: basketStore.orders.map((item) => ({
                label: `${item.title} х${item.count}`,
                amount: (item.price * item.count * 100).toFixed(0)
            })),
            payload: order_number.value
        }

        await axios
            .post(
                `https://api.telegram.org/bot${token}/createInvoiceLink`,
                invoice
            )
            .then((response) => {
                hideMainButtonProgress()
                pay_link.value = response.data.result
                // openInvoice(response.data.result, closeInvoice)
            })
            .catch((error) => {
                console.log(error)
            })

        let ids = await ordersStore.createIncome({
            order_number: order_number.value,
            title: 'Новый заказ',
            goods: basketStore.orders,
            note: comment.value,
            user: initDataUnsafe,
            status: 'created',
            currency: conf.value.currency,
            pay_link: pay_link.value
        })

        if (Object.entries(initDataUnsafe).length > 0) {
            let user_id = initDataUnsafe?.user.id

            const reply = 'Ваш заказ создан и ожидает оплаты!'

            let markup = {
                    inline_keyboard: [
                        [
                            {
                                text: `Заказ #${order_number.value}`,
                                web_app: {url: `${domain}/order/${ids}`}
                            }
                        ]
                    ]
                }

            await axios
                .post(
                    `https://api.telegram.org/bot${token}/sendMessage`,
                    {
                        chat_id: user_id,
                        text: reply,
                        parse_mode: 'Markdown',
                        reply_markup: markup
                    }
                )
                .then((res) => window.location.replace('/order/' + ids))
                .catch((error) => console.log(error.response.data.description))

        }

    } else {
        let user_id = initDataUnsafe.user.id

        const reply = ordersStore.config.error_message ? ordersStore.config.error_message : 'Заказ был отменен!'

        let ids = await ordersStore.createIncome({
            order_number: order_number.value,
            title: 'Новый заказ',
            goods: basketStore.orders,
            note: comment.value,
            user: initDataUnsafe,
            status: 'cancelled',
            currency: conf.value.currency,
            pay_link: pay_link.value
        })

        let markup = {
                    inline_keyboard: [
                        [
                            {
                                text: `Заказ #${order_number.value}`,
                                web_app: {url: `${domain}/order/${ids}`}
                            }
                        ]
                    ]
                }

        await axios
            .post(
                `https://api.telegram.org/bot${token}/sendMessage`,
                {
                    chat_id: user_id,
                    text: reply,
                    parse_mode: 'Markdown',
                    reply_markup: markup
                }
            )
            .then((res) => {})
            .catch((error) => console.log(error.response.data.description))

        close()
    }
}

</script>

<template>

    <BackButton
        v-if="basketOpened && Object.entries(initDataUnsafe).length > 0"
        @click="backClick"
    />

    <MainButton 
        v-if="basketStore.orders ? basketStore.orders.length > 0 : false && Object.entries(initDataUnsafe).length > 0 && !ordersStore.loading"
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

    <transition name="slide-fade" :duration="100">
    <nav 
    v-show="!ordersStore.loading && !basketOpened"
    :class="Object.entries(initDataUnsafe).length > 0 ? 'bottom-8' : 'bottom-16'"
    class="fixed z-20 flex flex-col gap-y-2 justify-center items-center p-4 !pb-0 gap-x-2 overflow-x-auto whitespace-nowrap w-[440px] max-[440px]:w-full">
        <transition name="slide-fade">
            <span 
                v-if="selectTag !== '' && selectOpened"
                @click="() => {
                    selectTag = ''
                    selectOpened = false
                }"
                class="flex z-10 px-3 py-1 text-sm font-medium rounded-full border-2 cursor-pointer hover:opacity-75"
                :style="tg_style('secondary_bg_color')"
                ><span
                    :style="tg_style('text_color')"
                >Все товары</span>
            </span>
        </transition>
        <transition-group name="slide-fade">
        <span 
            v-if="selectOpened"
            @click="() => {
                if (selectTag === tag.title) {
                    selectTag = ''
                    selectOpened = false
                } else {
                    selectTag = tag.title
                    selectOpened = false
                }
            }"
            v-for="tag in ordersStore.tags"
            :key="tag._id + '-' + tag.title"
            :style="tg_style('secondary_bg_color')"
            class="flex px-3 z-10 py-1 text-sm font-medium bg-white rounded-full border-2 cursor-pointer hover:opacity-75">
            <span
            :style="tg_style('text_color')"
            >{{ tag.title }}</span>
        </span>
        </transition-group>

        <span
        @click="() => selectOpened = !selectOpened"
        :style="conf.color ? {'background-color': conf.color} : {'background-color': '#FF9800'}"
        class="flex z-20 gap-x-2 px-5 py-2 text-sm font-medium rounded-full text-white cursor-pointer hover:opacity-75"
        >
        {{ selectTag ? selectTag : 'Все товары'  }}</span>
    </nav>
    </transition>

    <transition name="fade" :duration="100">
        <main
            v-show="!basketOpened"
            class="grid grid-cols-3 gap-4 w-[440px] max-[440px]:w-full p-4">

            <Indicator 
                v-if="ordersStore.loading"
                v-for="indicator, index in 6"
                :key="index"
            />

            <Product
                v-if="!ordersStore.loading"
                v-for="order in queryResults"
                :key="order._id"
                :order="order"
                :conf="conf"
            />

        </main>
    </transition>

    <transition name="slide-fade" :duration="300">
        <section v-show="basketOpened"
            :style="tg_style('secondary_bg_color')"
            class="w-[440px] max-[440px]:w-full min-h-screen">

            <div 
            :style="tg_style('bg_color')"
            class="p-5 flex justify-between items-center font-bold">
                <h2 
                :style="tg_style('text_color')"
                class="uppercase text-lg">
                    Ваш заказ
                </h2>

                <button 
                @click="backClick"
                class="text-green-500 font-semibold hover:opacity-90">
                    Изменить
                </button>
            </div>

            <div v-if="basketStore.orders ? basketStore.orders.length > 0 : false"
                :style="tg_style('bg_color')"
                class="px-5 pb-5 flex flex-col gap-y-4">

                <Product_inBasket
                    v-for="order in basketStore.orders"
                    :key="order._id"
                    :order="order"
                    :conf="conf"
                />

            </div>

            <div class="flex flex-col mt-5">

                <input
                    @keyup.enter="(e) => e.target.blur()"
                    type="text"
                    placeholder="Добавьте комментарий..."
                    v-model="comment"
                    :style="tg_style('bg_color')"
                    class="w-full px-5 py-3 text-base outline-none"
                />

                <span 
                :style="tg_style('hint_color')"
                class="px-5 py-3 text-sm">
                    Ваши пожелания, детали заказа.
                </span>

            </div>

            <div class="flex flex-col px-4 w-full gap-y-2">
                <div class="flex flex-col bg-blue-500 rounded-xl p-4 w-full hover:opacity-90">
                    <span class="font-medium text-lg text-white">Данные тестовой карты:</span>
                    <span class="font-medium text-white">Номер карты: 4111 1111 1111 1111</span>
                    <div class="flex gap-x-2">
                        <span class="font-medium text-white">2024/12</span>
                        <span class="font-medium text-white">123</span>
                    </div>
                    <span class="font-medium text-white">3DS: 12345678</span>
                </div>
            </div>

            <div
            v-if="conf.ton"
            class="flex flex-col justify-center items-center py-2 px-4 gap-y-2">
                <div 
                :style="tg_style('hint_color')"
                class="text-md">Вы так же можете</div>
                <button 
                @click="() => closeInvoice('window')"
                class="flex bg-blue-500 items-center px-5 py-3 gap-x-2 border-2 rounded-xl hover:opacity-75">
                    <img
                        class="w-8 border-2 rounded-full"
                        src="../../assets/ton.svg"
                        alt="ton"
                    />
                    <span class="text-white font-medium">Оплатить через TON</span>
                </button>
            </div>
        </section>
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

.slide-fade-enter-active {
    transition: all 0.3s
}

.slide-fade-leave-active {
    transition: all 0.3s
}

.slide-fade-enter-from, .slide-fade-leave-to {
    transform: translateY(100%);
    opacity: 0
}

</style>