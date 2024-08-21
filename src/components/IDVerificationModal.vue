<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
    <div class="bg-white p-6 rounded-lg max-w-lg w-full">
      <h2 class="text-2xl font-bold mb-4">ID Verification</h2>
      <div class="space-y-4">
        <div v-if="step === 1">
          <p class="mb-2">Please take a picture of the front of your ID:</p>
          <input type="file" @change="handleFileUpload" accept="image/*" capture="environment" class="mb-2">
          <img v-if="frontImage" :src="frontImage" alt="Front of ID" class="max-w-full h-auto mb-2">
          <button @click="nextStep" :disabled="!frontImage" class="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300">Next</button>
        </div>
        <div v-if="step === 2">
          <p class="mb-2">Now, take a picture of the back of your ID:</p>
          <input type="file" @change="handleFileUpload" accept="image/*" capture="environment" class="mb-2">
          <img v-if="backImage" :src="backImage" alt="Back of ID" class="max-w-full h-auto mb-2">
          <button @click="nextStep" :disabled="!backImage" class="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300">Next</button>
        </div>
        <div v-if="step === 3">
          <p class="mb-2">Finally, take a selfie:</p>
          <input type="file" @change="handleFileUpload" accept="image/*" capture="user" class="mb-2">
          <img v-if="selfieImage" :src="selfieImage" alt="Selfie" class="max-w-full h-auto mb-2">
          <button @click="verifyID" :disabled="!selfieImage || isVerifying" class="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300">
            Verify ID
          </button>
        </div>
      </div>
      <div v-if="isVerifying" class="text-center mt-4">
        <p>Verifying ID... Please wait.</p>
        <!-- Add a loading spinner here -->
        <div class="loader mt-2"></div>
      </div>
      <div v-if="error" class="text-red-500 mt-4">
        {{ error }}
      </div>
      <div class="mt-4 flex justify-between">
        <button @click="$emit('cancel')" class="text-gray-500">Cancel</button>
        <button @click="$emit('close')" class="text-gray-500">Close</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  emits: ['close', 'verification-complete', 'cancel'],
  setup(props, { emit }) {
    const step = ref(1);
    const frontImage = ref(null);
    const backImage = ref(null);
    const selfieImage = ref(null);
    const isVerifying = ref(false);
    const error = ref(null);

    const handleFileUpload = (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (step.value === 1) {
            frontImage.value = e.target.result;
          } else if (step.value === 2) {
            backImage.value = e.target.result;
          } else if (step.value === 3) {
            selfieImage.value = e.target.result;
          }
        };
        reader.readAsDataURL(file);
      }
    };

    const nextStep = () => {
      step.value++;
    };

    const verifyID = async () => {
      isVerifying.value = true;
      error.value = null;
      try {
        // Simulate API call for verification
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Simulated success (replace with actual API call in production)
        console.log('ID verified successfully');
        emit('verification-complete');
      } catch (err) {
        console.error('Verification failed:', err);
        error.value = 'ID verification failed. Please try again.';
      } finally {
        isVerifying.value = false;
      }
    };

    return {
      step,
      frontImage,
      backImage,
      selfieImage,
      isVerifying,
      error,
      handleFileUpload,
      nextStep,
      verifyID,
    };
  },
};
</script>

<style scoped>
.loader {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>