<script lang="ts" setup>

</script>

<template>
  <div>
    <!--
      -4 1rem=16px
      -1 0.25rem=4px
    -->
    <div
      class="sudoku grid gap-4 place-content-center
             transition-all duration-500
             w-480px h-480px mxa mt-6
      "
    >
      <div style="--x:0;--y:0" class="bg-[length:448px_448px] bg-[url(~/assets/img3.jpg)]" />
      <div style="--x:-1;--y:0" class="bg-[length:448px_448px]  bg-[url(~/assets/img3.jpg)]  " />
      <div style="--x:-2;--y:0" class="bg-[length:448px_448px]  bg-[url(~/assets/img3.jpg)]  " />
      <div style="--x:0;--y:-1" class="bg-[length:448px_448px]  bg-[url(~/assets/img3.jpg)] " />
      <div style="--x:-1;--y:-1" class="bg-[length:448px_448px]  bg-[url(~/assets/img3.jpg)]  " />
      <div style="--x:-2;--y:-1" class="bg-[length:448px_448px]  bg-[url(~/assets/img3.jpg)]" />
      <div style="--x:0;--y:-2" class="bg-[length:448px_448px]  bg-[url(~/assets/img3.jpg)]" />
      <div style="--x:-1;--y:-2" class="bg-[length:448px_448px]  bg-[url(~/assets/img3.jpg)]" />
      <div style="--x:-2;--y:-2" class="bg-[length:448px_448px]  bg-[url(~/assets/img3.jpg)]" />
    </div>
  </div>
</template>

<style scoped>
.sudoku{
  --w:calc(448px / 3);
  grid-template-columns: repeat(3, var(--w));
  grid-template-rows: repeat(3, var(--w));
}
.sudoku:hover {
  filter:drop-shadow(0px 0px 20px #000);
  gap: 0;
  border-radius: 15px;
}
.sudoku:hover div{
  border-radius: 0;
}
.sudoku div{
  transition: all 0.5s;
  background-position: calc(var(--x) * 100%) calc(var(--y) * 100%);
  border-radius: 15px;
}
</style>
