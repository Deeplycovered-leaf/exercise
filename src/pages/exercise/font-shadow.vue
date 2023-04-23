<template>
  <h1
    data-text="ZIONE"
    class="pt10 text-9xl fw700
           before:(
             content-[attr(data-text)]
             absolute z--1
             skew-x-50 scale-y-80 translate-y-9px translate-x--53px blur-5
             text-gray
           )"
  >
    ZIONE
  </h1>
</template>

<style scoped>
h1::before{
mask: linear-gradient(transparent ,#000 50%);
}
</style>
