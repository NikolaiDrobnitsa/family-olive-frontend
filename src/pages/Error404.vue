<template>
  <div class="fullscreen bg-primary text-white text-center q-pa-md flex flex-center">
    <div>
      <div style="font-size: 30vh">
        404
      </div>

      <div class="text-h2" style="opacity:.4">
        Страница не найдена
      </div>

      <q-btn
        color="white"
        text-color="primary"
        unelevated
        to="/"
        label="Вернуться на главную"
        no-caps
        class="q-mt-xl"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'Error404'
}
</script>
