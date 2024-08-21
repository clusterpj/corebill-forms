<template>
  <div id="app">
    <nav class="bg-gray-800 p-4">
      <div class="container mx-auto flex justify-between items-center">
        <router-link to="/" class="text-white font-bold">Home</router-link>
        <div class="space-x-4">
          <router-link to="/pay-invoice" class="text-white hover:text-gray-300">Pay Invoice</router-link>
          <router-link to="/add-credit" class="text-white hover:text-gray-300">Add Credit</router-link>
          <!-- Add more navigation links here as you create new components -->
        </div>
      </div>
    </nav>
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
/* You can add any global styles here */
</style>