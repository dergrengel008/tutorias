<template>
  <div class="math-whiteboard">
    <!-- Toolbar -->
    <div class="math-toolbar">
      <div class="tool-group">
        <button
          v-for="tool in tools"
          :key="tool.id"
          :class="['tool-btn', { active: activeTool === tool.id }]"
          @click="setTool(tool.id)"
          :title="tool.label"
        >
          <i :class="tool.icon"></i>
          <span class="tool-label">{{ tool.label }}</span>
        </button>
      </div>

      <div class="tool-group">
        <label class="color-picker">
          <i class="fas fa-palette"></i>
          <input type="color" v-model="strokeColor" />
        </label>
        <label class="size-slider">
          <i class="fas fa-circle" :style="{ fontSize: brushSize + 'px' }"></i>
          <input type="range" v-model.number="brushSize" min="1" max="30" />
        </label>
      </div>

      <div class="tool-group">
        <button @click="insertLatex" class="tool-btn latex-btn" title="Insertar fórmula LaTeX">
          <i class="fas fa-square-root-variable"></i>
          <span class="tool-label">Fórmula</span>
        </button>
        <button @click="undoLast" class="tool-btn" title="Deshacer">
          <i class="fas fa-undo"></i>
        </button>
        <button @click="redoLast" class="tool-btn" title="Rehacer">
          <i class="fas fa-redo"></i>
        </button>
      </div>
    </div>

    <!-- LaTeX Input Modal -->
    <div v-if="showLatexModal" class="latex-modal-overlay" @click.self="showLatexModal = false">
      <div class="latex-modal">
        <h3>Insertar Fórmula</h3>
        <p class="text-sm text-gray-500 mb-3">Escribe la fórmula en formato LaTeX:</p>
        <input
          v-model="latexInput"
          class="latex-input"
          placeholder="Ej: \frac{a}{b} + \sqrt{c^2}"
          @keyup.enter="confirmLatex"
          autofocus
        />
        <div class="latex-preview" v-if="latexInput" v-html="renderedLatex"></div>
        <div class="latex-modal-actions">
          <button @click="showLatexModal = false" class="btn-cancel">Cancelar</button>
          <button @click="confirmLatex" class="btn-confirm">Insertar</button>
        </div>
      </div>
    </div>

    <!-- Canvas -->
    <div ref="canvasWrapper" class="math-canvas-wrapper">
      <canvas ref="fabricCanvas"></canvas>
    </div>

    <!-- Keyboard shortcut hint -->
    <div class="shortcut-hint">
      <span v-for="shortcut in shortcuts" :key="shortcut.key" class="shortcut-item">
        <kbd>{{ shortcut.key }}</kbd> {{ shortcut.action }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick, computed } from 'vue';
import { fabric } from 'fabric';

const props = defineProps({
  sessionId: { type: Number, required: true },
  initialData: { type: [Object, String, null], default: null },
  readOnly: { type: Boolean, default: false },
});

const emit = defineEmits(['change']);

const canvasWrapper = ref(null);
const fabricCanvas = ref(null);
const canvas = ref(null);
let fabricInstance = null;
let undoStack = [];
let redoStack = [];

const activeTool = ref('pen');
const strokeColor = ref('#000000');
const brushSize = ref(3);
const showLatexModal = ref(false);
const latexInput = ref('');

const tools = [
  { id: 'pen', label: 'Lápiz', icon: 'fas fa-pen' },
  { id: 'line', label: 'Línea', icon: 'fas fa-minus' },
  { id: 'rect', label: 'Rectángulo', icon: 'far fa-square' },
  { id: 'circle', label: 'Círculo', icon: 'far fa-circle' },
  { id: 'eraser', label: 'Borrador', icon: 'fas fa-eraser' },
  { id: 'select', label: 'Seleccionar', icon: 'fas fa-mouse-pointer' },
];

const shortcuts = [
  { key: 'L', action: 'Línea' },
  { key: 'R', action: 'Rect' },
  { key: 'C', action: 'Círculo' },
  { key: 'E', action: 'Borrar' },
  { key: 'Ctrl+Z', action: 'Deshacer' },
  { key: 'F', action: 'Fórmula' },
];

const renderedLatex = computed(() => {
  if (!latexInput.value) return '';
  try {
    return katex.renderToString(latexInput.value, { throwOnError: false, displayMode: true });
  } catch {
    return `<span class="text-red-500">Fórmula inválida</span>`;
  }
});

function setTool(toolId) {
  activeTool.value = toolId;
  if (!fabricInstance) return;

  switch (toolId) {
    case 'pen':
      fabricInstance.isDrawingMode = true;
      fabricInstance.freeDrawingBrush.width = brushSize.value;
      fabricInstance.freeDrawingBrush.color = strokeColor.value;
      break;
    case 'eraser':
      fabricInstance.isDrawingMode = true;
      fabricInstance.freeDrawingBrush.width = brushSize.value * 3;
      fabricInstance.freeDrawingBrush.color = '#FFFFFF';
      break;
    case 'select':
      fabricInstance.isDrawingMode = false;
      break;
    default:
      fabricInstance.isDrawingMode = false;
      break;
  }
}

function saveState() {
  if (!fabricInstance || props.readOnly) return;
  undoStack.push(JSON.stringify(fabricInstance.toJSON()));
  if (undoStack.length > 50) undoStack.shift();
  redoStack = [];
  emit('change', JSON.stringify(fabricInstance.toJSON()));
}

function undoLast() {
  if (undoStack.length === 0 || !fabricInstance) return;
  redoStack.push(JSON.stringify(fabricInstance.toJSON()));
  const prevState = undoStack.pop();
  fabricInstance.loadFromJSON(prevState, () => {
    fabricInstance.renderAll();
    emit('change', JSON.stringify(fabricInstance.toJSON()));
  });
}

function redoLast() {
  if (redoStack.length === 0 || !fabricInstance) return;
  undoStack.push(JSON.stringify(fabricInstance.toJSON()));
  const nextState = redoStack.pop();
  fabricInstance.loadFromJSON(nextState, () => {
    fabricInstance.renderAll();
    emit('change', JSON.stringify(fabricInstance.toJSON()));
  });
}

function insertLatex() {
  showLatexModal.value = true;
  latexInput.value = '';
}

function confirmLatex() {
  if (!latexInput.value || !fabricInstance) return;

  try {
    const rendered = katex.renderToString(latexInput.value, {
      throwOnError: false,
      displayMode: true,
      fontSize: 28,
    });

    const latexText = new fabric.IText(latexInput.value, {
      left: 100 + Math.random() * 200,
      top: 100 + Math.random() * 200,
      fontSize: 24,
      fill: strokeColor.value,
      fontFamily: 'KaTeX_Main, Times New Roman, serif',
      fontWeight: 'normal',
      editable: false,
      metadata: { type: 'latex', rendered: rendered },
    });

    fabricInstance.add(latexText);
    fabricInstance.setActiveObject(latexText);
    fabricInstance.renderAll();
    saveState();
  } catch (error) {
    alert('Error al renderizar la fórmula. Verifica la sintaxis LaTeX.');
  }

  showLatexModal.value = false;
}

function loadCanvas(data) {
  if (!fabricInstance || !data) return;
  try {
    const parsed = typeof data === 'string' ? JSON.parse(data) : data;
    fabricInstance.loadFromJSON(parsed, () => {
      fabricInstance.renderAll();
    });
  } catch (error) {
    console.error('Failed to load canvas data:', error);
  }
}

function handleKeyDown(e) {
  if (props.readOnly) return;

  if (e.ctrlKey && e.key === 'z') {
    e.preventDefault();
    undoLast();
    return;
  }

  if (e.ctrlKey && e.key === 'y') {
    e.preventDefault();
    redoLast();
    return;
  }

  if (document.activeElement.tagName === 'INPUT') return;

  switch (e.key.toLowerCase()) {
    case 'l': setTool('line'); break;
    case 'r': setTool('rect'); break;
    case 'c': setTool('circle'); break;
    case 'e': setTool('eraser'); break;
    case 'f': insertLatex(); break;
    case 'p': setTool('pen'); break;
    case 'v': setTool('select'); break;
  }
}

function clear() {
  if (!fabricInstance) return;
  saveState();
  fabricInstance.clear();
  fabricInstance.setBackgroundColor('#ffffff', fabricInstance.renderAll.bind(fabricInstance));
  emit('change', JSON.stringify(fabricInstance.toJSON()));
}

async function exportImage() {
  if (!fabricInstance) return null;
  return new Promise((resolve) => {
    fabricInstance.toBlob((blob) => {
      resolve(blob);
    }, 'image/png', 1.0);
  });
}

onMounted(() => {
  if (!canvasWrapper.value || !canvas.value) return;

  const width = canvasWrapper.value.offsetWidth || 900;
  const height = 550;

  fabricInstance = new fabric.Canvas(canvas.value, {
    width: width,
    height: height,
    backgroundColor: '#ffffff',
    isDrawingMode: true,
    selection: !props.readOnly,
  });

  fabricInstance.freeDrawingBrush.width = brushSize.value;
  fabricInstance.freeDrawingBrush.color = strokeColor.value;

  fabricInstance.on('path:created', saveState);
  fabricInstance.on('object:added', saveState);
  fabricInstance.on('object:modified', saveState);
  fabricInstance.on('object:removed', saveState);

  // Shape drawing handlers
  let isDrawingShape = false;
  let startX, startY, activeShape = null;

  fabricInstance.on('mouse:down', (opt) => {
    if (props.readOnly) return;
    if (activeTool.value === 'select' || activeTool.value === 'pen' || activeTool.value === 'eraser') return;

    isDrawingShape = true;
    const pointer = fabricInstance.getPointer(opt.e);
    startX = pointer.x;
    startY = pointer.y;

    if (activeTool.value === 'line') {
      activeShape = new fabric.Line([startX, startY, startX, startY], {
        stroke: strokeColor.value,
        strokeWidth: Math.max(1, brushSize.value / 2),
        selectable: true,
      });
      fabricInstance.add(activeShape);
    } else if (activeTool.value === 'rect') {
      activeShape = new fabric.Rect({
        left: startX, top: startY,
        width: 0, height: 0,
        fill: 'transparent',
        stroke: strokeColor.value,
        strokeWidth: Math.max(1, brushSize.value / 2),
        selectable: true,
      });
      fabricInstance.add(activeShape);
    } else if (activeTool.value === 'circle') {
      activeShape = new fabric.Ellipse({
        left: startX, top: startY,
        rx: 0, ry: 0,
        fill: 'transparent',
        stroke: strokeColor.value,
        strokeWidth: Math.max(1, brushSize.value / 2),
        selectable: true,
      });
      fabricInstance.add(activeShape);
    }
  });

  fabricInstance.on('mouse:move', (opt) => {
    if (!isDrawingShape || !activeShape || props.readOnly) return;
    const pointer = fabricInstance.getPointer(opt.e);

    if (activeTool.value === 'line') {
      activeShape.set({ x2: pointer.x, y2: pointer.y });
    } else if (activeTool.value === 'rect') {
      activeShape.set({
        width: pointer.x - startX,
        height: pointer.y - startY,
      });
    } else if (activeTool.value === 'circle') {
      activeShape.set({
        rx: Math.abs(pointer.x - startX) / 2,
        ry: Math.abs(pointer.y - startY) / 2,
      });
    }

    fabricInstance.renderAll();
  });

  fabricInstance.on('mouse:up', () => {
    isDrawingShape = false;
    activeShape = null;
  });

  // Load initial data
  if (props.initialData) {
    loadCanvas(props.initialData);
  }

  // Keyboard shortcuts
  document.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown);
  if (fabricInstance) {
    fabricInstance.dispose();
  }
});

watch(() => props.initialData, (newData) => {
  if (newData) loadCanvas(newData);
});

watch(brushSize, (val) => {
  if (fabricInstance && fabricInstance.freeDrawingBrush) {
    fabricInstance.freeDrawingBrush.width = activeTool.value === 'eraser' ? val * 3 : val;
  }
});

watch(strokeColor, (val) => {
  if (fabricInstance && fabricInstance.freeDrawingBrush) {
    fabricInstance.freeDrawingBrush.color = activeTool.value === 'eraser' ? '#FFFFFF' : val;
  }
});

defineExpose({ clear, exportImage });
</script>

<style scoped>
.math-whiteboard {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #ffffff;
}

.math-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  flex-wrap: wrap;
}

.tool-group {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0 8px;
  border-right: 1px solid #e5e7eb;
}

.tool-group:last-child {
  border-right: none;
}

.tool-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 8px;
  border: 1px solid transparent;
  border-radius: 6px;
  background: transparent;
  color: #6b7280;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s;
}

.tool-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.tool-btn.active {
  background: #eef2ff;
  border-color: #818cf8;
  color: #4338ca;
}

.tool-label {
  display: inline;
}

.latex-btn {
  color: #7c3aed;
}

.latex-btn:hover {
  background: #f5f3ff;
  color: #6d28d9;
}

.color-picker {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  color: #6b7280;
}

.color-picker input[type="color"] {
  width: 24px;
  height: 24px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  cursor: pointer;
  padding: 0;
}

.size-slider {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #6b7280;
}

.size-slider input[type="range"] {
  width: 60px;
  height: 4px;
}

.math-canvas-wrapper {
  flex: 1;
  overflow: auto;
  padding: 0;
}

/* LaTeX Modal */
.latex-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.latex-modal {
  background: white;
  border-radius: 12px;
  padding: 24px;
  width: 500px;
  max-width: 90vw;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.latex-modal h3 {
  margin: 0 0 8px;
  font-size: 18px;
  color: #111827;
}

.latex-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  outline: none;
  box-sizing: border-box;
}

.latex-input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.latex-preview {
  margin-top: 16px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
  text-align: center;
  font-size: 20px;
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.latex-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
}

.btn-cancel {
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  color: #374151;
  cursor: pointer;
}

.btn-confirm {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  background: #4f46e5;
  color: white;
  cursor: pointer;
}

.btn-confirm:hover {
  background: #4338ca;
}

.shortcut-hint {
  display: flex;
  gap: 12px;
  padding: 6px 12px;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
  font-size: 11px;
  color: #9ca3af;
  flex-wrap: wrap;
}

.shortcut-item kbd {
  background: #e5e7eb;
  padding: 1px 4px;
  border-radius: 3px;
  font-family: monospace;
  font-size: 10px;
  margin-right: 2px;
}
</style>
