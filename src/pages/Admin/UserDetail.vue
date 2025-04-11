<template>
  <q-page padding>
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 flex justify-between items-center">
        <div>
          <h1 class="text-h4 q-mb-md">Детали пользователя</h1>
          <p class="text-subtitle1">Просмотр подробной информации о пользователе</p>
        </div>
        <q-btn color="primary" icon="arrow_back" label="Назад" :to="{ name: 'admin-users' }" />
      </div>
    </div>

    <!-- Loading indicator -->
    <div v-if="loading" class="full-width row flex-center q-my-lg">
      <q-spinner size="3em" color="primary" />
      <span class="q-ml-sm">Загрузка данных пользователя...</span>
    </div>

    <div v-else-if="user">
      <div class="row q-col-gutter-md">
        <!-- User profile card -->
        <div class="col-md-4 col-sm-12">
          <q-card>
            <q-card-section class="bg-primary text-white">
              <div class="text-h6">Профиль пользователя</div>
            </q-card-section>
            <q-card-section class="q-pa-lg">
              <div class="text-center q-mb-md">
                <q-avatar size="100px" font-size="52px" color="grey-3" text-color="primary">
                  {{ user.name ? user.name.charAt(0).toUpperCase() : 'U' }}
                </q-avatar>
                <div class="text-h6 q-mt-sm">{{ user.name }}</div>
                <q-badge :color="user.is_verified ? 'positive' : 'negative'" class="q-mt-xs">
                  {{ user.is_verified ? 'Верифицирован' : 'Не верифицирован' }}
                </q-badge>
              </div>

              <q-list bordered separator>
                <q-item>
                  <q-item-section>
                    <q-item-label caption>ID пользователя</q-item-label>
                    <q-item-label>{{ user.id }}</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item>
                  <q-item-section>
                    <q-item-label caption>Email</q-item-label>
                    <q-item-label>{{ user.email }}</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item>
                  <q-item-section>
                    <q-item-label caption>Телефон</q-item-label>
                    <q-item-label>{{ user.phone || 'Не указан' }}</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item>
                  <q-item-section>
                    <q-item-label caption>Дата регистрации</q-item-label>
                    <q-item-label>{{ formatDate(user.created_at) }}</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item>
                  <q-item-section>
                    <q-item-label caption>Тип интереса</q-item-label>
                    <q-item-label>{{ user.interest_type || 'Не указан' }}</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item>
                  <q-item-section>
                    <q-item-label caption>IP адрес</q-item-label>
                    <q-item-label>{{ user.ip_address || 'Не зафиксирован' }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
            <q-card-actions align="center">
              <q-btn
                color="negative"
                outline
                icon="delete"
                label="Удалить пользователя"
                @click="confirmDelete"
              />
            </q-card-actions>
          </q-card>
        </div>

        <!-- User details tabs -->
        <div class="col-md-8 col-sm-12">
          <q-card>
            <q-tabs
              v-model="tab"
              class="bg-primary text-white"
              indicator-color="white"
              align="justify"
            >
              <q-tab name="survey" icon="assignment" label="Ответы на опрос" />
              <q-tab name="utm" icon="link" label="UTM метки" />
              <q-tab name="visits" icon="history" label="История посещений" />
            </q-tabs>

            <q-separator />

            <q-tab-panels v-model="tab" animated>
              <!-- Survey responses tab -->
              <q-tab-panel name="survey">
                <div class="text-h6 q-mb-md">Ответы на опрос</div>

                <div v-if="surveyResponsesLoading" class="text-center q-py-lg">
                  <q-spinner size="2em" color="primary" />
                  <div class="q-mt-sm">Загрузка ответов...</div>
                </div>

                <div v-else-if="surveyResponses.length === 0" class="text-center q-py-lg text-grey">
                  <q-icon name="assignment_late" size="3em" />
                  <div class="q-mt-sm">Пользователь не проходил опрос</div>
                </div>

                <q-list v-else bordered separator>
                  <q-item v-for="response in surveyResponses" :key="response.id">
                    <q-item-section>
                      <q-item-label caption>Вопрос</q-item-label>
                      <q-item-label>{{ response.question ? response.question.question : 'Вопрос удален' }}</q-item-label>

                      <q-item-label caption class="q-mt-sm">Ответ</q-item-label>
                      <q-item-label>{{ response.answer }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-tab-panel>

              <!-- UTM info tab -->
              <q-tab-panel name="utm">
                <div class="text-h6 q-mb-md">UTM метки</div>

                <q-list bordered separator>
                  <q-item>
                    <q-item-section>
                      <q-item-label caption>UTM Source</q-item-label>
                      <q-item-label>{{ user.utm_source || 'Не указан' }}</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item>
                    <q-item-section>
                      <q-item-label caption>UTM Medium</q-item-label>
                      <q-item-label>{{ user.utm_medium || 'Не указан' }}</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item>
                    <q-item-section>
                      <q-item-label caption>UTM Campaign</q-item-label>
                      <q-item-label>{{ user.utm_campaign || 'Не указан' }}</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item>
                    <q-item-section>
                      <q-item-label caption>UTM Term</q-item-label>
                      <q-item-label>{{ user.utm_term || 'Не указан' }}</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item>
                    <q-item-section>
                      <q-item-label caption>UTM Content</q-item-label>
                      <q-item-label>{{ user.utm_content || 'Не указан' }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-tab-panel>

              <!-- Visits history tab -->
              <q-tab-panel name="visits">
                <div class="text-h6 q-mb-md">История посещений</div>

                <div v-if="visitsLoading" class="text-center q-py-lg">
                  <q-spinner size="2em" color="primary" />
                  <div class="q-mt-sm">Загрузка истории посещений...</div>
                </div>

                <div v-else-if="visits.length === 0" class="text-center q-py-lg text-grey">
                  <q-icon name="history" size="3em" />
                  <div class="q-mt-sm">Нет данных о посещениях</div>
                </div>

                <q-timeline v-else color="primary">
                  <q-timeline-entry
                    v-for="visit in visits"
                    :key="visit.id"
                    :subtitle="formatDate(visit.visited_at)"
                    icon="offline_pin"
                  >
                    <div>
                      <div><strong>IP:</strong> {{ visit.ip_address }}</div>
                      <div class="text-caption">{{ visit.user_agent }}</div>
                    </div>
                  </q-timeline-entry>
                </q-timeline>
              </q-tab-panel>
            </q-tab-panels>
          </q-card>
        </div>
      </div>
    </div>

    <div v-else class="text-center q-py-xl">
      <q-icon name="error" size="4em" color="negative" />
      <div class="text-h6 q-mt-md">Пользователь не найден</div>
      <q-btn color="primary" label="Вернуться к списку" :to="{ name: 'admin-users' }" class="q-mt-lg" />
    </div>

    <!-- Delete Confirmation Dialog -->
    <q-dialog v-model="deleteDialog.show" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="delete" color="negative" text-color="white" />
          <span class="q-ml-sm">Вы действительно хотите удалить пользователя?</span>
        </q-card-section>
        <q-card-section>
          <p>Email: {{ user ? user.email : '' }}</p>
          <p class="text-negative">Это действие невозможно отменить.</p>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Отмена" color="primary" v-close-popup />
          <q-btn flat label="Удалить" color="negative" @click="deleteUser" :loading="deleteDialog.loading" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { ref, reactive, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useQuasar, date } from 'quasar';
import { api } from 'src/boot/axios';

export default {
  name: 'AdminUserDetails',

  props: {
    id: {
      type: [String, Number],
      required: true
    }
  },

  setup(props) {
    const router = useRouter();
    const route = useRoute();
    const $q = useQuasar();

    // State
    const user = ref(null);
    const loading = ref(true);
    const tab = ref('survey');
    const surveyResponses = ref([]);
    const surveyResponsesLoading = ref(false);
    const visits = ref([]);
    const visitsLoading = ref(false);

    // Delete dialog state
    const deleteDialog = reactive({
      show: false,
      loading: false
    });

    // Format date
    const formatDate = (dateString) => {
      if (!dateString) return 'Н/Д';
      return date.formatDate(dateString, 'DD.MM.YYYY HH:mm:ss');
    };

    // Load user data
    const loadUser = async () => {
      try {
        loading.value = true;
        const response = await api.get(`/api/admin/users/${props.id}`);
        user.value = response.data.user;

        // Load survey responses initially
        await loadSurveyResponses();
      } catch (error) {
        console.error('Error loading user:', error);
        $q.notify({
          color: 'negative',
          message: 'Ошибка при загрузке данных пользователя',
          icon: 'error'
        });
        user.value = null;
      } finally {
        loading.value = false;
      }
    };

    // Load survey responses
    const loadSurveyResponses = async () => {
      try {
        surveyResponsesLoading.value = true;
        const response = await api.get(`/api/admin/users/${props.id}/survey-responses`);
        if (response.data.success) {
          surveyResponses.value = response.data.responses;
        }
      } catch (error) {
        console.error('Error loading survey responses:', error);
        $q.notify({
          color: 'negative',
          message: 'Ошибка при загрузке ответов на опрос',
          icon: 'error'
        });
      } finally {
        surveyResponsesLoading.value = false;
      }
    };

    // Load user visits
    const loadVisits = async () => {
      try {
        visitsLoading.value = true;
        const response = await api.get(`/api/admin/users/${props.id}/visits`);
        if (response.data.success) {
          visits.value = response.data.visits;
        }
      } catch (error) {
        console.error('Error loading visits:', error);
        $q.notify({
          color: 'negative',
          message: 'Ошибка при загрузке истории посещений',
          icon: 'error'
        });
      } finally {
        visitsLoading.value = false;
      }
    };

    // Watch for tab changes to load data
    const watchTab = (newValue) => {
      if (newValue === 'visits' && visits.value.length === 0) {
        loadVisits();
      }
    };

    // Show delete confirmation
    const confirmDelete = () => {
      deleteDialog.show = true;
    };

    // Delete user
    const deleteUser = async () => {
      try {
        deleteDialog.loading = true;

        // Call API to delete user
        await api.delete(`/api/admin/users/${props.id}`);

        // Close dialog
        deleteDialog.show = false;

        // Show success notification
        $q.notify({
          color: 'positive',
          message: 'Пользователь успешно удален',
          icon: 'check_circle'
        });

        // Navigate back to users list
        router.push({ name: 'admin-users' });
      } catch (error) {
        console.error('Error deleting user:', error);
        $q.notify({
          color: 'negative',
          message: 'Ошибка при удалении пользователя',
          icon: 'error'
        });
      } finally {
        deleteDialog.loading = false;
      }
    };

    // Load data on component mount
    onMounted(() => {
      loadUser();
    });

    return {
      user,
      loading,
      tab,
      surveyResponses,
      surveyResponsesLoading,
      visits,
      visitsLoading,
      deleteDialog,
      formatDate,
      watchTab,
      confirmDelete,
      deleteUser
    };
  }
};
</script>
