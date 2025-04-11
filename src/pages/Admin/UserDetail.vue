<template>
  <q-page padding>
    <div class="row q-mb-lg">
      <div class="col-12">
        <q-btn
          icon="arrow_back"
          flat
          label="Назад к списку"
          :to="{ name: 'admin.users' }"
          class="q-mb-md"
        />

        <div class="text-h4">Пользователь</div>
        <div class="text-subtitle1" v-if="user">{{ user.name }} ({{ user.email }})</div>
      </div>
    </div>

    <div v-if="loading" class="text-center q-pa-xl">
      <q-spinner color="primary" size="3em" />
      <div class="q-mt-sm">Загрузка данных пользователя...</div>
    </div>

    <div v-else-if="!user" class="text-center q-pa-xl">
      <q-icon name="error" size="3em" color="negative" />
      <div class="q-mt-sm">Пользователь не найден</div>
    </div>

    <div v-else class="row q-col-gutter-md">
      <!-- Информация о пользователе -->
      <div class="col-md-6 col-xs-12">
        <q-card>
          <q-card-section>
            <div class="text-h6">Основная информация</div>
          </q-card-section>

          <q-separator />

          <q-list>
            <q-item>
              <q-item-section>
                <q-item-label caption>ID</q-item-label>
                <q-item-label>{{ user.id }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section>
                <q-item-label caption>Имя</q-item-label>
                <q-item-label>{{ user.name }}</q-item-label>
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
                <q-item-label>{{ user.phone }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section>
                <q-item-label caption>Верифицирован</q-item-label>
                <q-item-label>
                  <q-chip :color="user.is_verified ? 'positive' : 'negative'" text-color="white">
                    {{ user.is_verified ? 'Да' : 'Нет' }}
                  </q-chip>
                </q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section>
                <q-item-label caption>Тип интереса</q-item-label>
                <q-item-label>
                  <q-chip
                    v-if="user.interest_type"
                    :color="user.interest_type === 'Плантация 20 га' ? 'blue' : 'orange'"
                    text-color="white"
                  >
                    {{ user.interest_type }}
                  </q-chip>
                  <span v-else>Не определен</span>
                </q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section>
                <q-item-label caption>Дата регистрации</q-item-label>
                <q-item-label>{{ formatDate(user.created_at) }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>

        <!-- UTM метки -->
        <q-card class="q-mt-md">
          <q-card-section>
            <div class="text-h6">UTM метки</div>
          </q-card-section>

          <q-separator />

          <q-list>
            <q-item>
              <q-item-section>
                <q-item-label caption>Source</q-item-label>
                <q-item-label>{{ user.utm_source || '-' }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section>
                <q-item-label caption>Medium</q-item-label>
                <q-item-label>{{ user.utm_medium || '-' }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section>
                <q-item-label caption>Campaign</q-item-label>
                <q-item-label>{{ user.utm_campaign || '-' }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section>
                <q-item-label caption>Term</q-item-label>
                <q-item-label>{{ user.utm_term || '-' }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section>
                <q-item-label caption>Content</q-item-label>
                <q-item-label>{{ user.utm_content || '-' }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section>
                <q-item-label caption>IP адрес</q-item-label>
                <q-item-label>{{ user.ip_address || '-' }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </div>

      <!-- Ответы на опросник -->
      <div class="col-md-6 col-xs-12">
        <q-card>
          <q-card-section>
            <div class="text-h6">Ответы на опрос</div>
          </q-card-section>

          <q-separator />

          <div v-if="loadingResponses" class="text-center q-pa-md">
            <q-spinner color="primary" size="2em" />
            <div class="q-mt-sm">Загрузка ответов...</div>
          </div>

          <div v-else-if="!userResponses.length" class="text-center q-pa-lg">
            <q-icon name="question_answer" size="3em" color="grey-5" />
            <div class="q-mt-sm text-grey">Пользователь еще не проходил опрос</div>
          </div>

          <q-list v-else>
            <q-item v-for="response in userResponses" :key="response.id">
              <q-item-section>
                <q-item-label caption>{{ response.question?.question }}</q-item-label>
                <q-item-label>{{ response.answer }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
import { computed, onMounted, ref } from 'vue';
import { useStore } from 'vuex';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { date } from 'quasar';

export default {
  name: 'AdminUserDetail',

  props: {
    id: {
      type: [Number, String],
      required: true
    }
  },

  setup(props) {
    const store = useStore();
    const route = useRoute();
    const router = useRouter();
    const $q = useQuasar();

    const loading = computed(() => store.getters['admin/isLoading']);
    const user = computed(() => store.getters['admin/selectedUser']);
    const userResponses = computed(() => store.getters['admin/userResponses']);

    const loadingResponses = ref(false);

    // Загрузка данных пользователя
    onMounted(async () => {
      try {
        await store.dispatch('admin/fetchUser', props.id);

        loadingResponses.value = true;
        await store.dispatch('admin/fetchUserResponses', props.id);
        loadingResponses.value = false;
      } catch (error) {
        $q.notify({
          color: 'negative',
          message: 'Ошибка при загрузке данных пользователя'
        });

        // Если пользователь не найден, возвращаемся к списку
        router.push({ name: 'admin.users' });
      }
    });

    // Форматирование даты
    const formatDate = (dateString) => {
      return date.formatDate(dateString, 'DD.MM.YYYY HH:mm');
    };

    return {
      loading,
      user,
      userResponses,
      loadingResponses,
      formatDate
    };
  }
};
</script>
