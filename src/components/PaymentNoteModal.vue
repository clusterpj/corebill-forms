<template>
    <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 class="text-xl font-semibold mb-4">Add a Note to Your Payment</h2>
        <textarea
          v-model="note"
          class="w-full h-32 p-2 border rounded mb-4"
          placeholder="Enter your payment note here (optional)"
        ></textarea>
        <div class="flex justify-end space-x-3">
          <button @click="cancel" class="px-4 py-2 border rounded-lg">Cancel</button>
          <button @click="confirm" class="px-4 py-2 bg-blue-500 text-white rounded-lg">Confirm Payment</button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref } from 'vue';
  
  export default {
    name: 'PaymentNoteModal',
    props: {
      isOpen: Boolean,
    },
    emits: ['confirm', 'cancel'],
    setup(props, { emit }) {
      const note = ref('');
  
      const confirm = () => {
        emit('confirm', note.value);
        note.value = ''; // Reset the note after confirming
      };
  
      const cancel = () => {
        emit('cancel');
        note.value = ''; // Reset the note after canceling
      };
  
      return {
        note,
        confirm,
        cancel,
      };
    },
  };
  </script>