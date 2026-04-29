<template>
  <div class="whiteboard-container" :class="{ 'read-only': isReadOnly }">
    <div class="whiteboard-toolbar">
      <h3 class="text-sm font-medium text-gray-700">
        <i class="fas fa-chalkboard mr-1"></i>
        Pizarra
        <span v-if="!isReadOnly" class="text-xs text-gray-400 ml-2">
          (Auto-guardado cada 30s)
        </span>
      </h3>
      <div class="toolbar-actions">
        <button
          v-if="!isReadOnly"
          @click="clearCanvas"
          class="btn-clear"
          title="Limpiar pizarra"
        >
          <i class="fas fa-eraser"></i> Limpiar
        </button>
        <button
          v-if="!isReadOnly"
          @click="exportCanvas"
          class="btn-export"
          title="Exportar como imagen"
        >
          <i class="fas fa-download"></i> Exportar
        </button>
      </div>
    </div>

    <div class="whiteboard-canvas-wrapper">
      <ExcalidrawWhiteboard
        v-if="!isMathSpecialty"
        ref="whiteboardRef"
        :session-id="sessionId"
        :initial-data="canvasData"
        :read-only="isReadOnly"
        @change="onCanvasChange"
      />
      <MathWhiteboard
        v-else
        ref="whiteboardRef"
        :session-id="sessionId"
        :initial-data="canvasData"
        :read-only="isReadOnly"
        @change="onCanvasChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import ExcalidrawWhiteboard from './ExcalidrawWhiteboard.vue';
import MathWhiteboard from './MathWhiteboard.vue';
import axios from 'axios';

const props = defineProps({
  sessionId: { type: Number, required: true },
  specialtyName: { type: String, default: '' },
  isReadOnly: { type: Boolean, default: false },
});

const emit = defineEmits(['save', 'change']);

const whiteboardRef = ref(null);
const canvasData = ref(null);
const saveInterval = ref(null);
const hasUnsavedChanges = ref(false);

const isMathSpecialty = computed(() => {
  return props.specialtyName.toLowerCase().includes('matemátic');
});

function onCanvasChange(data) {
  canvasData.value = data;
  hasUnsavedChanges.value = true;
  emit('change', data);
}

async function loadCanvasData() {
  try {
    const response = await axios.get(`/api/whiteboard/${props.sessionId}`);
    if (response.data && response.data.whiteboard_data) {
      canvasData.value = response.data.whiteboard_data;
    }
  } catch (error) {
    // No data yet — start fresh
    console.log('No whiteboard data found for session', props.sessionId);
  }
}

async function saveCanvasData() {
  if (!hasUnsavedChanges.value || !canvasData.value || props.isReadOnly) return;

  try {
    await axios.post(`/api/whiteboard/${props.sessionId}`, {
      whiteboard_data: JSON.stringify(canvasData.value),
      specialty: props.specialtyName,
    });
    hasUnsavedChanges.value = false;
    emit('save', canvasData.value);
  } catch (error) {
    console.error('Failed to save whiteboard:', error);
  }
}

function clearCanvas() {
  if (confirm('¿Estás seguro de que quieres limpiar la pizarra? Esta acción no se puede deshacer.')) {
    canvasData.value = null;
    hasUnsavedChanges.value = true;
    if (whiteboardRef.value && whiteboardRef.value.clear) {
      whiteboardRef.value.clear();
    }
  }
}

async function exportCanvas() {
  if (whiteboardRef.value && whiteboardRef.value.exportImage) {
    const blob = await whiteboardRef.value.exportImage();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pizarra-sesion-${props.sessionId}-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

onMounted(() => {
  loadCanvasData();
  saveInterval.value = setInterval(saveCanvasData, 30000);
});

onUnmounted(() => {
  if (saveInterval.value) {
    clearInterval(saveInterval.value);
  }
  // Save on unmount if there are changes
  saveCanvasData();
});

watch(() => props.sessionId, () => {
  loadCanvasData();
});
</script>

<style scoped>
.whiteboard-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  background: #ffffff;
}

.whiteboard-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.toolbar-actions {
  display: flex;
  gap: 8px;
}

.btn-clear,
.btn-export {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  color: #374151;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-clear:hover {
  background: #fef2f2;
  border-color: #fca5a5;
  color: #dc2626;
}

.btn-export:hover {
  background: #eff6ff;
  border-color: #93c5fd;
  color: #2563eb;
}

.whiteboard-canvas-wrapper {
  flex: 1;
  min-height: 500px;
}

.whiteboard-container.read-only .btn-clear,
.whiteboard-container.read-only .btn-export {
  display: none;
}
</style>
