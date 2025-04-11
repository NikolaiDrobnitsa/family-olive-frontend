<template>
  <q-layout view="hHh LpR lFf">
    <!-- Admin Header -->
    <q-header elevated class="bg-primary">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title>
          <div class="row items-center">
            <q-avatar size="40px" class="q-mr-md">
              <img src="~assets/logo.png" alt="Family Olive Club Logo">
            </q-avatar>
            <span>Family Olive Club - Административная панель</span>
          </div>
        </q-toolbar-title>

        <q-space />

        <!-- User menu -->
        <q-btn-dropdown flat dense icon="account_circle">
          <q-list>
            <q-item clickable v-close-popup @click="navigateToFrontend">
              <q-item-section avatar>
                <q-icon name="home" />
              </q-item-section>
              <q-item-section>На главную страницу</q-item-section>
            </q-item>
            <q-separator />
            <q-item clickable v-close-popup @click="logout">
              <q-item-section avatar>
                <q-icon name="logout" />
              </q-item-section>
              <q-item-section>Выйти</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </q-toolbar>
    </q-header>

    <!-- Admin Sidebar -->
    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      class="bg-grey-1"
    >
      <q-list>
        <q-item-label header>Навигация</q-item-label>

        <q-item clickable v-ripple :to="{ name: 'admin-dashboard' }" exact>
          <q-item-section avatar>
            <q-icon name="dashboard" />
          </q-item-section>
          <q-item-section>
            Дашборд
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple :to="{ name: 'admin-users' }">
          <q-item-section avatar>
            <q-icon name="people" />
          </q-item-section>
          <q-item-section>
            Пользователи
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple :to="{ name: 'admin-events' }">
          <q-item-section avatar>
            <q-icon name="event" />
          </q-item-section>
          <q-item-section>
            События
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple :to="{ name: 'admin-survey' }">
          <q-item-section avatar>
            <q-icon name="assignment" />
          </q-item-section>
          <q-item-section>
            Опросник
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple :to="{ name: 'admin-settings' }">
          <q-item-section avatar>
            <q-icon name="settings" />
          </q-item-section>
          <q-item-section>
            Настройки
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <!-- Page Content -->
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { useQuasar } from 'quasar';

export default {
  name: 'AdminLayout',

  setup() {
    const router = useRouter();
    const store = useStore();
    const $q = useQuasar();
    const leftDrawerOpen = ref(false);

    const toggleLeftDrawer = () => {
      leftDrawerOpen.value = !leftDrawerOpen.value;
    };

    const navigateToFrontend = () => {
      router.push({ name: 'home' });
    };

    const logout = async () => {
      try {
        await store.dispatch('auth/logout');
        router.push({ name: 'auth' });
        $q.notify({
          color: 'positive',
          message: 'Вы успешно вышли из системы',
          icon: 'logout'
        });
      } catch (error) {
        $q.notify({
          color: 'negative',
          message: 'Произошла ошибка при выходе из системы',
          icon: 'error'
        });
        console.error('Logout error:', error);
      }
    };

    return {
      leftDrawerOpen,
      toggleLeftDrawer,
      navigateToFrontend,
      logout
    };
  }
};
</script>
