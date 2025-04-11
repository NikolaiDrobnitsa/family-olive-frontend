<template>
  <q-page padding>
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12">
        <h1 class="text-h4 q-mb-md">Административная панель</h1>
        <p class="text-subtitle1">Добро пожаловать в административную панель Family Olive Club</p>
      </div>
    </div>

    <!-- Dashboard Stats Cards -->
    <div class="row q-col-gutter-md q-mb-lg">
      <!-- Total Users Card -->
      <div class="col-md-3 col-sm-6 col-xs-12">
        <q-card>
          <q-card-section class="bg-primary text-white">
            <div class="text-h6">Пользователи</div>
          </q-card-section>
          <q-card-section class="text-center">
            <div v-if="loading">
              <q-spinner color="primary" size="3em" />
            </div>
            <div v-else class="text-h3">{{ dashboardStats.totalUsers || 0 }}</div>
            <div class="text-subtitle2">Всего пользователей</div>
          </q-card-section>
          <q-card-actions align="center">
            <q-btn flat color="primary" :to="{ name: 'admin-users' }">
              Управление пользователями
            </q-btn>
          </q-card-actions>
        </q-card>
      </div>

      <!-- Verified Users Card -->
      <div class="col-md-3 col-sm-6 col-xs-12">
        <q-card>
          <q-card-section class="bg-positive text-white">
            <div class="text-h6">Верифицированные</div>
          </q-card-section>
          <q-card-section class="text-center">
            <div v-if="loading">
              <q-spinner color="positive" size="3em" />
            </div>
            <div v-else class="text-h3">{{ dashboardStats.verifiedUsers || 0 }}</div>
            <div class="text-subtitle2">Верифицированных пользователей</div>
          </q-card-section>
          <q-card-actions align="center">
            <q-btn flat color="positive" :to="{ name: 'admin-users', query: { is_verified: 1 } }">
              Показать верифицированных
            </q-btn>
          </q-card-actions>
        </q-card>
      </div>

      <!-- Events Card -->
      <div class="col-md-3 col-sm-6 col-xs-12">
        <q-card>
          <q-card-section class="bg-warning text-white">
            <div class="text-h6">События</div>
          </q-card-section>
          <q-card-section class="text-center">
            <div v-if="loading">
              <q-spinner color="warning" size="3em" />
            </div>
            <div v-else class="text-h3">{{ dashboardStats.totalEvents || 0 }}</div>
            <div class="text-subtitle2">Всего событий</div>
          </q-card-section>
          <q-card-actions align="center">
            <q-btn flat color="warning" :to="{ name: 'admin-events' }">
              Управление событиями
            </q-btn>
          </q-card-actions>
        </q-card>
      </div>

      <!-- Quick Actions Card -->
      <div class="col-md-3 col-sm-6 col-xs-12">
        <q-card>
          <q-card-section class="bg-info text-white">
            <div class="text-h6">Быстрые действия</div>
          </q-card-section>
          <q-card-section>
            <q-list dense>
              <q-item clickable v-ripple :to="{ name: 'admin-event-create' }">
                <q-item-section avatar>
                  <q-icon name="add_circle" color="positive" />
                </q-item-section>
                <q-item-section>Добавить событие</q-item-section>
              </q-item>
              <q-item clickable v-ripple :to="{ name: 'admin-survey-create' }">
                <q-item-section avatar>
                  <q-icon name="add_circle" color="positive" />
                </q-item-section>
                <q-item-section>Добавить вопрос</q-item-section>
              </q-item>
              <q-item clickable v-ripple :to="{ name: 'admin-settings' }">
                <q-item-section avatar>
                  <q-icon name="settings" color="grey" />
                </q-item-section>
                <q-item-section>Настройки системы</q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Recent Users Chart -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-md-8 col-sm-12">
        <q-card>
          <q-card-section>
            <div class="text-h6">Регистрации пользователей за последние 7 дней</div>
          </q-card-section>
          <q-card-section v-if="loading" class="text-center">
            <q-spinner color="primary" size="3em" />
          </q-card-section>
          <q-card-section v-else>
            <div style="height: 300px">
              <bar-chart v-if="chartData.labels.length > 0" :data="chartData" />
              <div v-else class="text-center text-grey q-pt-lg">
                <q-icon name="bar_chart" size="4em" />
                <div>Нет данных для отображения</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Recent Activity -->
      <div class="col-md-4 col-sm-12">
        <q-card>
          <q-card-section>
            <div class="text-h6">Последние активности</div>
          </q-card-section>
          <q-card-section>
            <q-timeline color="secondary">
              <q-timeline-entry v-for="(activity, index) in recentActivity" :key="index"
                                :title="activity.title"
                                :subtitle="activity.subtitle"
                                :icon="activity.icon"
                                :color="activity.color"
              >
                {{ activity.content }}
              </q-timeline-entry>
            </q-timeline>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { api } from 'src/boot/axios';
import { date } from 'quasar';

// Example chart component (you would need to implement this)
const BarChart = {
  props: ['data'],
  template: `
    <canvas ref="chartCanvas"></canvas>
  `,
  watch: {
    data: {
      handler() {
        this.renderChart();
      },
      deep: true
    }
  },
  mounted() {
    this.renderChart();
  },
  methods: {
    renderChart() {
      // This is a placeholder for actual chart rendering
      // You would use a library like Chart.js or integrate with Quasar's charts
      console.log('Chart data:', this.data);
      // Actual implementation would go here
    }
  }
};

export default {
  name: 'AdminDashboard',
  components: {
    BarChart
  },
  setup() {
    const loading = ref(true);
    const dashboardStats = ref({
      totalUsers: 0,
      verifiedUsers: 0,
      totalEvents: 0,
      usersByDate: []
    });

    const chartData = computed(() => {
      const labels = [];
      const data = [];

      if (dashboardStats.value && dashboardStats.value.usersByDate) {
        dashboardStats.value.usersByDate.forEach(item => {
          labels.unshift(date.formatDate(item.date, 'DD.MM'));
          data.unshift(item.count);
        });
      }

      return {
        labels,
        datasets: [
          {
            label: 'Новые пользователи',
            backgroundColor: '#1976D2',
            data
          }
        ]
      };
    });

    // Sample recent activity data
    const recentActivity = ref([
      {
        title: 'Регистрация пользователя',
        subtitle: 'Сегодня в 10:45',
        icon: 'person_add',
        color: 'primary',
        content: 'Новый пользователь зарегистрировался в системе'
      },
      {
        title: 'Добавлено событие',
        subtitle: 'Вчера в 15:30',
        icon: 'event',
        color: 'warning',
        content: 'Администратор добавил новое событие'
      },
      {
        title: 'Обновление системы',
        subtitle: '15.04.2025 в 12:00',
        icon: 'system_update',
        color: 'info',
        content: 'Система была обновлена до последней версии'
      }
    ]);

    // Load dashboard data
    const loadDashboardData = async () => {
      try {
        loading.value = true;
        const response = await api.get('/api/admin/dashboard');
        dashboardStats.value = response.data;
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      loadDashboardData();
    });

    return {
      loading,
      dashboardStats,
      chartData,
      recentActivity
    };
  }
};
</script>
