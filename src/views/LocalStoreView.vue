<template>
  <div class="local-store-view">
    <h2>LocalStorage Demonstration</h2>

    <!-- Save Section -->
    <section class="card save-section">
      <h3>Save Data to LocalStorage</h3>
      <p>Enter a key and some data object to persist in the browser's local storage.</p>
      
      <div class="form-group">
        <label for="keyInput">Key:</label>
        <input v-model="saveKey" id="keyInput" placeholder="e.g., userSettings">
      </div>

      <div class="form-group">
        <label for="dataInput">Data (JSON string):</label>
        <!-- Using a textarea/input to simplify data input, but treating it as a JSON object -->
        <textarea v-model="dataInput" id="dataInput" rows="5"></textarea>
      </div>

      <button @click="saveData" :disabled="!saveKey || !dataInput">Save Data</button>
      <p v-if="saveMessage" :class="['message', saveMessage.includes('Error') ? 'error' : 'success']">{{ saveMessage }}</p>
    </section>

    <hr>

    <!-- Load Section -->
    <section class="card load-section">
      <h3>Load Data from LocalStorage</h3>
      <p>Enter the key used above to retrieve and display the data.</p>

      <div class="form-group">
        <label for="loadKeyInput">Key:</label>
        <input v-model="loadKey" id="loadKeyInput" placeholder="e.g., userSettings">
      </div>

      <button @click="loadData" :disabled="!loadKey">Load Data</button>
      
      <div v-if="loadedData" class="result-box">
        <h4>Loaded Data:</h4>
        <pre>{{ JSON.stringify(loadedData, null, 2) }}</pre>
      </div>
      <p v-if="loadMessage" :class="['message', loadMessage.includes('Error') ? 'error' : 'success']">{{ loadMessage }}</p>
    </section>

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
// Assuming the service is accessible via alias '@/service/...'
import { LocalStoreService } from '@/service/localStoreService'; 

// State for Saving
const saveKey = ref('userSettings');
const dataInput = ref(JSON.stringify({ theme: 'dark', notifications: true }, null, 2)); // Default JSON input string
const saveMessage = ref('');

/**
 * Handles saving data to localStorage.
 */
const saveData = () => {
  if (!saveKey.value || !dataInput.value) {
    saveMessage.value = 'Please provide both a Key and Data.';
    return;
  }
  try {
    // 1. Attempt to parse the JSON input string before saving
    const dataObject = JSON.parse(dataInput.value);

    // 2. Call the service method
    LocalStoreService.getInstance(saveKey.value).save(dataObject);
    
    // 3. Update UI state
    saveMessage.value = '✅ Data saved successfully!';
  } catch (e) {
    console.error('JSON Parse Error:', e);
    saveMessage.value = '❌ Error: The "Data" input is not valid JSON.';
  }
};

// State for Loading
const loadKey = ref('');
const loadedData = ref<any>(null);
const loadMessage = ref('');

/**
 * Handles loading data from localStorage.
 */
const loadData = () => {
    if (!loadKey.value) {
        loadMessage.value = 'Please enter a Key.';
        return;
    }
    try {
        // Call the service method
        const result = LocalStoreService.getInstance(loadKey.value).load();

        // Update UI state
        loadedData.value = result;
        if (result === null) {
            loadMessage.value = `⚠️ Key "${loadKey.value}" not found or loading failed.`;
        } else {
            loadMessage.value = `✅ Data loaded successfully for key: ${loadKey.value}`;
        }

    } catch (e) {
        console.error('Loading Error:', e);
        loadMessage.value = '❌ An unknown error occurred while loading data.';
    }
};
</script>

<style scoped>
.local-store-view {
  max-width: 800px;
  margin: 2rem auto;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  padding: 0 20px;
}
h2 {
    color: #3498db;
}
.card {
  border: 1px solid #eee;
  padding: 20px;
  margin-bottom: 25px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}
h3 {
    color: #2c3e50;
    margin-top: 0;
}
/* Form Styling */
.form-group {
  margin-bottom: 15px;
}
label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}
input[type="text"], textarea {
  width: calc(100% - 20px);
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box; /* Includes padding/border in the element's total width */
}
button {
  padding: 10px 20px;
  margin-right: 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background-color: #3498db;
  color: white;
}
button:disabled {
    background-color: #aaa;
    cursor: not-allowed;
}
/* Messaging */
.message {
    margin-top: 15px;
    padding: 10px;
    border-radius: 4px;
    font-weight: bold;
}
.success {
    background-color: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
}
.error {
    background-color: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
}

/* Result Box */
.result-box {
  margin-top: 20px;
  padding: 15px;
  background-color: #ecf0f1;
  border-radius: 4px;
}
.result-box h4 {
    margin-top: 0;
    border-bottom: 1px dashed #bdc3c7;
    padding-bottom: 5px;
}
pre {
    white-space: pre-wrap; /* Ensures long lines wrap */
    word-break: break-all;
    background-color: #fff;
    padding: 10px;
    border: 1px dashed #ccc;
}
</style>