<script setup>

import { onMounted, reactive, ref } from 'vue'
import { useOrdersStore } from '../../stores/Orders'
import { useRoute, useRouter } from 'vue-router'
import { host } from '../../config.json'
import axios from 'axios'
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
    hideMainButtonProgress,
    setMainButtonText
} = useWebAppMainButton()

const { showAlert } = useWebAppPopup()

const {
    hideBackButton
} = useWebAppBackButton()

const {
    initDataUnsafe
} = useWebApp()

const ordersStore = useOrdersStore()

const route = useRoute()
const router = useRouter()

const id = route.params.id

const mainButtonText = ref('Добавить')
const good = ref(null)

const conf = ref({
    currency: {
        bage: null,
        slug: null
    }
})

onMounted(async () => {
    conf.value = await ordersStore.getСonfig(1)

    if (id) {
        mainButtonText.value = 'Обновить'
        setMainButtonText(mainButtonText.value)
        await axios
            .get(host + '/orders/' + id)
            .then((res) => {
                good.value = res.data

                order.image = good.value.image
                order.title = good.value.title
                order.description = good.value.description
                order.price = good.value.price
                order.availability = good.value.availability
                order.addons = good.value.addons
                order.sale = good.value.sale

                images.path = good.value.image
            })
            .catch((error) => {
                console.log('Loading data is fail!')
                console.log(error)
            })
        
    }

    await ordersStore.getTags(1)
})

const backClick = () => {
    if (Object.entries(initDataUnsafe).length > 0) {
        hideBackButton()
        window.history.length > 1 ? router.go(-1) : router.push({name: 'Products'})
    }
}

const order = reactive({
    image: [],
    title: '',
    description: '',
    price: '',
    availability: true,
    addons: [],
    sale: 0
})

const images = reactive({
    path: []
})

// Проверка на активную категорию

const inTags = (tag) => {
    if (order.addons.includes(tag)) {
        return true
    }
}

// Добавление или удаление категории

const setTags = (tag) => {
    if (order.addons.find(selectedTag => selectedTag === tag.title)) {
        order.addons = order.addons.filter((selectedTag) => selectedTag !== tag.title)
    } else {
        order.addons.push(tag.title)
    }
}

// Добавление фото

const uploadFile = (e) => {

    const files = e.target.files
    let newFiles = []
    let newPreviewFiles = []

    for ( let i = 0; i < files.length; i++ ){

        if (order.image.length < 5) {

            const check = (el) => {
                if (el.hasOwnProperty('obj')) {
                        if (el.obj.name === files[i].name) {
                            return true
                        }
                } else {
                    if (el.name === files[i].name) {
                        return true
                    }
                }
            }

            if (order.image.find(check)) {

                console.log('Файл с таким именем уже загружен')

            } else {
                const file = files[i]
                newFiles.push(file)

                newPreviewFiles.push(
                    {
                        url: URL.createObjectURL(file),
                        obj: file
                    }
                )

            }

        }
        
    }

    order.image = order.image.concat(newFiles)
    images.path = images.path.concat(newPreviewFiles)

}

// Удаление фото

const deletePreview = (e) => {
    images.path = images.path.filter(el => el.url !== e.url)

    const check = (el) => {
        if (el.hasOwnProperty('obj')) {
                if (el.obj.name !== e.obj.name) {
                    return el
                }
        } else {
            if (el.name !== e.obj.name) {
                return el
            }
        }
    }

    order.image = order.image.filter(check)
}

// Загрузка товара на сервер

const createOrder = async () => {
    if (order.title === '') {
        if (Object.entries(initDataUnsafe).length > 0) {
            showAlert('Название товара не указано')
            return
        } else {
            alert('Название товара не указано')
            return
        }
    }
    if (order.description === '') {
        if (Object.entries(initDataUnsafe).length > 0) {
            showAlert('Описание товара не заполнено')
            return
        } else {
            alert('Описание товара не заполнено')
            return
        }
    }
    if (order.price === '') {
        if (Object.entries(initDataUnsafe).length > 0) {
            showAlert('Цена товара не указана')
            return
        } else {
            alert('Цена товара не указана')
            return
        }
    }
    if (order.image.length < 1) {
        if (Object.entries(initDataUnsafe).length > 0) {
            showAlert('Изображение товара не добалено')
            return
        } else {
            alert('Изображение товара не добалено')
            return
        }
    }

    else
    showMainButtonProgress()
    await ordersStore.createOrder(order)
    hideMainButtonProgress()
    backButtonClick()
}

const editOrder = async () => {
    if (order.title === '') {
        if (Object.entries(initDataUnsafe).length > 0) {
            showAlert('Название товара не указано')
            return
        } else {
            alert('Название товара не указано')
            return
        }
    }
    if (order.description === '') {
        if (Object.entries(initDataUnsafe).length > 0) {
            showAlert('Описание товара не заполнено')
            return
        } else {
            alert('Описание товара не заполнено')
            return
        }
    }
    if (order.price === '') {
        if (Object.entries(initDataUnsafe).length > 0) {
            showAlert('Цена товара не указана')
            return
        } else {
            alert('Цена товара не указана')
            return
        }
    }
    if (order.image.length < 1) {
        if (Object.entries(initDataUnsafe).length > 0) {
            showAlert('Изображение товара не добавлено')
            return
        } else {
            alert('Изображение товара не добавлено')
            return
        }
    }

    else
    showMainButtonProgress()
    await ordersStore.editOrder(id, order)
    hideMainButtonProgress()
    backButtonClick()
}

const backButtonClick = () => {
    window.history.length > 1 ? router.go(-1) : router.push({name: 'Products'})
}

const mainButonClick = () => {
    if (id) {
        editOrder()
    } else {
        createOrder()
    }
}

</script>

<template>
    <BackButton
        v-if="Object.entries(initDataUnsafe).length > 0"
        @click="backClick"
    />

    <MainButton v-if="Object.entries(initDataUnsafe).length > 0"
        :text='mainButtonText'
        color="#4CAF50"
        @click="mainButonClick()"
    />

    <button v-if="!Object.entries(initDataUnsafe).length > 0"
        @click="mainButonClick()"
        class="flex z-10 fixed bottom-0 bg-green-500 px-5 py-3 w-[440px] max-[440px]:w-full justify-center items-center text-white font-medium hover:opacity-90"
        >
            {{ mainButtonText }}
    </button>
    
    <div 
    :class="Object.entries(initDataUnsafe).length > 0 ? 'pb-4' : 'pb-16'"
    class="flex flex-col w-[440px] max-[440px]:w-full">

            <transition name="fade" appear>
            <div 
            v-if="!ordersStore.loading"
            class="flex flex-col w-full gap-y-2">

                <div 
                :style="tg_style('text_color')"
                class="text-lg font-medium px-4 pt-2">Укажите название товара</div>

                <div class="flex flex-col gap-y-2">
                    <input 
                        @keyup.enter="(e) => e.target.blur()"
                        v-model="order.title"
                        :style="tg_style('input')"
                        class="text-sm px-5 py-3 outline-none"
                        type="text"
                        placeholder="Название товара"
                    />
                </div>

                <div 
                :style="tg_style('text_color')"
                class="text-md font-medium px-4">Описание товара</div>

                <div class="flex flex-col">
                    <resize-textarea
                    placeholder="Описание"
                    :value="order.description"
                    v-model="order.description"
                    :style="tg_style('input')"
                    class="text-sm !px-5 !py-3 outline-none"
                    >
                    </resize-textarea>
                </div>

                <div class="flex overflow-x-auto gap-x-2 whitespace-nowrap">
                    <span
                        v-for="tag in ordersStore.tags"
                        :key="tag._id"
                        :class="{'!border-green-500' : inTags(tag.title)}"
                        :style="tg_style('text_color')"
                        class="px-3 py-1 flex border-2 border-slate-300 text-sm font-medium cursor-pointer hover:opacity-80"
                        @click="setTags(tag)"
                    >
                        {{ tag.title }}
                    </span>
                </div>

                <div class="flex flex-col gap-y-2">
                    <div 
                    @click="() => {
                        if (order.availability === true) {
                            order.availability = false
                        } else
                        if (order.availability === false) {
                            order.availability = true
                        } else {
                            order.availability = true
                        }
                    }"
                    class="flex gap-x-2 items-center cursor-pointer hover:opacity-90">
                        <span 
                        :style="tg_style('secondary_bg_color')"
                        class="flex justify-center items-center w-10 h-10">
                        <span 
                        v-if="order.availability === true"
                            :style="tg_style('bg_text_color')"
                            class="w-2 h-2 rounded-full"
                        />
                        </span>
                        <span 
                        :style="tg_style('hint_color')"
                        class="font-medium text-sm">Количество товара не ограничено</span>
                    </div>
                    <input 
                        v-if="order.availability !== true"
                        @keyup.enter="(e) => e.target.blur()"
                        v-model="order.availability"
                        :style="tg_style('input')"
                        class="text-sm px-5 py-3 outline-none"
                        type="number"
                        placeholder="Количество товара"
                    />
                </div>
                
                <div

                class="flex">
                    <span class="bg-green-500 flex justify-center items-center px-5 py-3 text-sm font-semibold text-white">
                        {{ conf.currency.bage }}
                    </span>

                    <input 
                        @keyup.enter="(e) => e.target.blur()"
                        v-model="order.price"
                        :style="tg_style('input')"
                        class="w-full text-sm px-5 py-3 outline-none"
                        type="number"
                        placeholder="Цена товара"
                    />
                </div>

                <div class="grid grid-cols-3 gap-2" id="photoGroup">
                    <div 
                    v-for="photo, index in images.path"
                    :key="index"
                    :style="tg_style('secondary_bg_color')"
                    class="flex flex-col justify-center items-center px-3 w-full h-32 cursor-pointer hover:opacity-75 overflow-hidden relative">
                        <div 
                        class="flex flex-col gap-y-2 justify-center items-center">
                            <img 
                                class="w-2/3"
                                :src="photo.url ? photo.url : photo"
                                alt="photo"
                            />
                        </div>
                        <span 
                        @click="deletePreview(photo)"
                        class="absolute w-full flex justify-center items-center bg-black opacity-0 h-full hover:opacity-50 transition-all">
                            <img 
                                class="w-10"
                                src="../../assets/trash.svg"
                                alt="trash"
                            />
                        </span>
                    </div>

                <label v-if="order.image.length < 5">
                    <input
                        name="images"
                        accept="image/*"
                        type="file"
                        class="hidden"
                        @change="uploadFile"
                        multiple
                    />

                        <div 
                        :style="tg_style('secondary_bg_color')"
                        class="flex flex-col justify-center items-center px-3 w-full h-32 cursor-pointer hover:opacity-75 overflow-hidden">
                            <div 
                            class="flex flex-col gap-y-2 justify-center items-center">
                                <img 
                                    class="w-10"
                                    src="../../assets/pic.svg"
                                    alt="icon_upload"
                                />

                                <span 
                                :style="tg_style('text_color')"
                                class="text-xs text-center font-medium">Загрузить фото</span>
                            </div>
                        </div>
                </label>
                </div>

                <div 
                v-if="id"
                class="flex w-full justify-center">
                    <button 
                        @click="() => {
                            ordersStore.deleteOrder(id)
                            backButtonClick()
                        }"
                        class="flex rounded-full gap-x-2 text-sm justify-center items-center bg-red-500 text-white font-semibold text-md px-5 py-3 outline-none text-center hover:opacity-90"
                    >
                        Удалить товар
                        <img 
                            class="w-4"
                            src="../../assets/trash.svg"
                            alt="icon_trash"
                        />
                    </button>
                </div>
            </div>
            </transition>

    </div>
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