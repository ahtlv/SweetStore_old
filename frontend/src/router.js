import { createRouter, createWebHistory } from 'vue-router'
import Index from './pages/public/Index.vue'
import Detailed from './pages/public/Detailed.vue'
import Order from './pages/public/Order.vue'

export default createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            component: Index,
            name: 'Index'
        },
        {
            path: '/detailed/:id?',
            component: Detailed,
            name: 'Detailed'
        },
        {
            path: '/order/:id?',
            component: Order,
            name: 'Order'
        },
        {
            path: '/panel',
            component: () => import('./pages/dashboard/Products.vue'),
            name: 'Products'
        },
        {
            path: '/panel/product_set/:id?',
            component: () => import('./pages/dashboard/Products_editor.vue'),
            name: 'Product_set'
        },
        {
            path: '/panel/categories',
            component: () => import('./pages/dashboard/Сategories.vue'),
            name: 'Categories'
        },
        {
            path: '/panel/category_set',
            component: () => import('./pages/dashboard/Categories_editor.vue'),
            name: 'Category_set'
        },
        {
            path: '/panel/orders',
            component: () => import('./pages/dashboard/Orders.vue'),
            name: 'Orders'
        },
        {
            path: '/panel/feedback/',
            component: () => import('./pages/dashboard/Feedback.vue'),
            name: 'Feedback'
        },
        {
            path: '/panel/settings/',
            component: () => import('./pages/dashboard/Settings.vue'),
            name: 'Settings'
        }
    ]
})
