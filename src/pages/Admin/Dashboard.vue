<!-- src/pages/admin/Dashboard.vue -->
<template>
  <q-page padding>
    <div class="row q-mb-lg">
      <div class="col-12">
        <div class="text-h4">Дашборд</div>
        <div class="text-subtitle1">Общая статистика проекта</div>
      </div>
    </div>

    <div class="row q-col-gutter-md q-mb-xl">
      <!-- Карточки со статистикой -->
      <div class="col-md-3 col-sm-6 col-xs-12">
        <q-card class="dashboard-card">
          <q-card-section>
            <div class="text-h6">Всего пользователей</div>
            <div class="text-h3 q-mt-sm">{{ stats.totalUsers }}</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-md-3 col-sm-6 col-xs-12">
        <q-card class="dashboard-card">
          <q-card-section>
            <div class="text-h6">Верифицированных</div>
            <div class="text-h3 q-mt-sm">{{ stats.verifiedUsers }}</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-md-3 col-sm-6 col-xs-12">
        <q-card class="dashboard-card">
          <q-card-section>
            <div class="text-h6">Событий</div>
            <div class="text-h3 q-mt-sm">{{ stats.totalEvents }}</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-md-3 col-sm-6 col-xs-12">
        <q-card class="dashboard-card">
          <q-card-section>
            <div class="text-h6">Прошли опрос</div>
            <div class="text-h3 q-mt-sm">{{ stats.surveyCompleted }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div class="row q-col-gutter-md">
      <!-- График регистраций -->
      <div class="col-md-8 col-xs-12">
        <q-card>
          <q-card-section>
            <div class="text-h6">Регистрации за последние 7 дней</div>
          </q-card-section>

          <q-card-section>
            <div v-if="loading" class="text-center q-pa-md">
              <q-spinner color="primary" size="3em" />
              <div class="q-mt-sm">Загрузка данных...</div>
            </div>

            <div v-else-if="usersByDate.length === 0" class="text-center q-pa-lg">
              <q-icon name="bar_chart" size="3em" color="grey-5" />
              <div class="q-mt-sm text-grey">Нет данных для отображения</div>
            </div>

            <div v-else>
              <div class="chart-container" style="height: 300px;">
                <q-bar
                  :data="chartData"
                  :labels="chartLabels"
                  color="primary"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Быстрые действия -->
      <div class="col-md-4 col-xs-12">
        <q-card>
          <q-card-section>
            <div class="text-h6">Быстрые действия</div>
          </q-card-section>

          <q-list>
            <q-item clickable v-ripple :to="{ name: 'admin.events.create' }">
              <q-item-section avatar>
                <q-icon name="add_circle" color="positive" />
              </q-item-section>
              <q-item-section>Создать событие</q-item-section>
            </q-item>

            <q-item clickable v-ripple :to="{ name: 'admin.survey.create' }">
              <q-item-section avatar>
                <q-icon name="add_circle" color="positive" />
              </q-item-section>
              <q-item-section>Создать вопрос опросника</q-item-section>
            </q-item>

            <q-item clickable v-ripple :to="{ name: 'admin.users' }">
              <q-item-section avatar>
                <q-icon name="download" color="info" />
              </q-item-section>
              <q-item-section>Экспорт пользователей</q-item-section>
            </q-item>

            <q-item clickable v-ripple :to="{ name: 'admin.settings' }">
              <q-item-section avatar>
                <q-icon name="settings" color="warning" />
              </q-item-section>
              <q-item-section>Настройки сайта</q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useQuasar } from 'quasar';
import { date } from 'quasar';

export default {
  name: 'AdminDashboard',

  setup() {
    const store = useStore();
    const $q = useQuasar();

    // Получаем статистику из хранилища
    const stats = computed(() => store.getters['admin/dashboardStats']);
    const loading = computed(() => store.getters['admin/isLoading']);
    const usersByDate = computed(() => stats.value.usersByDate || []);

    // Подготавливаем данные для графика
    const chartLabels = computed(() => {
      return usersByDate.value.map(item => date.formatDate(item.date, 'DD.MM'));
    });

    const chartData = computed(() => {
      return usersByDate.value.map(item => item.count);
    });

    // Загружаем данные при монтировании компонента
    onMounted(async () => {
      try {
        await store.dispatch('admin/fetchDashboardStats');
      } catch (error) {
        $q.notify({
          color: 'negative',
          message: 'Ошибка при загрузке данных дашборда'
        });
      }
    });

    return {
      stats,
      loading,
      usersByDate,
      chartLabels,
      chartData
    };
  },

  // Компонент графика (имитация)
  components: {
    'q-bar': {
      props: ['data', 'labels', 'color'],
      template: `
        <div class="chart-placeholder">
          <div v-for="(value, index) in data" :key="index" class="chart-bar" :style="{
            height: (value / Math.max(...data)) * 100 + '%',
            backgroundColor: color === 'primary' ? '#1976D2' : '#E0E0E0'
          }">
            <span class="chart-value">{{ value }}</span>
          </div>
        </div>
        <div class="chart-labels">
          <div v-for="(label, index) in labels" :key="index" class="chart-label">
            {{ label }}
          </div>
        </div>
      `,
    }
  }
};
</script>

<style scoped>
.dashboard-card {
  height: 100%;
}

.chart-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chart-placeholder {
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  height: 85%;
  width: 100%;
}

.chart-bar {
  width: 40px;
  position: relative;
  transition: height 0.5s;
  border-radius: 4px 4px 0 0;
  min-height: 1px;
}

.chart-value {
  position: absolute;
  top: -25px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
}

.chart-labels {
  display: flex;
  justify-content: space-around;
  height: 15%;
  width: 100%;
  margin-top: 10px;
}

.chart-label {
  width: 40px;
  text-align: center;
  font-size: 12px;
}
</style>
