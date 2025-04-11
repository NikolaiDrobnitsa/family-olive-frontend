<template>
  <div class="auth-container">
    <div class="row justify-center items-center">
      <div class="col-xs-12 col-sm-10 col-md-8 col-lg-6">
        <login-form v-if="!verificationNeeded" />
        <verification-form v-else />
      </div>
    </div>
  </div>
</template>

<script>
import { computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import LoginForm from 'src/components/Auth/LoginForm.vue';
import VerificationForm from 'src/components/Auth/VerificationForm.vue';

export default {
  name: 'AuthPage',

  components: {
    LoginForm,
    VerificationForm
  },

  setup() {
    const store = useStore();
    const router = useRouter();


    const verificationNeeded = computed(() => store.state.auth.verificationNeeded);
    const isAdmin = computed(() => store.getters['auth/isAdmin']);

// Проверяем статус авторизации при загрузке
    onMounted(async () => {
      const isAuthenticated = store.getters['auth/isAuthenticated'];

      if (isAuthenticated) {
        try {
          const authStatus = await store.dispatch('auth/checkAuth');
          if (authStatus.authenticated) {
            // Если пользователь уже авторизован и является админом
            if (authStatus.user.is_admin) {
              router.push({ name: 'admin.dashboard' });
            } else {
              // Обычный пользователь
              router.push({ name: 'home' });
            }
          }
        } catch (error) {
          console.error('Ошибка при проверке авторизации:', error);
        }
      }
    });

    return {
      verificationNeeded
    };
  }
};
</script>

<style>
.auth-container {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  background-image: url('../assets/auth-background.jpg');
  background-size: cover;
  background-position: center;
  position: relative;
}

.auth-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}

.auth-container .row {
  position: relative;
  z-index: 1;
}

</style>
