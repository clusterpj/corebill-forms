<template>
  <div class="address-manager">
    <div v-if="defaultAddress">
      <h3 class="font-semibold mb-2">Default Billing Address:</h3>
      <p>{{ formatAddress(defaultAddress) }}</p>
      <button @click="editDefaultAddress" class="text-blue-500 underline mt-2">Edit</button>
    </div>
    
    <div v-if="isEditing" class="mt-4 space-y-4">
      <div>
        <label for="addressLine1" class="block mb-1">Address Line 1</label>
        <input id="addressLine1" v-model="editingAddress.line1" type="text" class="w-full p-2 border rounded">
      </div>
      <div>
        <label for="addressLine2" class="block mb-1">Address Line 2</label>
        <input id="addressLine2" v-model="editingAddress.line2" type="text" class="w-full p-2 border rounded">
      </div>
      <div>
        <label for="addressCity" class="block mb-1">City</label>
        <input id="addressCity" v-model="editingAddress.city" type="text" class="w-full p-2 border rounded">
      </div>
      <div>
        <label for="addressState" class="block mb-1">State</label>
        <input id="addressState" v-model="editingAddress.state" type="text" class="w-full p-2 border rounded">
      </div>
      <div>
        <label for="addressZip" class="block mb-1">ZIP Code</label>
        <input id="addressZip" v-model="editingAddress.zip" type="text" class="w-full p-2 border rounded">
      </div>
      <div>
        <label for="addressCountry" class="block mb-1">Country</label>
        <input id="addressCountry" v-model="editingAddress.country" type="text" class="w-full p-2 border rounded">
      </div>
      <div class="flex justify-end space-x-3">
        <button @click="cancelEdit" class="px-4 py-2 border rounded-lg">Cancel</button>
        <button @click="saveAddress" class="px-4 py-2 bg-blue-500 text-white rounded-lg">Save Address</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue';

export default {
  name: 'AddressManager',
  props: {
    defaultAddress: {
      type: Object,
      default: null,
    },
  },
  emits: ['address-updated'],
  setup(props, { emit }) {
    const isEditing = ref(false);
    const editingAddress = reactive({...props.defaultAddress});

    const formatAddress = (address) => {
      return `${address.line1}, ${address.city}, ${address.state} ${address.zip}, ${address.country}`;
    };

    const editDefaultAddress = () => {
      isEditing.value = true;
    };

    const cancelEdit = () => {
      isEditing.value = false;
      Object.assign(editingAddress, props.defaultAddress);
    };

    const saveAddress = () => {
      emit('address-updated', {...editingAddress});
      isEditing.value = false;
    };

    return {
      isEditing,
      editingAddress,
      formatAddress,
      editDefaultAddress,
      cancelEdit,
      saveAddress,
    };
  },
};
</script>