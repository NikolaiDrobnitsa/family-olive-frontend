<template>
  <q-card class="verification-card q-pa-lg">
    <q-card-section>
      <div class="text-h5 text-center q-mb-md">Подтверждение Email</div>
      <div class="text-subtitle1 text-center q-mb-lg">
        Мы отправили код подтверждения на ваш email: {{ email }}
      </div>
    </q-card-section>

    <q-card-section>
      <q-form @submit="onSubmit" class="q-gutter-md">
        <q-input
          v-model="verificationCode"
          label="Код подтверждения"
          outlined
          mask="######"
          :rules="[val => !!val || 'Введите код подтверждения']"
        />

        <div class="q-mt-lg">
          <q-btn
            label="Подтвердить"
            type="submit"
            color="primary"
            class="full-width"
            :loading="loading"
          />
        </div>

        <div class="text-center q-mt-md">
          <q-btn
            flat
            label="Отправить код повторно"
            @click="resendCode"
            :disabled="loading || resendLoading"
            :loading="resendLoading"
          />
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script>
import { ref, computed } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

export default {
  name: 'VerificationForm',

  setup() {
    const $q = useQuasar();
    const router = useRouter();
    const store = useStore();

    const verificationCode = ref('');
    const loading = ref(false);
    const resendLoading = ref(false);

    const email = computed(() => store.state.auth.pendingEmail);

    const onSubmit = async () => {
      try {
        loading.value = true;

        const response = await store.dispatch('auth/verifyCode', {
          email: email.value,
          code: verificationCode.value
        });

        if (response.success) {
          // Если верификация успешна, переходим на главную страницу
          $q.notify({
            color: 'positive',
            message: 'Email успешно подтвержден!'
          });

          router.push('/');
        }
      } catch (error) {
        $q.notify({
          color: 'negative',
          message: error.response?.data?.message || 'Ошибка при верификации. Пожалуйста, проверьте код.'
        });
        console.error(error);
      } finally {
        loading.value = false;
      }
    };

    const resendCode = async () => {
      try {
        resendLoading.value = true;

        const response = await store.dispatch('auth/resendCode', {
          email: email.value
        });

        if (response.success) {
          $q.notify({
            color: 'positive',
            message: 'Код успешно отправлен повторно на ваш email.'
          });
        }
      } catch (error) {
        $q.notify({
          color: 'negative',
          message: 'Ошибка при отправке кода. Пожалуйста, попробуйте позже.'
        });
        console.error(error);
      } finally {
        resendLoading.value = false;
      }
    };

    return {
      email,
      verificationCode,
      loading,
      resendLoading,
      onSubmit,
      resendCode
    };
  }
};
</script>

<style scoped>
.verification-card {
  max-width: 450px;
  width: 100%;
}
</style>
