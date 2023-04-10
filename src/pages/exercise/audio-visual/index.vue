<script lang="ts" setup>
const visualRef = ref<HTMLCanvasElement>()
const audioRef = ref<HTMLAudioElement>()
let canvasCtx: CanvasRenderingContext2D | null | undefined
let isInit = false
let analyseData: Uint8Array
let analyser: AnalyserNode
onMounted(() => {
  canvasCtx = visualRef.value?.getContext('2d')
  initCanvas()
  draw()
})

function draw() {
  requestAnimationFrame(draw)
  // 清空画布
  const { width, height } = visualRef.value!
  canvasCtx!.clearRect(0, 0, width, height)

  if (!isInit)
    return

  // 分析器分析出数据
  analyser.getByteFrequencyData(analyseData)
  const length = analyseData.length / 2.5
  const barWidth = width / length / 2
  for (let i = 0; i < length; i++) {
    const barHeight = analyseData[i] / 255 * height
    const x1 = barWidth * i + width / 2
    const x2 = width / 2 - barWidth * (i + 1)
    const y = height - barHeight
    canvasCtx!.fillStyle = `rgb(${barHeight + 100}, 50, 50)`
    canvasCtx!.fillRect(x1, y, barWidth - 2, barHeight)
    canvasCtx!.fillRect(x2, y, barWidth - 2, barHeight)
  }
}

function initAudio() {
  if (isInit)
    return
  isInit = true
  const auidoCtx = new AudioContext()
  // 音频源节点
  const source = auidoCtx.createMediaElementSource(audioRef.value!)
  // 分析器
  analyser = auidoCtx.createAnalyser()
  // 默认值是2048
  analyser.fftSize = 512
  analyseData = new Uint8Array(analyser.frequencyBinCount)
  source.connect(analyser)
  analyser.connect(auidoCtx.destination)
}

function initCanvas() {
  visualRef.value!.width = window.innerWidth * devicePixelRatio
  visualRef.value!.height = (window.innerHeight / 2) * devicePixelRatio
}
</script>

<template>
  <div>
    <canvas ref="visualRef" w-full h-600px />
    <audio ref="audioRef" mx-a controls src="../../../../public/猫.mp3" @play="initAudio" />
  </div>
</template>
