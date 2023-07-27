import { host } from '../config.json'
import {
    ref,
    onMounted
} from 'vue'
import { defineStore } from "pinia"
import axios from 'axios'

export const useOrdersStore = defineStore('ordersStore', ()  => {

    // Отображение загрузочного экрана

    const loading = ref(true)

    // Инициализация товаров

    const orders = ref([])
    const tags = ref([])
    const users = ref([])

    const incoming = ref([])
    const config = ref({
        mode: 'default'
    })

    // 

    const getСonfig = async () => {
        loading.value = true
        
        let req = await axios
            .get(host + '/config/1')
            .then((res) => {
                config.value = res.data[0]
                loading.value = false
                return res.data[0]
            })
            .catch((error) => {
                console.log('Loading data is fail!')
                console.log(error)
            })

        return req
    }

    // Функция загрузки заявок с сервера

    const getIncome = async (page) => {
        loading.value = true
        
        const res = await axios
            .get(host + '/incoming/' + page)
            .then((res) => {
                incoming.value = res.data
                return res.data
            })
            .catch((error) => {
                console.log('Loading data is fail!')
                console.log(error)
            })
            .finally(() => {
                loading.value = false
            })

        return res
    }

    // Функция загрузки товаров с сервера

    const getOrders = async (page) => {
        loading.value = true
        
        await axios
            .get(host + '/orders/' + page)
            .then((res) => {
                orders.value = res.data
                loading.value = false
            })
            .catch((error) => {
                console.log('Loading data is fail!')
                console.log(error)
            })
    }

    // Функция загрузки пользователей с сервера

    const getUsers = async (page) => {
        loading.value = true
        
        await axios
            .get(host + '/users/' + page)
            .then((res) => {
                users.value = res.data
                loading.value = false
            })
            .catch((error) => {
                console.log('Loading data is fail!')
                console.log(error)
            })
    }

    // Загрузка категорий

    const getTags = async (page) => {
        loading.value = true
        
        await axios
            .get(host + '/tags/' + page)
            .then((res) => {
                tags.value = res.data
                loading.value = false
            })
            .catch((error) => {
                console.log('Loading data is fail!')
                console.log(error)
            })
    }

    // Загрузка отдельного товара

    const separateProduct = ref({})

    const getOrder = (id) => {
        loading.value = true
        
        axios
            .get(host + '/orders/' + id)
            .then((res) => {
                separateProduct.value = res.data
                loading.value = false
            })
            .catch((error) => {
                console.log('Loading data is fail!')
                console.log(error)
            })
    }

    // Новый income

    const createIncome = async (income) => {

        const template = {
            order_number: income.order_number,
            title: income.title,
            goods: income.goods,
            note: income.note,
            user: income.user,
            date: new Date().toLocaleString(),
            status: income.status,
            currency: income.currency,
            pay_link: income.pay_link,
            tonCourse: income.tonCourse
        }

        let ids = await axios
            .post(host + '/incoming', template)
            .then((res) => {
                incoming.value.push({
                    _id: res.data.insertedIds[0],
                    ...template
                })

                return res.data.insertedIds[0]
            })
            .catch((error) => {
                console.log('Adding income to Mongo is fail!')
                console.log(error)
            })

        return ids
    }

    // Наличие и продажи

    const theProductIsSold = async (id, count) => {
        const order = orders.value.find(el => el._id === id)

        await axios
            .patch(host + '/orders/' + id, { 
                sale: order.sale + count,
                availability: order.availability === true ? true : order.availability - count
            })
            .then((res) => {
                
            })
            .catch((error) => {
                console.log('Set sold is fail!')
                console.log(error)
            })
    }

    // Изменение статуса заказа

    const setIncomeStatus = async (id, status) => {
        const income = incoming.value.find(el => el._id == id)

        await axios
            .patch(host + '/incoming/' + id, { status: status })
            .then((res) => {
                income.status = status
            })
            .catch((error) => {
                console.log('Set status is fail!')
                console.log(error)
            })
    }

    const setIncomeStatusFromOrder = async (id, status) => {
        // const income = incoming.value.find(el => el._id == id)

        await axios
            .patch(host + '/incoming/' + id, { status: status })
            .then((res) => {
                // income.status = status
            })
            .catch((error) => {
                console.log('Set status is fail!')
                console.log(error)
            })
    }

    const setColor = async (id, color) => {

        await axios
            .patch(host + '/config/' + id, { 
                color: color
             })
            .then((res) => {
                console.log('success setting message')
            })
            .catch((error) => {
                console.log('Set color is fail!')
                console.log(error)
            })
    }

    const setCurrency = async (id, curr) => {

        await axios
            .patch(host + '/config/' + id, { 
                currency: curr
             })
            .then((res) => {
                console.log('success setting message')
            })
            .catch((error) => {
                console.log('Set currency is fail!')
                console.log(error)
            })
    }

    const setConfigMode = async (id, mode) => {

        await axios
            .patch(host + '/config/' + id, { 
                mode: mode
             })
            .then((res) => {
                console.log('success setting message')
            })
            .catch((error) => {
                console.log('Set mode is fail!')
                console.log(error)
            })
    }

    const setTon = async (id, mode) => {

        await axios
            .patch(host + '/config/' + id, { 
                ton: mode
             })
            .then((res) => {
                console.log('success setting message')
            })
            .catch((error) => {
                console.log('Set ton is fail!')
                console.log(error)
            })
    }

    const setMessageText = async (id, messageGroup) => {

        await axios
            .patch(host + '/config/' + id, { 
                success_message: messageGroup.success_message,
                error_message: messageGroup.error_message,
                moderate_message: messageGroup.moderate_message
             })
            .then((res) => {
                console.log('success setting message')
            })
            .catch((error) => {
                console.log('Set status is fail!')
                console.log(error)
            })
    }

    // Добавление категории

    const createTag = async (tag) => {

        await axios
            .post(host + '/tags', {
                title: tag.value
            })
            .then((res) => {
                tags.value.push({
                    _id: res.data.insertedIds[0],
                    title: tag
                })
            })
            .catch((error) => {
                console.log('Adding tag to Mongo is fail!')
                console.log(error)
            })
    }

    const photoUploaded = ref(false)
    const uploaded = ref(false)

    // Добавление нового товара
    
    const createOrder = async (order) => {

        let data = new FormData()
        for ( let i = 0; i < order.image.length; i++ ){
            data.append('image', order.image[i])
        }
        
        // Инициализация пути к картинкам на сервере

        let path = []

        // Предварительная загрузка картинок

        await axios
            .post(host + '/upload', data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            .then((res) => {
                for ( let i = 0; i < res.data.data.length; i++ ){ 

                    path.push({
                        url: host + '/images/' + res.data.data[i].name,
                        obj: {
                            name: res.data.data[i].name
                        }
                    })

                }

                photoUploaded.value = true
            })
            .catch((error) => {
                console.log('Uploading image is fail!')
                console.log(error)
            })

        // Добавление товара на сервер

        const newOrder = {
            title: order.title,
            description: order.description,
            price:  order.price,
            availability:  order.availability,
            addons: order.addons,
            sale: 0
        }

        await axios
            .post(host + '/orders', {
                image: path,
                ...newOrder
            })
            .then((res) => {
                orders.value.push({
                    _id: res.data.insertedIds[0],
                    image: path,
                    ...newOrder
                })

                uploaded.value = true
            })
            .catch((error) => {
                console.log('Adding order to Mongo is fail!')
                console.log(error)
            })
    }

    // Удаление категории

    const deleteTag = async (id) => {
        await axios
            .delete(host + '/tags/' + id)
            .then((res) => {
                tags.value = tags.value.filter(el => el._id !== id)
            })
            .catch((error) => {
                console.log('Delete tag in Mongo to crash!')
                console.log(error)
            })
    }

    // Удаление товара

    const deleteOrder = async (id) => {
        await axios
            .delete(host + '/orders/' + id)
            .then((res) => {
                orders.value = orders.value.filter(el => el._id !== id)
            })
            .catch((error) => {
                console.log('Delete order in Mongo to crash!')
                console.log(error)
            })
    }

    // Изменение наличия товара

    const setAvailability = async (id, availability) => {
        const order = orders.value.find(el => el._id == id)

        await axios
            .patch(host + '/orders/' + id, { availability: availability })
            .then((res) => {
                order.availability = availability
            })
            .catch((error) => {
                console.log('Set availability is fail!')
                console.log(error)
            })
    }

    // Редактирование товара

    const editOrder = async (id, order) => {
        const idx = orders.value.findIndex((el) => el._id === id)

        let path = []

        // Проверяем были ли загружены картинки на сервер, если да - вернем строку где указан путь до картинки

        for ( let i = 0; i < order.image.length; i++ ){ 

            if (order.image[i].hasOwnProperty('url')) {
                path.push({
                    url: order.image[i].url,
                    obj: {
                        name: order.image[i].obj.name
                    }
                })
            } else {
                let data = new FormData()
                data.append('image', order.image[i] )

                await axios
                    .post(host + '/upload', data, {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    })
                    .then((res) => {
                        path.push({
                            url: host + '/images/' + res.data.data[0].name,
                            obj: {
                                name: res.data.data[0].name
                            }
                        })

                        photoUploaded.value = true
                    })
                    .catch((error) => {
                        console.log('Uploading photo in crash!')
                        console.log(error)
                    })
            }

        }

        const settedOrder = {
            title: order.title,
            description: order.description,
            price:  order.price,
            availability:  order.availability,
            addons: order.addons,
            sale: order.sale
        }

        await axios
            .patch(host + '/orders/' + id, {
                image: path,
                ...settedOrder
            })
            .then((res) => {
                orders.value.splice(idx, 1, {
                _id: id, 
                image: path,
                ...settedOrder
                })

                uploaded.value = true
            })
            .catch((error) => {
                console.log('Setted order is fail!')
                console.log(error)
            })
    }

    return {
        loading,
        orders,
        separateProduct,
        getOrder, getOrders,
        createOrder, deleteOrder,
        setAvailability,
        getTags, tags, deleteTag, createTag,
        editOrder, uploaded, photoUploaded,
        getIncome, incoming,
        createIncome, setIncomeStatus, setIncomeStatusFromOrder,
        config, getСonfig, setMessageText, setConfigMode,
        theProductIsSold,
        getUsers, users, setCurrency,
        setColor, setTon
    }
})