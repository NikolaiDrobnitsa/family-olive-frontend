<template>
  <q-layout view="lHh LpR lFf">
    <!-- Хедер -->
    <q-header elevated class="bg-primary">
      <q-toolbar>
        <q-toolbar-title>
          <div class="row items-center">
            <q-avatar size="40px" class="q-mr-md">
              <img src="~assets/logo.png" alt="Logo">
            </q-avatar>
            <span>Family Olive Club</span>
          </div>
        </q-toolbar-title>

        <!-- Навигация -->
        <q-tabs v-model="tab" align="center" class="desktop-only">
          <q-route-tab name="home" label="Главная" to="/" />
          <q-route-tab name="survey" label="Опрос" to="/questions" />
        </q-tabs>

        <!-- Языки и выход -->
        <div class="q-gutter-sm">
          <q-btn-dropdown flat label="RU">
            <q-list>
              <q-item clickable v-close-popup @click="changeLanguage('en')">
                <q-item-section>English</q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="changeLanguage('zh')">
                <q-item-section>中文</q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="changeLanguage('ar')">
                <q-item-section>العربية</q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="changeLanguage('ru')">
                <q-item-section>Русский</q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>

          <q-btn flat icon="logout" @click="logout">
            <q-tooltip>Выйти</q-tooltip>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <!-- Напоминание о прохождении опроса (если не пройден) -->
    <q-banner v-if="!surveyCompleted" class="bg-info text-white">
      <template v-slot:avatar>
        <q-icon name="info" />
      </template>
      Пройдите короткий опрос для получения наиболее подходящих предложений
      <template v-slot:action>
        <q-btn flat label="Пройти опрос" to="/questions" />
      </template>
    </q-banner>

    <!-- Основной контент -->
    <q-page-container>
      <router-view />
    </q-page-container>

    <!-- Футер -->
    <q-footer class="bg-dark text-white">
      <div class="container q-py-lg">
        <div class="row q-col-gutter-md">
          <div class="col-md-6 col-xs-12">
            <div class="text-h6 q-mb-md">Family Olive Club</div>
            <p>Эксклюзивные оливковые плантации в Средиземноморье. Инвестиции в природу и будущее.</p>
          </div>
          <div class="col-md-3 col-xs-12">
            <div class="text-subtitle1 q-mb-md">Навигация</div>
            <q-list dark dense padding>
              <q-item clickable to="/">
                <q-item-section>Главная</q-item-section>
              </q-item>
              <q-item clickable to="/questions">
                <q-item-section>Опрос</q-item-section>
              </q-item>
            </q-list>
          </div>
          <div class="col-md-3 col-xs-12">
            <div class="text-subtitle1 q-mb-md">Контакты</div>
            <q-list dark dense padding>
              <q-item>
                <q-item-section>
                  <q-item-label>Email: info@familyoliveclub.com</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label>Телефон: +7 (XXX) XXX-XX-XX</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </div>
        </div>
        <div class="row justify-center q-mt-lg">
          <div class="text-caption text-center">
            &copy; {{ year }} Family Olive Club. Все права защищены.
          </div>
        </div>
      </div>
    </q-footer>
  </q-layout>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

export default {
  name: 'MainLayout',

  setup() {
    const $q = useQuasar();
    const router = useRouter();
    const store = useStore();

    const tab = ref('home');
    const year = computed(() => new Date().getFullYear());

    // Проверяем, прошел ли пользователь опрос
    const surveyCompleted = computed(() => store.state.survey.completed);

    // Изменение языка
    const changeLanguage = (lang) => {
      $q.notify({
        color: 'info',
        message: `Язык изменен на ${lang}`
      });
    };

    // Выход из системы
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

    // При монтировании компонента проверяем статус опроса
    onMounted(async () => {
      try {
        await store.dispatch('survey/checkSurveyStatus');
      } catch (error) {
        console.error('Ошибка при проверке статуса опроса:', error);
      }
    });

    return {
      tab,
      year,
      surveyCompleted,
      changeLanguage,
      logout
    };
  }
};
</script>

<style>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 15px;
}

@media (max-width: 1023px) {
  .desktop-only {
    display: none;
  }
}

@media (min-width: 1024px) {
  .mobile-only {
    display: none;
  }
}
</style>
