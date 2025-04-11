<template>
  <div class="admin-login-container">
    <div class="row justify-center items-center">
      <div class="col-xs-12 col-sm-8 col-md-6 col-lg-4">
        <q-card class="admin-login-card q-pa-lg">
          <q-card-section class="text-center">
            <div class="text-center q-mb-lg">
              <q-avatar size="80px">
                <img src="~assets/logo.png" alt="Logo">
              </q-avatar>
              <h1 class="text-h4 q-mt-md">Family Olive Club</h1>
              <div class="text-subtitle1">Административная панель</div>
            </div>
          </q-card-section>

          <q-card-section>
            <q-form @submit="onSubmit" class="q-gutter-md">
              <q-input
                v-model="form.email"
                label="Email"
                type="email"
                outlined
                :rules="[
                  val => !!val || 'Email обязателен',
                  val => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(val) || 'Введите корректный email'
                ]"
              >
                <template v-slot:prepend>
                  <q-icon name="email" />
                </template>
              </q-input>

              <q-input
                v-model="form.password"
                label="Пароль"
                :type="isPwd ? 'password' : 'text'"
                outlined
                :rules="[val => !!val || 'Пароль обязателен']"
              >
                <template v-slot:prepend>
                  <q-icon name="lock" />
                </template>
                <template v-slot:append>
                  <q-icon
                    :name="isPwd ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer"
                    @click="isPwd = !isPwd"
                  />
                </template>
              </q-input>

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

          <q-card-section class="text-center">
            <q-btn
              flat
              color="primary"
              label="Вернуться на сайт"
              to="/"
              class="q-mt-sm"
            />
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

export default {
  name: 'AdminLogin',

  setup() {
    const $q = useQuasar();
    const router = useRouter();
    const store = useStore();

    const form = ref({
      email: '',
      password: ''
    });

    const loading = ref(false);
    const isPwd = ref(true);

    const onSubmit = async () => {
      try {
        loading.value = true;

        const response = await store.dispatch('auth/adminLogin', form.value);

        if (response.success) {
          // Check if user is admin
          if (store.getters['auth/isAdmin']) {
            $q.notify({
              color: 'positive',
              message: 'Авторизация успешна',
              icon: 'check_circle'
            });

            // Redirect to admin dashboard
            router.push({ name: 'admin-dashboard' });
          } else {
            // If user is not admin, logout and show error
            await store.dispatch('auth/logout');

            $q.notify({
              color: 'negative',
              message: 'У вас нет прав доступа к административной панели',
              icon: 'error'
            });
          }
        } else {
          $q.notify({
            color: 'negative',
            message: response.message || 'Ошибка авторизации',
            icon: 'error'
          });
        }
      } catch (error) {
        console.error('Login error:', error);

        // Show error notification
        if (error.response && error.response.status === 401) {
          $q.notify({
            color: 'negative',
            message: 'Неверный email или пароль',
            icon: 'error'
          });
        } else if (error.response && error.response.data && error.response.data.message) {
          $q.notify({
            color: 'negative',
            message: error.response.data.message,
            icon: 'error'
          });
        } else {
          $q.notify({
            color: 'negative',
            message: 'Ошибка при входе. Пожалуйста, попробуйте позже.',
            icon: 'error'
          });
        }
      } finally {
        loading.value = false;
      }
    };

    return {
      form,
      loading,
      isPwd,
      onSubmit
    };
  }
};
</script>

<style>
.admin-login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  background-image: url('../assets/auth-background.jpg');
  background-size: cover;
  background-position: center;
  position: relative;
}

.admin-login-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
}

.admin-login-container .row {
  position: relative;
  z-index: 1;
  width: 100%;
}

.admin-login-card {
  border-radius: 10px;
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.3);
}
</style>
