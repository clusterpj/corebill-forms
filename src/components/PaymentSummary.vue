<template>
  <div class="payment-summary">
    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-xl font-semibold mb-6">Credit Summary</h2>
      <div class="space-y-4">
        <!-- Amount to Add -->
        <div class="flex items-center justify-between">
          <label for="amountToAdd" class="text-lg font-medium text-gray-700">Amount to Add</label>
          <div class="relative rounded-md shadow-sm w-1/2">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span class="text-gray-500 sm:text-lg">$</span>
            </div>
            <input
              type="number"
              name="amountToAdd"
              id="amountToAdd"
              class="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-3 sm:text-lg border-gray-300 rounded-md text-right"
              placeholder="0.00"
              step="0.01"
              min="0"
              v-model="localAmount"
              @input="updateAmount"
            >
          </div>
        </div>

        <!-- Fees -->
        <div class="space-y-2">
          <div v-for="fee in fees" :key="fee.id" class="flex justify-between items-center text-sm">
            <span>{{ fee.name }}:</span>
            <span class="font-medium">${{ formatCurrency(calculateFee(fee)) }}</span>
          </div>
        </div>

        <!-- Selected Payment Method -->
        <div v-if="selectedPaymentMethod" class="flex justify-between items-center text-sm">
          <span>Payment Method:</span>
          <span class="font-medium">
            {{ getPaymentMethodDisplay(selectedPaymentMethod) }}
          </span>
        </div>

        <!-- Total Charge -->
        <div class="flex justify-between items-center font-semibold text-lg pt-2 border-t">
          <span>Total Charge:</span>
          <span>${{ formatCurrency(totalAmount) }}</span>
        </div>

        <!-- Action Button -->
        <button @click="processAction" 
                class="w-full bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition duration-200 text-lg font-medium"
                :disabled="!selectedPaymentMethod || totalAmount <= 0">
          {{ requireIdVerification ? 'ID Verification' : 'Add Credit' }}
        </button>
      </div>
    </div>

    <teleport to="body">
      <div v-if="showConfirmModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div class="bg-white p-6 rounded-lg max-w-sm w-full">
          <h3 class="text-lg font-semibold mb-4">Confirm Credit Addition</h3>
          <div class="space-y-2 mb-4">
            <p class="flex justify-between">
              <span>Credit to add:</span>
              <span class="font-medium">${{ formatCurrency(localAmount) }}</span>
            </p>
            <p class="flex justify-between">
              <span>Fees:</span>
              <span class="font-medium">${{ formatCurrency(totalFees) }}</span>
            </p>
            <p class="flex justify-between">
              <span>Payment Method:</span>
              <span class="font-medium">{{ getPaymentMethodDisplay(selectedPaymentMethod) }}</span>
            </p>
            <p class="flex justify-between text-lg font-semibold border-t pt-2">
              <span>Total charge:</span>
              <span>${{ formatCurrency(totalAmount) }}</span>
            </p>
          </div>
          <p class="mb-4">Are you sure you want to proceed with this transaction?</p>
          <div class="flex justify-end space-x-3">
            <button @click="showConfirmModal = false" class="px-4 py-2 border rounded-lg hover:bg-gray-100">
              Cancel
            </button>
            <button @click="confirmAddCredit" class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
              Confirm
            </button>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue';

export default {
  name: 'PaymentSummary',
  props: {
    amount: {
      type: Number,
      required: true
    },
    availableCredit: {
      type: Number,
      required: true
    },
    selectedPaymentMethod: {
      type: Object,
      default: null
    },
    isAddCredit: {
      type: Boolean,
      default: false
    },
    fees: {
      type: Array,
      default: () => []
    },
    requireIdVerification: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:amount', 'process-payment'],
  setup(props, { emit }) {
    const localAmount = ref(props.amount);
    const amountError = ref('');
    const showConfirmModal = ref(false);

    const calculateFee = (fee) => {
      if (fee.type === 'percentage') {
        return localAmount.value * (fee.value / 100);
      } else if (fee.type === 'fixed') {
        return fee.amount;
      }
      return 0;
    };

    const totalFees = computed(() => {
      return props.fees.reduce((total, fee) => total + calculateFee(fee), 0);
    });

    const totalAmount = computed(() => {
      return Number(localAmount.value) + totalFees.value;
    });

    const formatCurrency = (value) => {
      return (Math.round(value * 100) / 100).toFixed(2);
    };

    const updateAmount = () => {
      if (localAmount.value <= 0) {
        amountError.value = 'Amount must be greater than zero.';
      } else {
        amountError.value = '';
      }
      emit('update:amount', Number(localAmount.value));
    };

    const processAction = () => {
      if (localAmount.value <= 0) {
        amountError.value = 'Amount must be greater than zero.';
        return;
      }
      if (props.requireIdVerification) {
        emit('process-payment', {
          amount: Number(localAmount.value),
          fees: totalFees.value,
          totalCharge: totalAmount.value,
          paymentMethod: props.selectedPaymentMethod,
          requireIdVerification: true
        });
      } else {
        showConfirmModal.value = true;
      }
    };

    const confirmAddCredit = () => {
      showConfirmModal.value = false;
      emit('process-payment', {
        amount: Number(localAmount.value),
        fees: totalFees.value,
        totalCharge: totalAmount.value,
        paymentMethod: props.selectedPaymentMethod,
        requireIdVerification: false
      });
    };

    const getPaymentMethodDisplay = (method) => {
      if (!method) return 'Not selected';
      if (method.type === 'card') {
        return `${method.cardBrand} ending in ${method.last4}`;
      } else if (method.type === 'ach') {
        return `ACH Account ending in ${method.last4}`;
      } else {
        return method.type.charAt(0).toUpperCase() + method.type.slice(1);
      }
    };

    watch(() => props.amount, (newValue) => {
      localAmount.value = newValue;
    });

    return {
      localAmount,
      amountError,
      showConfirmModal,
      totalFees,
      totalAmount,
      formatCurrency,
      updateAmount,
      processAction,
      calculateFee,
      confirmAddCredit,
      getPaymentMethodDisplay
    };
  }
};
</script>

<style scoped>
input[type="number"] {
  -moz-appearance: textfield;
}
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>