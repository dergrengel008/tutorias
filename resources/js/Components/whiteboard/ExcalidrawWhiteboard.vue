<template>
  <div class="excalidraw-wrapper">
    <div v-if="loading" class="loading-overlay">
      <div class="spinner"></div>
      <p>Cargando pizarra...</p>
    </div>
    <div v-if="loadError" class="error-overlay">
      <p class="text-red-600">
        <i class="fas fa-exclamation-triangle mr-1"></i>
        Error al cargar Excalidraw.
        <button @click="loadExcalidraw" class="text-blue-600 underline">Reintentar</button>
      </p>
    </div>
    <div ref="excalidrawContainer" class="excalidraw-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, shallowRef } from 'vue';

const props = defineProps({
  sessionId: { type: Number, required: true },
  initialData: { type: [Object, String, null], default: null },
  readOnly: { type: Boolean, default: false },
});

const emit = defineEmits(['change']);

const excalidrawContainer = ref(null);
const excalidrawAPI = shallowRef(null);
const loading = ref(true);
const loadError = ref(false);
let React = null;
let ReactDOM = null;
let ExcalidrawLib = null;
let App = null;

function parseInitialData() {
  if (!props.initialData) return null;
  if (typeof props.initialData === 'string') {
    try { return JSON.parse(props.initialData); } catch { return null; }
  }
  return props.initialData;
}

function handleChange(elements) {
  if (props.readOnly) return;
  emit('change', JSON.stringify({ elements, appState: {} }));
}

async function loadExcalidraw() {
  loading.value = true;
  loadError.value = false;

  try {
    const module = await import('@excalidraw/excalidraw');
    ExcalidrawLib = module.default;

    const reactModule = await import('react');
    React = reactModule;
    ReactDOM = await import('react-dom/client');

    const { createElement: h } = React;

    function ExcalidrawWrapper() {
      const [excalidrawAPI, setExcalidrawAPI] = React.useState(null);

      return h(ExcalidrawLib, {
        initialData: {
          elements: parseInitialData()?.elements || [],
          appState: { viewModeEnabled: props.readOnly },
        },
        onChange: handleChange,
        excalidrawAPI: (api) => {
          setExcalidrawAPI(api);
          if (api) {
            // Make it available to parent
            window.__excalidrawAPI = api;
          }
        },
        viewModeEnabled: props.readOnly,
        UIOptions: {
          canvasActions: {
            loadScene: false,
            export: false,
            saveToActiveFile: false,
            toggleTheme: false,
            changeViewBackgroundColor: true,
          },
        },
        langCode: 'es',
      });
    }

    // React 18 createRoot
    const root = ReactDOM.createRoot(excalidrawContainer.value);
    root.render(h(ExcalidrawWrapper));

    loading.value = false;
  } catch (error) {
    console.error('Failed to load Excalidraw:', error);
    loading.value = false;
    loadError.value = true;
  }
}

function clear() {
  if (window.__excalidrawAPI) {
    window.__excalidrawAPI.updateScene({ elements: [] });
    emit('change', JSON.stringify({ elements: [], appState: {} }));
  }
}

async function exportImage() {
  if (!window.__excalidrawAPI) return null;
  const blob = await window.__excalidrawAPI.exportToBlob({
    mimeType: 'image/png',
    quality: 0.9,
  });
  return blob;
}

onMounted(() => {
  loadExcalidraw();
});

onUnmounted(() => {
  if (excalidrawContainer.value && ReactDOM) {
    ReactDOM.createRoot(excalidrawContainer.value).unmount();
  }
  window.__excalidrawAPI = null;
});

defineExpose({ clear, exportImage });
</script>

<style>
/* Excalidraw global styles */
.excalidraw-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}

.excalidraw-container {
  width: 100%;
  height: 100%;
}

.excalidraw-container > div {
  width: 100% !important;
  height: 100% !important;
}

.loading-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: white;
  z-index: 10;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e5e7eb;
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  z-index: 10;
}
</style>
