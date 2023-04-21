<template>
  <h1 pt10 text-9xl fw700 data-text="ZIONE">
    ZIONE
  </h1>
</template>

<style scoped>
h1::before{
content: attr(data-text);
--at-apply:'absolute z--1 text-gray skew-x-50 scale-y-80 translate-y-9px translate-x--53px blur-5';
/* transform: translate(-53px,9px) scaleY(.8) skew(50deg);scale-y-80 translate-x-53px translate-y--9px blur-5*/
-webkit-mask: linear-gradient(transparent ,#000 50%);
}
</style>
