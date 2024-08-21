<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-6">Project Components</h1>
    <nav class="space-y-2">
      <router-link 
        v-for="route in routes" 
        :key="route.path" 
        :to="route.path" 
        class="block p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300"
      >
        {{ route.name }}
      </router-link>
    </nav>
  </div>
</template>

<script>
export default {
  name: 'HomePage',
  data() {
    return {
      routes: [
        { path: '/pay-invoice', name: 'Pay Invoice' },
        { path: '/add-credit', name: 'Add Credit' },
        // Add more routes here as you create new components
      ]
    }
  }
}
</script>