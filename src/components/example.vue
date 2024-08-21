<template>
  <div class="container mx-auto p-4">
    <!-- Breadcrumb navigation remains the same -->

    <div class="flex flex-col lg:flex-row gap-6">
      <!-- Left section (payment information) - 2/3 width -->
      <div class="w-full lg:w-2/3">
        <div class="bg-white rounded-lg shadow-md p-6">
          <payment-method-selector 
            :saved-methods="savedPaymentMethods"
            :default-address="defaultAddress"
            @method-selected="handleMethodSelected"
            @new-method-added="handleNewMethodAdded"
            @method-updated="handleMethodUpdated"
            :allow-one-time-payment="true"
          />
        </div>
      </div>

      <!-- Right section (credit summary) - 1/3 width -->
      <div class="w-full lg:w-1/3">
        <payment-summary 
          v-model:amount="amountToAdd"
          :available-credit="currentBalance"
          :selected-payment-method="selectedPaymentMethod"
          @process-payment="handleAddCredit"
          :is-add-credit="true"
          :fees="fees"
        />
      </div>
    </div>

    <!-- Payment Note Modal remains the same -->
  </div>
</template>

<script>
import { ref, watch } from 'vue';
import PaymentMethodSelector from './PaymentMethodSelector.vue';
import PaymentSummary from './PaymentSummary.vue';
import PaymentNoteModal from './PaymentNoteModal.vue';

export default {
  name: 'AddCredit',
  components: {
    PaymentMethodSelector,
    PaymentSummary,
    PaymentNoteModal,
  },
  setup() {
    const savedPaymentMethods = ref([]);
    const selectedPaymentMethod = ref(null);
    const defaultAddress = ref({
      // ... default address details ...
    });
    const amountToAdd = ref(0);
    const currentBalance = ref(100.00); // This should be fetched from your backend
    const isNoteModalOpen = ref(false);
    const fees = ref([
      { id: 1, name: 'Processing Fee', amount: 0, type: 'percentage', value: 2.9 },
      { id: 2, name: 'Fixed Fee', amount: 0.30, type: 'fixed' },
    ]);

    const handleMethodSelected = (method) => {
      selectedPaymentMethod.value = method;
    };

    const handleNewMethodAdded = (newMethod) => {
      if (newMethod.save) {
        savedPaymentMethods.value.push(newMethod);
      }
      selectedPaymentMethod.value = newMethod;
    };

    const handleMethodUpdated = (updatedMethod) => {
      const index = savedPaymentMethods.value.findIndex(m => m.id === updatedMethod.id);
      if (index !== -1) {
        savedPaymentMethods.value[index] = updatedMethod;
      }
    };

    const handleAddCredit = (paymentDetails) => {
      console.log('Adding credit:', paymentDetails);
      isNoteModalOpen.value = true;
    };

    const closeNoteModal = () => {
      isNoteModalOpen.value = false;
    };

    const processAddCreditWithNote = (note) => {
      console.log('Adding credit:', amountToAdd.value, 'with note:', note);
      console.log('Payment method:', selectedPaymentMethod.value);
      // Implement your credit adding logic here
      closeNoteModal();
    };

    return {
      savedPaymentMethods,
      selectedPaymentMethod,
      defaultAddress,
      amountToAdd,
      currentBalance,
      isNoteModalOpen,
      fees,
      handleMethodSelected,
      handleNewMethodAdded,
      handleMethodUpdated,
      handleAddCredit,
      closeNoteModal,
      processAddCreditWithNote,
    };
  }
};
</script>