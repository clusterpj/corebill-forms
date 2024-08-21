<template>
  <div class="container mx-auto p-4">
    <nav class="text-sm mb-4 flex items-center">
      <span class="text-gray-500">Home</span>
      <chevron-right-icon class="inline-block w-4 h-4 mx-1" />
      <span class="text-gray-500">Account</span>
      <chevron-right-icon class="inline-block w-4 h-4 mx-1" />
      <span class="font-semibold">Add Credit</span>
    </nav>

    <h1 class="text-2xl font-bold mb-6">Add Credit to Your Account</h1>

    <!-- Current Credit Balance -->
    <div class="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-6">
      <p class="font-bold">Current Credit Balance: ${{ formatCurrency(currentBalance) }}</p>
    </div>

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
        <!-- ID Verification Checkbox -->
    <div class="mt-4 bg-white rounded-lg shadow-md p-4">
      <label class="flex items-center space-x-2">
        <input type="checkbox" v-model="requireIdVerification" class="form-checkbox">
        <span>Require ID Verification</span>
      </label>
    </div>
      </div>

      <!-- Right section (credit summary and history) - 1/3 width -->
      <div class="w-full lg:w-1/3">
        <!-- New: Recent Credit History -->
        <div class="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 class="text-xl font-semibold mb-4">Recent Credit History</h2>
          <div v-if="creditHistory.length > 0" class="space-y-2">
            <div v-for="(entry, index) in creditHistory" :key="index" class="flex justify-between items-center p-2 bg-gray-100 rounded">
              <span>{{ formatDate(entry.date) }}</span>
              <span class="font-medium">${{ formatCurrency(entry.amount) }}</span>
            </div>
          </div>
          <p v-else class="text-gray-500">No recent credit additions</p>
        </div>

        <!-- New: Quick Add -->
        <div class="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 class="text-xl font-semibold mb-4">Quick Add</h2>
          <div class="flex space-x-2">
            <button
              v-for="amount in [10, 25, 50, 100]"
              :key="amount"
              @click="quickAddCredit(amount)"
              class="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition duration-200"
            >
              ${{ amount }}
            </button>
          </div>
        </div>

        <!-- Credit Summary -->
        <payment-summary 
          :amount="amountToAdd"
          @update:amount="updateAmount"
          :available-credit="currentBalance"
          :selected-payment-method="selectedPaymentMethod"
          @process-payment="handleAddCredit"
          :is-add-credit="true"
          :fees="fees"
          :require-id-verification="requireIdVerification"
        />
      </div>
    </div>

    <!-- Payment Note Modal -->
    <payment-note-modal
      :is-open="isNoteModalOpen"
      @confirm="processAddCreditWithNote"
      @cancel="closeNoteModal"
    />

    <!-- ID Verification Modal -->
    <id-verification-modal
      v-if="showIdVerificationModal"
      @close="closeIdVerificationModal"
      @verification-complete="handleVerificationComplete"
      @cancel="closeIdVerificationModal"
    />
  </div>
</template>

<script>
import { ref, reactive } from 'vue';
import PaymentMethodSelector from './PaymentMethodSelector.vue';
import PaymentSummary from './PaymentSummary.vue';
import PaymentNoteModal from './PaymentNoteModal.vue';
import { ChevronRight as ChevronRightIcon } from 'lucide-vue';

// Import the component asynchronously
const IDVerificationModal = defineAsyncComponent(() => import('./IDVerificationModal.vue'));

export default {
  name: 'AddCredit',
  components: {
    PaymentMethodSelector,
    PaymentSummary,
    PaymentNoteModal,
    ChevronRightIcon,
    IDVerificationModal, // Register the component
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
    const fees = reactive([
      { id: 1, name: 'Processing Fee', amount: 0, type: 'percentage', value: 2.9 },
      { id: 2, name: 'Fixed Fee', amount: 0.30, type: 'fixed' },
    ]);

    const creditHistory = ref([
      { date: new Date(2023, 7, 1), amount: 50 },
      { date: new Date(2023, 6, 15), amount: 100 },
      { date: new Date(2023, 6, 1), amount: 25 },
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

    const requireIdVerification = ref(false);
    const showIdVerificationModal = ref(false);

    const handleAddCredit = (paymentDetails) => {
      console.log('Adding credit:', paymentDetails);
      if (requireIdVerification.value) {
        showIdVerificationModal.value = true;
      } else {
        isNoteModalOpen.value = true;
      }
    };

    const closeIdVerificationModal = () => {
      showIdVerificationModal.value = false;
    };

    const handleVerificationComplete = () => {
      closeIdVerificationModal();
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

    const updateAmount = (newAmount) => {
      amountToAdd.value = newAmount;
    };

    const formatCurrency = (value) => {
      return value.toFixed(2);
    };

    const formatDate = (date) => {
      return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(date);
    };

    const quickAddCredit = (amount) => {
      amountToAdd.value = amount;
    };

    return {
      savedPaymentMethods,
      selectedPaymentMethod,
      defaultAddress,
      amountToAdd,
      currentBalance,
      isNoteModalOpen,
      fees,
      creditHistory,
      requireIdVerification,
      showIdVerificationModal,
      handleMethodSelected,
      handleNewMethodAdded,
      handleMethodUpdated,
      handleAddCredit,
      closeNoteModal,
      closeIdVerificationModal,
      handleVerificationComplete,
      processAddCreditWithNote,
      updateAmount,
      formatCurrency,
      formatDate,
      quickAddCredit,
      IDVerificationModal,
    };
  }
};
</script>