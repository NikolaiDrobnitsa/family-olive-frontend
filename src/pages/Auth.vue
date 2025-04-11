<template>
  <div class="auth-container">
    <div class="row justify-center items-center">
      <div class="col-xs-12 col-sm-8 col-md-6 col-lg-4">
        <login-form v-if="!verificationNeeded" />
        <verification-form v-else />
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';
import { useStore } from 'vuex';
import LoginForm from 'components/Auth/LoginForm.vue';
import VerificationForm from 'components/Auth/VerificationForm.vue';

export default {
  name: 'AuthPage',

  components: {
    LoginForm,
    VerificationForm
  },

  setup() {
    const store = useStore();

    const verificationNeeded = computed(() => store.state.auth.verificationNeeded);

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
