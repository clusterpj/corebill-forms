<template>
  <div class="pay-invoice-summary bg-white rounded-lg shadow-md p-6">
    <h2 class="text-xl font-semibold mb-6">Invoice Payment Summary</h2>
    <div class="space-y-4">
      <!-- Subtotal -->
      <div class="flex justify-between items-center">
        <span class="text-gray-600">Subtotal</span>
        <span class="font-medium">${{ formatCurrency(subtotal) }}</span>
      </div>

      <!-- Fees -->
      <div v-if="fees.length > 0" class="space-y-2">
        <div v-for="fee in fees" :key="fee.id" class="flex justify-between items-center text-sm">
          <span class="text-gray-600">{{ fee.name }}</span>
          <span class="font-medium">${{ formatCurrency(calculateFee(fee)) }}</span>
        </div>
      </div>

      <!-- Taxes -->
      <div v-if="taxes > 0" class="flex justify-between items-center">
        <span class="text-gray-600">Taxes</span>
        <span class="font-medium">${{ formatCurrency(taxes) }}</span>
      </div>

      <!-- Total -->
      <div class="flex justify-between items-center text-lg font-semibold pt-2 border-t">
        <span>Total Due</span>
        <span>${{ formatCurrency(totalDue) }}</span>
      </div>

      <!-- Available Credit -->
      <div v-if="availableCredit > 0" class="mt-4">
        <h3 class="font-semibold mb-2">Apply Credit</h3>
        <div class="space-y-2">
          <label class="flex items-center">
            <input type="radio" v-model="creditOption" value="none" class="mr-2">
            <span>Don't apply credit</span>
          </label>
          <label class="flex items-center">
            <input type="radio" v-model="creditOption" value="all" class="mr-2">
            <span>Apply all available credit (${{ formatCurrency(availableCredit) }})</span>
          </label>
          <label class="flex items-center">
            <input type="radio" v-model="creditOption" value="custom" class="mr-2">
            <span>Apply custom amount</span>
          </label>
          <div v-if="creditOption === 'custom'" class="ml-6 mt-2">
            <input
              type="number"
              v-model.number="customCreditAmount"
              :max="availableCredit"
              min="0"
              step="0.01"
              class="w-full p-2 border rounded"
              @input="updateCustomCredit"
            >
          </div>
        </div>
      </div>

      <!-- Credit Applied -->
      <div v-if="creditToApply > 0" class="flex justify-between items-center text-green-600">
        <span>Credit Applied</span>
        <span>-${{ formatCurrency(creditToApply) }}</span>
      </div>

      <!-- Amount to Pay -->
      <div class="flex justify-between items-center text-lg font-semibold pt-2 border-t">
        <span>Amount to Pay</span>
        <span>${{ formatCurrency(amountToPay) }}</span>
      </div>

      <!-- Selected Payment Method -->
      <div v-if="selectedPaymentMethod" class="mt-4">
        <h3 class="font-semibold mb-2">Payment Method</h3>
        <div class="p-3 border rounded-lg">
          <div v-if="selectedPaymentMethod.type === 'card'" class="flex items-center">
            <credit-card-icon class="w-6 h-6 mr-2" />
            {{ selectedPaymentMethod.cardBrand }} ending in {{ selectedPaymentMethod.last4 }}
          </div>
          <div v-else-if="selectedPaymentMethod.type === 'ach'" class="flex items-center">
            <landmark-icon class="w-6 h-6 mr-2" />
            ACH Account ending in {{ selectedPaymentMethod.last4 }}
          </div>
          <div v-else-if="selectedPaymentMethod.type === 'paypal'" class="flex items-center">
            <paypal-icon class="w-6 h-6 mr-2" />
            PayPal
          </div>
          <div v-else-if="selectedPaymentMethod.type === 'stripe'" class="flex items-center">
            <stripe-icon class="w-6 h-6 mr-2" />
            Stripe
          </div>
        </div>
      </div>

      <!-- Action Button -->
      <button 
        @click="processPayment" 
        class="w-full bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition duration-200 text-lg font-medium mt-4"
        :disabled="!selectedPaymentMethod || amountToPay <= 0"
      >
        Pay Invoice
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue';
import { CreditCard as CreditCardIcon, Landmark as LandmarkIcon } from 'lucide-vue';

// Mock icons for PayPal and Stripe
const PaypalIcon = {
  template: '<svg><!-- PayPal icon SVG code --></svg>'
};
const StripeIcon = {
  template: '<svg><!-- Stripe icon SVG code --></svg>'
};

export default {
  name: 'PayInvoiceSummary',
  components: {
    CreditCardIcon,
    LandmarkIcon,
    PaypalIcon,
    StripeIcon
  },
  props: {
    subtotal: {
      type: Number,
      required: true
    },
    fees: {
      type: Array,
      default: () => []
    },
    taxes: {
      type: Number,
      default: 0
    },
    availableCredit: {
      type: Number,
      default: 0
    },
    selectedPaymentMethod: {
      type: Object,
      default: null
    }
  },
  emits: ['process-payment'],
  setup(props, { emit }) {
    const creditOption = ref('none');
    const customCreditAmount = ref(0);
    const creditToApply = ref(0);

    const calculateFee = (fee) => {
      if (fee.type === 'percentage') {
        return props.subtotal * (fee.value / 100);
      } else if (fee.type === 'fixed') {
        return fee.amount;
      }
      return 0;
    };

    const totalFees = computed(() => {
      return props.fees.reduce((total, fee) => total + calculateFee(fee), 0);
    });

    const totalDue = computed(() => {
      return props.subtotal + totalFees.value + props.taxes;
    });

    const amountToPay = computed(() => {
      return Math.max(0, totalDue.value - creditToApply.value);
    });

    const formatCurrency = (value) => {
      return (Math.round(value * 100) / 100).toFixed(2);
    };

    const updateCustomCredit = () => {
      if (customCreditAmount.value > props.availableCredit) {
        customCreditAmount.value = props.availableCredit;
      }
      if (customCreditAmount.value > totalDue.value) {
        customCreditAmount.value = totalDue.value;
      }
    };

    watch(creditOption, (newValue) => {
      if (newValue === 'none') {
        creditToApply.value = 0;
      } else if (newValue === 'all') {
        creditToApply.value = Math.min(props.availableCredit, totalDue.value);
      } else if (newValue === 'custom') {
        creditToApply.value = customCreditAmount.value;
      }
    });

    watch(customCreditAmount, (newValue) => {
      if (creditOption.value === 'custom') {
        creditToApply.value = newValue;
      }
    });

    const processPayment = () => {
      emit('process-payment', {
        subtotal: props.subtotal,
        fees: totalFees.value,
        taxes: props.taxes,
        creditApplied: creditToApply.value,
        totalDue: totalDue.value,
        amountToPay: amountToPay.value,
        paymentMethod: props.selectedPaymentMethod
      });
    };

    return {
      creditOption,
      customCreditAmount,
      creditToApply,
      totalDue,
      amountToPay,
      formatCurrency,
      calculateFee,
      updateCustomCredit,
      processPayment
    };
  }
};
</script>