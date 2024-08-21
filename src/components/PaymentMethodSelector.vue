<template>
  <div class="payment-method-selector">
    <h2 class="text-xl font-semibold mb-4">Payment Method</h2>
    
    <div v-if="allowOneTimePayment" class="mb-6">
      <div class="flex flex-col sm:flex-row gap-4">
        <button 
          @click="setPaymentType('oneTime')"
          class="flex-1 p-4 border rounded-lg text-center transition-colors duration-200 ease-in-out"
          :class="paymentType === 'oneTime' ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'"
        >
          <credit-card-icon class="w-6 h-6 mx-auto mb-2" />
          One-time Payment
        </button>
        <button 
          @click="setPaymentType('saved')"
          class="flex-1 p-4 border rounded-lg text-center transition-colors duration-200 ease-in-out"
          :class="paymentType === 'saved' ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'"
        >
          <save-icon class="w-6 h-6 mx-auto mb-2" />
          Use Saved Payment Method
        </button>
      </div>
    </div>

    <!-- Saved Payment Methods -->
    <div v-if="paymentType === 'saved' && savedMethods.length > 0" class="space-y-3 mb-4">
      <div v-for="method in savedMethods" :key="method.id" 
           class="flex flex-col p-3 border rounded-lg"
           :class="{ 'border-blue-500 bg-blue-50': selectedMethod === method.id }">
        <div class="flex items-center">
          <input type="radio" 
                 :id="method.id" 
                 :value="method.id" 
                 v-model="selectedMethod" 
                 class="mr-3"
                 @change="selectMethod(method.id)"
                 :aria-label="`Select ${method.type === 'card' ? 'credit card' : 'ACH account'} ending in ${method.last4}`">
          <label :for="method.id" class="flex-grow cursor-pointer">
            <span v-if="method.type === 'card'" class="flex items-center">
              <credit-card-icon class="w-6 h-6 mr-2" />
              {{ method.cardBrand }} ending in {{ method.last4 }}
            </span>
            <span v-else-if="method.type === 'ach'" class="flex items-center">
              <landmark-icon class="w-6 h-6 mr-2" />
              ACH Account ending in {{ method.last4 }}
            </span>
          </label>
        </div>
        <div v-if="method.billingAddress" class="ml-8 mt-2 text-sm text-gray-600">
          {{ formatAddress(method.billingAddress) }}
        </div>
      </div>
    </div>

    <!-- Add New Payment Method Button -->
    <button v-if="paymentType === 'saved' && !isAddingNew" @click="showNewMethodForm" 
            class="w-full bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded-lg shadow hover:bg-gray-200 transition duration-200">
      <plus-icon class="inline-block w-5 h-5 mr-2" />
      Add New Payment Method
    </button>

    <!-- New Payment Method Form -->
    <div v-if="isAddingNew || paymentType === 'oneTime'" class="mt-4">
      <div class="mb-4">
        <label for="newMethodType" class="block mb-2">Payment Method Type</label>
        <select id="newMethodType" v-model="newMethodType" class="w-full p-2 border rounded">
          <option value="card">Credit Card</option>
          <option value="ach">ACH Account</option>
          <option value="paypal">PayPal</option>
          <option value="stripe">Stripe</option>
        </select>
      </div>

      <!-- Credit Card Form -->
      <div v-if="newMethodType === 'card'" class="space-y-4">
        <div>
          <label for="cardholderName" class="block mb-1">Cardholder Name</label>
          <input id="cardholderName" v-model="newCard.cardholderName" type="text" class="w-full p-2 border rounded" placeholder="John Doe">
          <div v-if="formErrors.cardholderName" class="text-red-500 text-sm mt-1">{{ formErrors.cardholderName }}</div>
        </div>
        <div>
          <label for="cardNumber" class="block mb-1">Card Number</label>
          <input id="cardNumber" v-model="newCard.cardNumber" type="text" class="w-full p-2 border rounded" placeholder="1234 5678 9012 3456">
          <div v-if="formErrors.cardNumber" class="text-red-500 text-sm mt-1">{{ formErrors.cardNumber }}</div>
        </div>
        <div class="flex space-x-4">
          <div class="w-1/2">
            <label for="expirationDate" class="block mb-1">Expiration Date</label>
            <input id="expirationDate" v-model="newCard.expirationDate" type="text" class="w-full p-2 border rounded" placeholder="MM/YY">
            <div v-if="formErrors.expirationDate" class="text-red-500 text-sm mt-1">{{ formErrors.expirationDate }}</div>
          </div>
          <div class="w-1/2">
            <label for="cvv" class="block mb-1">CVV</label>
            <input id="cvv" v-model="newCard.cvv" type="text" class="w-full p-2 border rounded" placeholder="123">
            <div v-if="formErrors.cvv" class="text-red-500 text-sm mt-1">{{ formErrors.cvv }}</div>
          </div>
        </div>
      </div>

      <!-- ACH Account Form -->
      <div v-if="newMethodType === 'ach'" class="space-y-4">
        <div>
          <label for="accountHolderName" class="block mb-1">Account Holder Name</label>
          <input id="accountHolderName" v-model="newACH.accountHolderName" type="text" class="w-full p-2 border rounded" placeholder="John Doe">
          <div v-if="formErrors.accountHolderName" class="text-red-500 text-sm mt-1">{{ formErrors.accountHolderName }}</div>
        </div>
        <div>
          <label for="routingNumber" class="block mb-1">Routing Number</label>
          <input id="routingNumber" v-model="newACH.routingNumber" type="text" class="w-full p-2 border rounded" placeholder="123456789">
          <div v-if="formErrors.routingNumber" class="text-red-500 text-sm mt-1">{{ formErrors.routingNumber }}</div>
        </div>
        <div>
          <label for="accountNumber" class="block mb-1">Account Number</label>
          <input 
            id="accountNumber" 
            v-model="newACH.accountNumber" 
            type="text" 
            class="w-full p-2 border rounded" 
            placeholder="Enter 5-17 digit account number"
            maxlength="17"
          >
          <div v-if="formErrors.accountNumber" class="text-red-500 text-sm mt-1">{{ formErrors.accountNumber }}</div>
        </div>
        <div>
          <label for="accountType" class="block mb-1">Account Type</label>
          <select id="accountType" v-model="newACH.accountType" class="w-full p-2 border rounded">
            <option value="checking">Checking</option>
            <option value="savings">Savings</option>
          </select>
        </div>
      </div>

      <!-- PayPal Form -->
      <div v-if="newMethodType === 'paypal'" class="space-y-4">
        <p>You will be redirected to PayPal to complete the setup.</p>
        <button @click="setupPayPal" class="w-full bg-blue-500 text-white px-4 py-2 rounded">
          Set up PayPal
        </button>
      </div>

      <!-- Stripe Form -->
      <div v-if="newMethodType === 'stripe'" class="space-y-4">
        <p>You will be redirected to Stripe to complete the setup.</p>
        <button @click="setupStripe" class="w-full bg-blue-500 text-white px-4 py-2 rounded">
          Set up Stripe
        </button>
      </div>

      <!-- Billing Address Section for New Method -->
      <div class="mt-4">
        <h3 class="text-lg font-semibold mb-2">Billing Address</h3>
        <div class="space-y-3">
          <div>
            <label for="newAddressLine1" class="block mb-1">Address Line 1</label>
            <input id="newAddressLine1" v-model="newAddress.line1" type="text" class="w-full p-2 border rounded">
            <div v-if="formErrors.addressLine1" class="text-red-500 text-sm mt-1">{{ formErrors.addressLine1 }}</div>
          </div>
          <div>
            <label for="newAddressLine2" class="block mb-1">Address Line 2 (Optional)</label>
            <input id="newAddressLine2" v-model="newAddress.line2" type="text" class="w-full p-2 border rounded">
          </div>
          <div class="flex space-x-3">
            <div class="w-1/2">
              <label for="newAddressCountry" class="block mb-1">Country</label>
              <input id="newAddressCountry" v-model="newAddress.country" type="text" class="w-full p-2 border rounded">
              <div v-if="formErrors.country" class="text-red-500 text-sm mt-1">{{ formErrors.country }}</div>
            </div>
            <div class="w-1/2">
              <label for="newAddressCity" class="block mb-1">City</label>
              <input id="newAddressCity" v-model="newAddress.city" type="text" class="w-full p-2 border rounded">
              <div v-if="formErrors.city" class="text-red-500 text-sm mt-1">{{ formErrors.city }}</div>
            </div>
          </div>
          <div class="flex space-x-3">
            <div class="w-1/2">
              <label for="newAddressState" class="block mb-1">State</label>
              <input id="newAddressState" v-model="newAddress.state" type="text" class="w-full p-2 border rounded">
              <div v-if="formErrors.state" class="text-red-500 text-sm mt-1">{{ formErrors.state }}</div>
            </div>
            <div class="w-1/2">
              <label for="newAddressZip" class="block mb-1">ZIP Code</label>
              <input id="newAddressZip" v-model="newAddress.zip" type="text" class="w-full p-2 border rounded">
              <div v-if="formErrors.zip" class="text-red-500 text-sm mt-1">{{ formErrors.zip }}</div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="paymentType === 'oneTime'" class="mt-4">
        <label class="flex items-center">
          <input type="checkbox" v-model="saveNewMethod" class="mr-2">
          Save this payment method for future use
        </label>
      </div>

      <div class="mt-4 flex justify-end space-x-3">
        <button @click="cancelNewMethod" class="px-4 py-2 border rounded-lg">Cancel</button>
        <button @click="handleSaveNewMethod" class="px-4 py-2 bg-blue-500 text-white rounded-lg">
          {{ paymentType === 'oneTime' ? (saveNewMethod ? 'Save and Pay' : 'Use This Method') : 'Save New Method' }}
        </button>
      </div>
    </div>

    <!-- Billing Address Section for Selected Method -->
    <div v-if="selectedMethod && !isAddingNew" class="mt-4">
      <h3 class="text-lg font-semibold mb-2">Billing Address</h3>
      <address-manager 
        :default-address="getSelectedMethodAddress"
        @address-updated="updateMethodAddress"
      />
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, watch } from 'vue';
import { CreditCard as CreditCardIcon, Landmark as LandmarkIcon, Plus as PlusIcon, Save as SaveIcon } from 'lucide-vue';
import AddressManager from './AddressManager.vue';

export default {
  name: 'PaymentMethodSelector',
  components: {
    CreditCardIcon,
    LandmarkIcon,
    PlusIcon,
    SaveIcon,
    AddressManager,
  },
  props: {
    savedMethods: {
      type: Array,
      default: () => [],
    },
    defaultAddress: {
      type: Object,
      required: true,
    },
    allowOneTimePayment: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['method-selected', 'new-method-added', 'method-updated'],
  setup(props, { emit }) {
    const selectedMethod = ref(null);
    const isAddingNew = ref(false);
    const newMethodType = ref('card');
    const paymentType = ref(props.allowOneTimePayment ? 'oneTime' : 'saved');
    const saveNewMethod = ref(false);
    
    const newCard = reactive({
      cardholderName: '',
      cardNumber: '',
      expirationDate: '',
      cvv: '',
    });

    const newACH = reactive({
      accountHolderName: '',
      routingNumber: '',
      accountNumber: '',
      accountType: 'checking',
    });

    const newAddress = reactive({
      line1: '',
      line2: '',
      country: '',
      city: '',
      state: '',
      zip: '',
    });

    const formErrors = reactive({
      cardholderName: '',
      cardNumber: '',
      expirationDate: '',
      cvv: '',
      accountHolderName: '',
      routingNumber: '',
      accountNumber: '',
      addressLine1: '',
      country: '',
      city: '',
      state: '',
      zip: '',
    });

    const getSelectedMethodAddress = computed(() => {
      const method = props.savedMethods.find(m => m.id === selectedMethod.value);
      return method && method.billingAddress ? method.billingAddress : props.defaultAddress;
    });

    const formatAddress = (address) => {
      return `${address.line1}, ${address.city}, ${address.state} ${address.zip}`;
    };

    const selectMethod = (methodId) => {
      selectedMethod.value = methodId;
      const method = props.savedMethods.find(m => m.id === methodId);
      emit('method-selected', method);
    };

    const setPaymentType = (type) => {
      paymentType.value = type;
      if (type === 'saved' && props.savedMethods.length > 0) {
        selectMethod(props.savedMethods[0].id);
      } else {
        selectedMethod.value = null;
        emit('method-selected', null);
      }
    };

    const showNewMethodForm = () => {
      isAddingNew.value = true;
    };

    const cancelNewMethod = () => {
      isAddingNew.value = false;
      newMethodType.value = 'card';
      // Reset form fields
      Object.keys(newCard).forEach(key => newCard[key] = '');
      Object.keys(newACH).forEach(key => newACH[key] = '');
      Object.keys(newAddress).forEach(key => newAddress[key] = '');
      Object.keys(formErrors).forEach(key => formErrors[key] = '');
      saveNewMethod.value = false;
    };

    const setupPayPal = () => {
      // Implement PayPal setup logic here
      console.log('Setting up PayPal...');
      // This would typically involve redirecting to PayPal or opening a PayPal modal
    };

    const setupStripe = () => {
      // Implement Stripe setup logic here
      console.log('Setting up Stripe...');
      // This would typically involve redirecting to Stripe or opening a Stripe modal
    };

    const validateForm = () => {
      let isValid = true;
      Object.keys(formErrors).forEach(key => formErrors[key] = '');

      if (newMethodType.value === 'card') {
        if (!newCard.cardholderName.trim()) {
          formErrors.cardholderName = 'Cardholder name is required';
          isValid = false;
        }
        if (!/^\d{16}$/.test(newCard.cardNumber)) {
          formErrors.cardNumber = 'Invalid card number';
          isValid = false;
        }
        if (!/^\d{2}\/\d{2}$/.test(newCard.expirationDate)) {
          formErrors.expirationDate = 'Invalid expiration date';
          isValid = false;
        }
        if (!/^\d{3,4}$/.test(newCard.cvv)) {
          formErrors.cvv = 'Invalid CVV';
          isValid = false;
        }
      } else if (newMethodType.value === 'ach') {
        if (!newACH.accountHolderName.trim()) {
          formErrors.accountHolderName = 'Account holder name is required';
          isValid = false;
        }
        if (!/^\d{9}$/.test(newACH.routingNumber)) {
          formErrors.routingNumber = 'Invalid routing number (must be 9 digits)';
          isValid = false;
        }
        if (!/^\d{5,17}$/.test(newACH.accountNumber)) {
          formErrors.accountNumber = 'Invalid account number (must be 5-17 digits)';
          isValid = false;
        }
      }

      // Validate address
      if (!newAddress.line1.trim()) {
        formErrors.addressLine1 = 'Address line 1 is required';
        isValid = false;
      }
      if (!newAddress.country.trim()) {
        formErrors.country = 'Country is required';
        isValid = false;
      }
      if (!newAddress.city.trim()) {
        formErrors.city = 'City is required';
        isValid = false;
      }
      if (!newAddress.state.trim()) {
        formErrors.state = 'State is required';
        isValid = false;
      }
      if (!/^\d{5}(-\d{4})?$/.test(newAddress.zip)) {
        formErrors.zip = 'Invalid ZIP code';
        isValid = false;
      }

      return isValid;
    };

    const handleSaveNewMethod = () => {
      if (!validateForm()) {
        return;
      }

      let newMethod;
      if (newMethodType.value === 'card') {
        newMethod = {
          id: `new-card-${Date.now()}`,
          type: 'card',
          cardBrand: 'Visa', // This should be determined based on the card number
          last4: newCard.cardNumber.slice(-4),
          billingAddress: { ...newAddress },
          ...newCard,
        };
      } else if (newMethodType.value === 'ach') {
        newMethod = {
          id: `new-ach-${Date.now()}`,
          type: 'ach',
          last4: newACH.accountNumber.slice(-4),
          billingAddress: { ...newAddress },
          ...newACH,
        };
      } else if (newMethodType.value === 'paypal') {
        newMethod = {
          id: `paypal-${Date.now()}`,
          type: 'paypal',
          // Add any PayPal-specific details here
        };
      } else if (newMethodType.value === 'stripe') {
        newMethod = {
          id: `stripe-${Date.now()}`,
          type: 'stripe',
          // Add any Stripe-specific details here
        };
      }

      newMethod.save = paymentType.value === 'saved' || saveNewMethod.value;
      
      emit('new-method-added', newMethod);
      isAddingNew.value = false;
      selectMethod(newMethod.id);
      cancelNewMethod(); // Reset form
    };

    const updateMethodAddress = (newAddress) => {
      const updatedMethod = props.savedMethods.find(m => m.id === selectedMethod.value);
      if (updatedMethod) {
        updatedMethod.billingAddress = newAddress;
        emit('method-updated', updatedMethod);
      }
    };

    // Watch for changes in savedMethods and select the first one if none is selected
    watch(() => props.savedMethods, (newMethods) => {
      if (newMethods.length > 0 && !selectedMethod.value) {
        selectMethod(newMethods[0].id);
      }
    }, { immediate: true });

    return {
      selectedMethod,
      isAddingNew,
      newMethodType,
      paymentType,
      newCard,
      newACH,
      newAddress,
      formErrors,
      saveNewMethod,
      getSelectedMethodAddress,
      formatAddress,
      selectMethod,
      setPaymentType,
      showNewMethodForm,
      cancelNewMethod,
      updateMethodAddress,
      setupPayPal,
      setupStripe,
      validateForm,
      handleSaveNewMethod,
    };
  },
};
</script>

<style scoped>
@media (hover: hover) {
  button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
}

@media (hover: none) {
  button:active {
    transform: translateY(1px);
  }
}
</style>