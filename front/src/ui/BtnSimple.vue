<template>
  <div class="btn">
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: "btn1",
}
</script>

<style scoped>
  .btn {
    padding: 10px;
    cursor: pointer;
    border: 1px solid black;
  }
</style>