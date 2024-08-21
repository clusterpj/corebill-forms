<template>
  <div class="container mx-auto p-4">
    <nav class="text-sm mb-4 flex items-center">
      <span class="text-gray-500">Home</span>
      <chevron-right-icon class="inline-block w-4 h-4 mx-1" />
      <span class="text-gray-500">Invoices</span>
      <chevron-right-icon class="inline-block w-4 h-4 mx-1" />
      <span class="font-semibold">Pay Invoice</span>
    </nav>

    <h1 class="text-2xl font-bold mb-6">Pay Invoice</h1>

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

      <!-- ID Verification Checkbox -->
    <div class="mt-4 bg-white rounded-lg shadow-md p-4">
      <label class="flex items-center space-x-2">
        <input type="checkbox" v-model="requireIdVerification" class="form-checkbox">
        <span>Require ID Verification</span>
      </label>
    </div>

    <!-- ID Verification Modal -->
    <id-verification-modal
      v-if="showIdVerificationModal"
      @close="closeIdVerificationModal"
      @verification-complete="handleVerificationComplete"
      @cancel="closeIdVerificationModal"
    />

      <!-- Right section (invoices and payment summary) - 1/3 width -->
      <div class="w-full lg:w-1/3 space-y-6">
        <!-- Invoices section -->
        <div class="bg-white rounded-lg shadow-md p-4">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-semibold">Select Invoices to Pay</h2>
            <select v-model="invoiceFilter" class="text-sm p-1 border rounded">
              <option value="all">All</option>
              <option value="sent">Sent</option>
              <option value="due">Due</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
          
          <!-- Scrollable invoice list -->
          <div class="space-y-2 max-h-40 overflow-y-auto">
            <div v-for="(invoice, index) in filteredInvoices" :key="invoice.id" 
                 :class="['flex items-center p-2 text-sm hover:bg-gray-100', index % 2 === 0 ? 'bg-gray-50' : '']">
              <input type="checkbox" :id="invoice.id" v-model="invoice.selected" class="mr-2" @change="updateTotalDue">
              <label :for="invoice.id" class="flex-grow">{{ invoice.id }}</label>
              <span class="font-semibold mr-2">${{ invoice.amount.toFixed(2) }}</span>
              <span :class="getStatusClass(invoice.status)">{{ invoice.status }}</span>
            </div>
          </div>
        </div>

        <!-- Payment Summary Section -->
        <pay-invoice-summary 
          :subtotal="totalDue"
          :available-credit="availableCredit"
          :selected-payment-method="selectedPaymentMethod"
          @process-payment="showConfirmationModal"
          :fees="fees"
          :taxes="taxes"
        />
      </div>
    </div>

    <!-- Confirmation Modal -->
    <teleport to="body">
      <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div class="bg-white p-6 rounded-lg max-w-sm w-full">
          <h3 class="text-lg font-semibold mb-4">Confirm Invoice Payment</h3>
          <div class="space-y-2 mb-4">
            <p class="flex justify-between">
              <span>Subtotal:</span>
              <span class="font-medium">${{ formatCurrency(paymentDetails.subtotal) }}</span>
            </p>
            <p class="flex justify-between">
              <span>Fees:</span>
              <span class="font-medium">${{ formatCurrency(paymentDetails.fees) }}</span>
            </p>
            <p class="flex justify-between">
              <span>Taxes:</span>
              <span class="font-medium">${{ formatCurrency(paymentDetails.taxes) }}</span>
            </p>
            <p class="flex justify-between">
              <span>Credit Applied:</span>
              <span class="font-medium">-${{ formatCurrency(paymentDetails.creditApplied) }}</span>
            </p>
            <p class="flex justify-between">
              <span>Payment Method:</span>
              <span class="font-medium">{{ getPaymentMethodDisplay(paymentDetails.paymentMethod) }}</span>
            </p>
            <p class="flex justify-between text-lg font-semibold border-t pt-2">
              <span>Total charge:</span>
              <span>${{ formatCurrency(paymentDetails.amountToPay) }}</span>
            </p>
          </div>
          <p class="mb-4">Are you sure you want to proceed with this payment?</p>
          <div class="flex justify-end space-x-3">
            <button @click="closeModal" class="px-4 py-2 border rounded-lg hover:bg-gray-100">
              Cancel
            </button>
            <button @click="confirmPayment" class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
              Confirm
            </button>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { ChevronRight } from 'lucide-vue';
import PaymentMethodSelector from './PaymentMethodSelector.vue';
import PayInvoiceSummary from './PayInvoiceSummary.vue';
// eslint-disable-next-line vue/no-unused-components
import IDVerificationModal from './IDVerificationModal.vue';

export default {
  components: {
    ChevronRightIcon: ChevronRight,
    PaymentMethodSelector,
    PayInvoiceSummary,
    IDVerificationModal,
  },
  setup() {
    const invoices = ref([
      { id: 'INV-001', amount: 50.00, selected: false, status: 'sent', dueDate: '2023-08-01' },
      { id: 'INV-002', amount: 75.00, selected: false, status: 'due', dueDate: '2023-07-15' },
      { id: 'INV-003', amount: 25.00, selected: false, status: 'overdue', dueDate: '2023-06-30' },
      { id: 'INV-004', amount: 100.00, selected: false, status: 'sent', dueDate: '2023-08-15' },
      { id: 'INV-005', amount: 60.00, selected: false, status: 'due', dueDate: '2023-07-25' },
    ]);
    const invoiceFilter = ref('all');
    const savedPaymentMethods = ref([]);
    const selectedPaymentMethod = ref(null);
    const defaultAddress = ref({
      id: 'default-address',
      line1: '123 Main St',
      line2: 'Apt 4B',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      country: 'United States',
    });
    const totalDue = ref(0);
    const availableCredit = ref(75.00); // You might want to fetch this from your API
    const fees = ref([
      { id: 1, name: 'Service Fee', amount: 5.00, type: 'fixed' },
      { id: 2, name: 'Processing Fee', amount: 0, type: 'percentage', value: 2.5 },
    ]);
    const taxes = ref(0);
    const showModal = ref(false);
    const paymentDetails = ref({});

    const filteredInvoices = computed(() => {
      if (invoiceFilter.value === 'all') {
        return invoices.value;
      }
      return invoices.value.filter(invoice => invoice.status === invoiceFilter.value);
    });

    const selectDueAndOverdueInvoices = () => {
      invoices.value.forEach(invoice => {
        if (invoice.status === 'due' || invoice.status === 'overdue') {
          invoice.selected = true;
        }
      });
      updateTotalDue();
    };

    onMounted(() => {
      selectDueAndOverdueInvoices();
    });

    const getStatusClass = (status) => {
      switch(status) {
        case 'sent': return 'text-blue-600';
        case 'due': return 'text-yellow-600';
        case 'overdue': return 'text-red-600';
        default: return '';
      }
    };

    const updateTotalDue = () => {
      totalDue.value = invoices.value
        .filter(invoice => invoice.selected)
        .reduce((total, invoice) => total + invoice.amount, 0);
    };

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

    const showConfirmationModal = (details) => {
      paymentDetails.value = details;
      showModal.value = true;
    };

    const closeIdVerificationModal = () => {
      showIdVerificationModal.value = false;
    };

    const handleVerificationComplete = () => {
      closeIdVerificationModal();
      showModal.value = true;
    };

    const closeModal = () => {
      showModal.value = false;
    };

    const confirmPayment = () => {
      processPayment();
      closeModal();
    };

    const processPayment = () => {
      console.log('Processing invoice payment:', paymentDetails.value);
      
      // Implement your payment processing logic here
      const selectedInvoices = invoices.value.filter(inv => inv.selected);
       
      // Simulate API call
      setTimeout(() => {
        // Apply credit if used
        if (paymentDetails.value.creditApplied > 0) {
          availableCredit.value -= paymentDetails.value.creditApplied;
          console.log(`Applied ${paymentDetails.value.creditApplied} from available credit`);
        }

        // Process remaining amount with selected payment method
        if (paymentDetails.value.amountToPay > 0) {
          console.log(`Charging ${paymentDetails.value.amountToPay} to ${paymentDetails.value.paymentMethod.type}`);
        }

        // Update invoice statuses
        selectedInvoices.forEach(invoice => {
          invoice.status = 'paid';
          invoice.selected = false;
        });

        // Reset total due
        totalDue.value = 0;

        // Show success message (you might want to use a proper notification system)
        alert('Invoice payment processed successfully!');
      }, 1000);
    };

    const formatCurrency = (value) => {
      return (Math.round(value * 100) / 100).toFixed(2);
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

    return {
      invoices,
      invoiceFilter,
      savedPaymentMethods,
      selectedPaymentMethod,
      defaultAddress,
      totalDue,
      availableCredit,
      fees,
      taxes,
      filteredInvoices,
      showModal,
      paymentDetails,
      getStatusClass,
      updateTotalDue,
      handleMethodSelected,
      handleNewMethodAdded,
      handleMethodUpdated,
      showConfirmationModal,
      closeModal,
      confirmPayment,
      formatCurrency,
      getPaymentMethodDisplay,
      requireIdVerification,
      showIdVerificationModal,
      closeIdVerificationModal,
      handleVerificationComplete,
    };
  },
};
</script>