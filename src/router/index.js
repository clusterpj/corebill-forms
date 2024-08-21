import Vue from 'vue'
import VueRouter from 'vue-router'
import HomePage from '../components/HomePage.vue'
import PayInvoicePage from '../components/PayInvoicePage.vue'
import AddCredit from '../components/AddCredit.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'HomePage',
    component: HomePage
  },
  {
    path: '/pay-invoice',
    name: 'PayInvoice',
    component: PayInvoicePage
  },
  {
    path: '/add-credit',
    name: 'AddCredit',
    component: AddCredit
  },
  // Add more routes here as you create new components
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router