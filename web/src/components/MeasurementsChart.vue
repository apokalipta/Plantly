<template>
  <div class="chart-container" style="padding: 1rem;">
    <div v-if="points.length < 2" class="muted">Pas assez de données pour afficher un graphique.</div>
    <svg v-else viewBox="0 0 100 40" width="100%" height="160">
      <polyline :points="points.join(' ')" style="fill: none; stroke: var(--accent); stroke-width: 1.5;" />
      <text x="2" y="38" class="muted" style="font-size: 3px;">Humidité du sol (%)</text>
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({ measurements: { type: Array, default: () => [] } });

const points = computed(() => {
  const values = (props.measurements || [])
    .map((m) => (typeof m.soilMoisture === 'number' ? m.soilMoisture : null))
    .filter((v) => typeof v === 'number');
  const n = values.length;
  if (n < 2) return [];

  const min = Math.min(...values);
  const max = Math.max(...values);
  const top = 5;
  const bottom = 35;
  const height = bottom - top;
  const scaleY = (v) => {
    if (max === min) return (top + bottom) / 2;
    const t = (v - min) / (max - min);
    return bottom - t * height;
  };
  const step = n > 1 ? 100 / (n - 1) : 100;
  return values.map((v, i) => `${i * step},${scaleY(v)}`);
});
</script>
