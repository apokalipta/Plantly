<script setup>
const props = defineProps({
  title: { type: String, default: '' },
  height: { type: String, default: '' },
});
</script>

<template>
  <div
    class="position-relative border-radius-xl overflow-hidden shadow-lg mb-7"
  >
    <div class="container border-bottom">
      <div class="row justify-space-between py-2">
        <div class="col-lg-3 me-auto">
          <p class="lead text-dark pt-1 mb-0">{{ title }}</p>
        </div>
      </div>
    </div>
    <div class="tab-content tab-space">
      <div class="tab-pane active p-2">
        <div class="overflow-auto" :class="`${height && `height-${height}`}`">
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>
<style></style>
