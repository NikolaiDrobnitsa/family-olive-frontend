<template>
  <q-card class="login-card q-pa-lg">
    <q-card-section>
      <div class="text-center q-mb-md">
        <q-avatar size="80px">
          <img src="~assets/logo.png" alt="Logo">
        </q-avatar>
      </div>
      <div class="text-h5 text-center q-mb-md">Family Olive Club</div>
      <div class="text-subtitle1 text-center q-mb-lg">Пожалуйста, войдите для доступа к сайту</div>
    </q-card-section>

    <q-card-section>
      <q-form @submit="onSubmit" class="q-gutter-md">
        <q-input
          v-model="form.name"
          label="Ваше имя"
          outlined
          :rules="[val => !!val || 'Имя обязательно']"
        />

        <q-input
          v-model="form.email"
          label="Email"
          type="email"
          outlined
          :rules="[
            val => !!val || 'Email обязателен',
            val => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(val) || 'Введите корректный email'
          ]"
        />

        <q-input
          v-model="form.phone"
          label="Телефон"
          outlined
          mask="+# (###) ###-##-##"
          :rules="[val => !!val || 'Телефон обязателен']"
        />

        <div class="q-mt-lg">
          <q-btn
            label="Войти"
            type="submit"
            color="primary"
            class="full-width"
            :loading="loading"
          />
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script>
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

export default {
  name: 'LoginForm',

  setup() {
    const $q = useQuasar();
    const router = useRouter();
    const store = useStore();

    const form = ref({
      name: '',
      email: '',
      phone: ''
    });

    const loading = ref(false);

    const onSubmit = async () => {
      try {
        loading.value = true;

        // Добавляем UTM-метки, если они есть в URL
        const urlParams = new URLSearchParams(window.location.search);
        const formData = { ...form.value };

        if (urlParams.has('utm_source')) formData.utm_source = urlParams.get('utm_source');
        if (urlParams.has('utm_medium')) formData.utm_medium = urlParams.get('utm_medium');
        if (urlParams.has('utm_campaign')) formData.utm_campaign = urlParams.get('utm_campaign');
        if (urlParams.has('utm_term')) formData.utm_term = urlParams.get('utm_term');
        if (urlParams.has('utm_content')) formData.utm_content = urlParams.get('utm_content');

        // Отправляем запрос на вход
        const response = await store.dispatch('auth/login', formData);

        if (response.success) {
          if (response.verified) {
            // Если пользователь уже верифицирован, переходим на главную страницу
            router.push('/');
          } else {
            // Если пользователь не верифицирован, сохраняем email и показываем форму верификации
            store.commit('auth/SET_PENDING_EMAIL', response.email);
            store.commit('auth/SET_VERIFICATION_NEEDED', true);
          }
        }
      } catch (error) {
        $q.notify({
          color: 'negative',
          message: 'Ошибка при входе. Пожалуйста, проверьте введенные данные.'
        });
        console.error(error);
      } finally {
        loading.value = false;
      }
    };

    return {
      form,
      loading,
      onSubmit
    };
  }
};
</script>

<style scoped>
.login-card {
  max-width: 450px;
  width: 100%;
}
</style>
