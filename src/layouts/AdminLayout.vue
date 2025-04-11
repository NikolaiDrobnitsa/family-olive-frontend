<template>
  <q-layout view="hHh LpR fFf">
    <!-- Хедер -->
    <q-header elevated class="bg-dark">
      <q-toolbar>
        <q-btn flat dense round icon="menu" @click="toggleLeftDrawer" />

        <q-toolbar-title>
          Family Olive Club - Панель управления
        </q-toolbar-title>

        <q-btn flat round dense icon="logout" @click="logout">
          <q-tooltip>Выйти</q-tooltip>
        </q-btn>
      </q-toolbar>
    </q-header>

    <!-- Боковое меню -->
    <q-drawer v-model="leftDrawerOpen" show-if-above bordered class="bg-grey-1">
      <q-list>
        <q-item-label header>Меню</q-item-label>

        <q-item clickable v-ripple :to="{ name: 'admin.dashboard' }">
          <q-item-section avatar>
            <q-icon name="dashboard" />
          </q-item-section>
          <q-item-section>Дашборд</q-item-section>
        </q-item>

        <q-item clickable v-ripple :to="{ name: 'admin.users' }">
          <q-item-section avatar>
            <q-icon name="people" />
          </q-item-section>
          <q-item-section>Пользователи</q-item-section>
        </q-item>

        <q-item clickable v-ripple :to="{ name: 'admin.events' }">
          <q-item-section avatar>
            <q-icon name="event" />
          </q-item-section>
          <q-item-section>События</q-item-section>
        </q-item>

        <q-item clickable v-ripple :to="{ name: 'admin.survey' }">
          <q-item-section avatar>
            <q-icon name="quiz" />
          </q-item-section>
          <q-item-section>Опросник</q-item-section>
        </q-item>

        <q-item clickable v-ripple :to="{ name: 'admin.settings' }">
          <q-item-section avatar>
            <q-icon name="settings" />
          </q-item-section>
          <q-item-section>Настройки</q-item-section>
        </q-item>

        <q-separator />

        <q-item clickable v-ripple :to="{ name: 'home' }">
          <q-item-section avatar>
            <q-icon name="home" />
          </q-item-section>
          <q-item-section>Вернуться на сайт</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <!-- Основное содержимое -->
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
    const leftDrawerOpen = ref(false);
    const router = useRouter();
    const store = useStore();
    const $q = useQuasar();

    const toggleLeftDrawer = () => {
      leftDrawerOpen.value = !leftDrawerOpen.value;
    };

    const logout = async () => {
      try {
        await store.dispatch('auth/logout');
        router.push('/auth');
      } catch (error) {
        $q.notify({
          color: 'negative',
          message: 'Ошибка при выходе из системы. Пожалуйста, попробуйте позже.'
        });
        console.error(error);
      }
    };

    return {
      leftDrawerOpen,
      toggleLeftDrawer,
      logout
    };
  }
};
</script>
