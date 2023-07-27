import {
    ref,
    watch
} from 'vue'

import { 
    defineStore
} from "pinia"

export const useBasketStore = defineStore('basketStore', ()  => {

    // Определяем локальное хранилище корзины товаров

    let orders = ref([]) //  Товары в корзине
    const ordersInLocalStorage = localStorage.getItem("basket")
    if (ordersInLocalStorage) orders.value = JSON.parse(ordersInLocalStorage)._value

    // Следим за обновлением корзины и в случае изменения ее содержимого обновляем локальное хранилище

    watch(() => orders, (state) => {
        localStorage.setItem("basket", JSON.stringify(state))
    }, {deep: true})

    // Добавляем товары в корзину в соответствии с их наличием

    const addOrderToBasket = (order) => {
        const ProductInTheCart = orders.value.find(el => el._id === order._id)

        if (ProductInTheCart) {
            const idx = orders.value.findIndex((el) => el._id === order._id)

            if (order.availability === true) {
                orders.value[idx].count++
            }

            else if (order.availability > 0) {
                if (orders.value[idx].count < order.availability) {
                    orders.value[idx].count++
                }
            }
        } else {
            orders.value.push({...order, count: 1})
        }
    }

    // Удаляем товары из корзины

    const removeOrderInBasket = (order) => {
        const ProductInTheCart = orders.value.find(el => el._id === order._id)

        if (ProductInTheCart) {
            const idx = orders.value.findIndex((el) => el._id === order._id)

            if (orders.value[idx].count > 1) {
                orders.value[idx].count--
            } else {
                orders.value = orders.value.filter(el => el._id !== order._id)
            }
        }
    }

    return {
        orders,
        addOrderToBasket, removeOrderInBasket
    }
})