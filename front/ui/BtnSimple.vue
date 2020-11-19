<template>
  <div class="root">
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: "btn1",
  data() {
    return {

    }
  }
}
</script>

<style scoped>
  .root {
    color: green;
    background-color: red;
  }
</style>