<script setup>

import { tg_style } from '../../components/func/ThemeParams'
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Indicator from '../../components/public/DetailedLoadingIndicator.vue'
import { useOrdersStore } from '../../stores/Orders'
import axios from 'axios'

import {
    token, host, support_chat, ton_wallet, ton_api, support, domain
} from '../../config.json'

import { 
    useWebAppMainButton,
    useWebApp,
    useWebAppNavigation,
    useWebAppPopup,
    useWebAppBackButton,
} from "vue-tg"

import pdfMake from "pdfmake/build/pdfmake"
import pdfFonts from "pdfmake/build/vfs_fonts"

const { 
    hideMainButton
} = useWebAppMainButton()

const {
    hideBackButton,
    isBackButtonVisible
} = useWebAppBackButton()

const { openInvoice } = useWebAppNavigation()

const route = useRoute()

const modalVisible = ref(false)

const ordersStore = useOrdersStore()

const id = route.params.id

const select_pay_service = ref('card')
const conf = ref({})

onMounted( async () => {
    await ordersStore.getIncome(id)
    conf.value = await ordersStore.getСonfig()
    if (ordersStore.incoming.status === 'paid') {
        hideMainButton()
    }

    pdfMake.addVirtualFileSystem(pdfFonts)
    if (isBackButtonVisible) {
        hideBackButton()
    }

    ton.value =  await setTonPrice(ordersStore.incoming.currency.slug)
} )

const {
    close,
    initDataUnsafe
} = useWebApp()

const ton = ref(0)
const priceInTon = ref(0)

const setTonPrice = async (currency) => {
    let course = await axios
        .get(host + `/the-open-network?currency=${currency}`)
        .then((res) => {
            return res.data
        })
        .catch((ex) => console.log(ex))

    return course
}

const finally_price = computed(() => {

    let price = 0

    if (ordersStore.incoming?.goods) {
        ordersStore.incoming.goods.forEach((i) => {
            price = price + ( i.price * i.count )
        })
    }

    let delivery = 0

    let total = price + delivery

    priceInTon.value = (total / ton.value)

    return { price, total }

})

const mainButtonClick = () => {
    console.log('main')
}

const find_transaction = async (value, comment) => {
    const MAINNET_API_BASE = "https://toncenter.com/api/v2/"

        await axios
            .get(`${MAINNET_API_BASE}getTransactions?address=${ton_wallet}&limit=30&to_lt=0&archival=true&api_key=${ton_api}`)
            .then((req) => {
                let transactions = req.data.result
                for (let i = 0; i < transactions.length; i++) {
                    let msg = transactions[i].in_msg
                    if (msg.value == value && msg.message == comment) {
                        console.log('transactions is find!')
                        closeInvoice('paid')
                        break
                    }
                }

            })
            .catch((error) => {
                console.log(error)
            })
    
}

const closeInvoice = async (status) => {
    if (status === 'paid') {
        let goods = [
            ['Цена', 'Наименование', 'Количество']
        ]

        let price = 0

        ordersStore.incoming.goods.forEach((e) => {
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
                { text: 'Заказ #' + ordersStore.incoming.order_number, style: 'header' },
                { text: ordersStore.incoming.date, style: 'subheader' },
                {
                    style: 'tableExample',
                    table: {
                        widths: [50, '*', 100],
                        body: goods
                    }
                },
                { text: `Оплачено: ${price} ${ordersStore.incoming.currency.bage}`, style: 'subheader' }
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
            formData.append('document', blob, `Заказ #${ordersStore.incoming.order_number}.pdf`)

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

                await ordersStore.setIncomeStatusFromOrder(ordersStore.incoming._id, 'paid')

                localStorage.removeItem('basket')

                close()
            
        }, err => {
            console.error(err)
        })
    }
}

const pay = () => {
    if (Object.entries(initDataUnsafe).length > 0){
        openInvoice(ordersStore.incoming.pay_link, closeInvoice)
    }else{  
        console.log('Нативные платежи доступны исключительно из telegram')
    }
}

const copyText = (type) => {
    if (type === 'ton') {
        navigator.clipboard.writeText(priceInTon.value)
    }
    if (type === 'wallet') {
        navigator.clipboard.writeText(ton_wallet)
    }
    if (type === 'comment') {
        navigator.clipboard.writeText(ordersStore.incoming.order_number)
    }

}

</script>

<template>

    <main class="grid w-[440px] max-[440px]:w-full p-4">

        <Indicator 
            v-if="ordersStore.loading"
        />

        <section
        v-else
        id="order" class="flex flex-col gap-y-3">
            <div 
            :style="tg_style('text_color')"
            class="font-semibold text-xl">Заказ #{{ ordersStore.incoming.order_number }}</div>

            <router-link
                v-for="order in ordersStore.incoming.goods"
                :key="order._id"
                :to="'/detailed/' + order._id"
                :style="tg_style('secondary_bg_color')"
                class="p-2 rounded-xl noted hover:opacity-75"
            >
                <div class="flex justify-between items-center">
                    <div class="flex items-center gap-x-5">
                        <img
                            class="w-16"
                            :src="order.image[0].url"
                            alt="image"
                        />

                        <div class="flex flex-col gap-y-2">
                            <div>
                                <strong 
                                :style="tg_style('text_color')"
                                class="font-semibold">{{ order.title.slice(0, 16) }}</strong>
                            </div>
                        </div>
                    </div>

                    <div 
                    :style="tg_style('text_color')"
                    class="font-semibold">
                        {{ order.count }}х
                    </div>

                    <div class="flex flex-col items-end gap-y-6">
                        <strong
                        :style="tg_style('text_color')"
                        >{{ order.price * order.count }} {{ ordersStore.incoming.currency.bage }}</strong>
                    </div>
                </div>
            </router-link>

            <div class="flex justify-between">
                <div 
                :style="tg_style('text_color')"
                class="font-semibold text-lg">Всего</div>
                <div
                :style="tg_style('text_color')"
                class="font-semibold text-lg">{{ finally_price.price }} {{ ordersStore.incoming.currency.bage }}</div>
            </div>

            <div 
            v-if="ordersStore.incoming.status === 'paid'"
            class="bg-green-200 text-center p-3 rounded-lg font-medium text-green-900 cursor-pointer hover:opacity-90 noted">
                Заказ успешно оплачен
            </div>

            <div 
            v-else
            class="bg-red-200 text-center p-3 rounded-lg font-medium text-red-900 cursor-pointer hover:opacity-90 noted">
                Заказ не оплачен!
            </div>

            <div class="flex flex-col gap-y-3">
                <div class="flex flex-col gap-y-3">
                    <div 
                    :style="tg_style('text_color')"
                    class="font-medium text-lg">Доступные способы оплаты</div>

                    <div class="flex justify-between items-center">
                        <div class="flex items-center gap-x-3">
                            <div 
                            :style="tg_style('secondary_bg_color')"
                            class="flex justify-center items-center w-14 h-14 rounded-lg">
                                <img 
                                    class="w-8"
                                    src="../../assets/card.svg"
                                    alt="Icon Card"
                                />
                            </div>
                            <div>
                                <h4
                                :style="tg_style('text_color')"
                                >Банковская карта</h4>
                                <span class="text-sm font-semibold text-green-500">МИР, VISA, MASTERCARD</span>
                            </div>
                        </div>

                        <a 
                        v-if="ordersStore.incoming.status !== 'paid'"
                        :class="select_pay_service === 'card' ? 'bg-green-200' : 'bg-slate-200'"
                        class="flex justify-center w-28  py-2 rounded-lg hover:opacity-90 noted"
                        href="#"
                        @click="() => select_pay_service = 'card'"
                        >{{ select_pay_service === 'card' ? 'Выбрано' : 'Выбрать'}}</a>
                    </div>

                    <div
                    v-if="conf.ton"
                    class="flex justify-between items-center">
                        <div class="flex items-center gap-x-3">
                            <div 
                            :style="tg_style('secondary_bg_color')"
                            class="flex justify-center items-center w-14 h-14 rounded-lg">
                                <img 
                                    class="w-8"
                                    src="../../assets/ton.svg"
                                    alt="Ton"
                                />
                            </div>
                            <div>
                                <h4
                                :style="tg_style('text_color')"
                                >TON</h4>
                                <span class="text-sm font-semibold text-green-500">Криптовалюта</span>
                            </div>
                        </div>

                        <a 
                        v-if="ordersStore.incoming.status !== 'paid'"
                        :class="select_pay_service === 'ton' ? 'bg-green-200' : 'bg-slate-200'"
                        class="flex justify-center w-28 py-2 rounded-lg hover:opacity-90 noted"
                        href="#"
                        @click="() => {
                            select_pay_service = 'ton'
                            }"
                        >{{ select_pay_service === 'ton' ? 'Выбрано' : 'Выбрать'}}</a>
                    </div>
                </div>
            </div>

            <div class="flex justify-between">
                <div 
                :style="tg_style('text_color')"
                class="font-semibold text-xl">Итого</div>

                <div v-if="select_pay_service === 'ton'"
                    :style="tg_style('text_color')"
                    class="font-semibold text-xl">{{ priceInTon }} TON
                </div>

                <div 
                    v-else
                    :style="tg_style('text_color')"
                    class="font-semibold text-xl">{{ finally_price.total }} {{ ordersStore.incoming.currency.bage }}
                </div>

            </div>
        </section>

        <a 
        @click="() => {
            if (select_pay_service === 'card') {
                pay()
            } else {
                modalVisible = true
            }
        }"
        href="#" class="bg-green-500 flex justify-center py-3 rounded-lg uppercase font-semibold text-white hover:opacity-90 mt-3 noted">{{ ordersStore.incoming.status === 'paid' ? 'Повторить заказ' : 'Оплатить заказ'}}</a>
        <a 
        :style="tg_style('input')"
        :href="support" class="flex py-3 rounded-lg justify-center text-sm uppercase font-medium hover:opacity-90 mt-4 noted">Связаться с поддержкой</a>

        <div 
        v-if="modalVisible"
        class="fixed flex p-4 justify-center items-center top-0 left-0 right-0 bottom-0 bg-black bg-opacity-20">
            <div 
            :style="tg_style('secondary_bg_color')"
            class="flex px-5 flex-col gap-y-2 justify-center items-center rounded-xl w-full py-8">
                <img 
                    class="w-12"
                    src="../../assets/ton.svg"
                    alt="ton"
                />
                <h1 
                :style="tg_style('text_color')"
                class="font-bold text-xl">Оплата через Toncoin</h1>
                <span 
                :style="tg_style('text_color')"
                @click="copyText('wallet')"
                class="text-md font-medium break-all text-center cursor-pointer">{{ ton_wallet }}</span>
                <span
                :style="tg_style('text_color')"
                @click="copyText('ton')"
                >К оплате: <span class="font-semibold">{{ priceInTon }}</span></span>
                <span 
                :style="tg_style('text_color')"
                @click="copyText('comment')"
                class="text-center">Обязательно укажите комментарий к переводу: <span class="font-semibold">{{ ordersStore.incoming.order_number }}</span></span>

                <span 
                :style="tg_style('hint_color')"
                class="px-4 text-center">На этот адрес отправляйте только <b>Toncoin (TON)</b>. Другие монеты могут не дойти и будут утрачены.</span>
                <div class="flex flex-col px-4 gap-y-2">
                    <button 
                    @click="copyText('wallet')"
                    class="bg-green-500 text-white font-semibold px-5 py-2 rounded-xl hover:opacity-75">Копировать адрес</button>
                    <button 
                    @click="find_transaction(ton, ordersStore.incoming.order_number)"
                    class="bg-blue-500 text-white font-semibold px-5 py-2 rounded-xl hover:opacity-75">Подтвердить оплату</button>
                    <button 
                    @click="() => modalVisible = false"
                    class="bg-red-500 text-white font-semibold px-5 py-2 rounded-xl hover:opacity-75">Закрыть</button>
                </div>
            </div>
        </div>
    </main>
    
</template>