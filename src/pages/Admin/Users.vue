<template>
  <q-page padding>
    <div class="row q-mb-lg justify-between items-center">
      <div class="col-md-6 col-xs-12">
        <div class="text-h4">Пользователи</div>
        <div class="text-subtitle1">Управление пользователями системы</div>
      </div>

      <div class="col-md-6 col-xs-12 text-right">
        <q-btn
          color="primary"
          icon="download"
          label="Экспорт"
          @click="exportUsers"
          :loading="loading"
        />
      </div>
    </div>

    <!-- Фильтры -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-h6">Фильтры</div>

        <div class="row q-col-gutter-md q-mt-md">
          <div class="col-md-3 col-sm-6 col-xs-12">
            <q-input
              v-model="filters.email"
              label="Email"
              outlined
              dense
            />
          </div>

          <div class="col-md-3 col-sm-6 col-xs-12">
            <q-input
              v-model="filters.phone"
              label="Телефон"
              outlined
              dense
            />
          </div>

          <div class="col-md-3 col-sm-6 col-xs-12">
            <q-select
              v-model="filters.is_verified"
              :options="[
                { label: 'Все', value: null },
                { label: 'Верифицированные', value: true },
                { label: 'Неверифицированные', value: false }
              ]"
              label="Статус верификации"
              outlined
              dense
              emit-value
              map-options
            />
          </div>

          <div class="col-md-3 col-sm-6 col-xs-12">
            <q-select
              v-model="filters.interest_type"
              :options="[
                { label: 'Все', value: null },
                { label: 'Плантация 20 га', value: 'Плантация 20 га' },
                { label: '5 га + коттедж', value: '5 га + коттедж' }
              ]"
              label="Тип интереса"
              outlined
              dense
              emit-value
              map-options
            />
          </div>
        </div>

        <div class="row q-col-gutter-md q-mt-md">
          <div class="col-md-3 col-sm-6 col-xs-12">
            <q-input
              v-model="filters.date_from"
              label="Дата регистрации от"
              outlined
              dense
              type="date"
            />
          </div>

          <div class="col-md-3 col-sm-6 col-xs-12">
            <q-input
              v-model="filters.date_to"
              label="Дата регистрации до"
              outlined
              dense
              type="date"
            />
          </div>

          <div class="col-md-3 col-sm-6 col-xs-12">
            <q-input
              v-model="filters.utm_source"
              label="UTM Source"
              outlined
              dense
            />
          </div>

          <div class="col-md-3 col-sm-6 col-xs-12 text-right">
            <q-btn
              color="primary"
              label="Применить"
              class="q-mt-md"
              @click="applyFilters"
              :loading="loading"
            />
            <q-btn
              color="grey"
              label="Сбросить"
              class="q-mt-md q-ml-sm"
              @click="resetFilters"
              :loading="loading"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Таблица пользователей -->
    <q-card>
      <q-card-section>
        <div v-if="loading" class="text-center q-pa-lg">
          <q-spinner color="primary" size="3em" />
          <div class="q-mt-sm">Загрузка пользователей...</div>
        </div>

        <div v-else-if="users.length === 0" class="text-center q-pa-lg">
          <q-icon name="person_off" size="3em" color="grey-5" />
          <div class="q-mt-sm text-grey">Пользователи не найдены</div>
        </div>

        <q-table
          v-else
          :rows="users"
          :columns="columns"
          row-key="id"
          :pagination="{
            rowsPerPage: pagination.perPage,
            page: pagination.page,
            rowsNumber: pagination.total
          }"
          @request="onRequest"
          binary-state-sort
        >
          <!-- Верификация -->
          <template v-slot:body-cell-is_verified="props">
            <q-td :props="props">
              <q-chip :color="props.row.is_verified ? 'positive' : 'negative'" text-color="white" dense>
                {{ props.row.is_verified ? 'Да' : 'Нет' }}
              </q-chip>
            </q-td>
          </template>

          <!-- Интерес -->
          <template v-slot:body-cell-interest_type="props">
            <q-td :props="props">
              <q-chip
                v-if="props.row.interest_type"
                :color="props.row.interest_type === 'Плантация 20 га' ? 'blue' : 'orange'"
                text-color="white"
                dense
              >
                {{ props.row.interest_type }}
              </q-chip>
              <span v-else>-</span>
            </q-td>
          </template>

          <!-- Дата -->
          <template v-slot:body-cell-created_at="props">
            <q-td :props="props">
              {{ formatDate(props.row.created_at) }}
            </q-td>
          </template>

          <!-- Действия -->
          <template v-slot:body-cell-actions="props">
            <q-td :props="props" class="q-gutter-xs">
              <q-btn
                flat
                round
                dense
                color="info"
                icon="visibility"
                @click="viewUser(props.row)"
              >
                <q-tooltip>Просмотр</q-tooltip>
              </q-btn>

              <q-btn
                flat
                round
                dense
                color="negative"
                icon="delete"
                @click="confirmDelete(props.row)"
              >
                <q-tooltip>Удалить</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Диалог подтверждения удаления -->
    <q-dialog v-model="deleteDialog" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="negative" text-color="white" />
          <span class="q-ml-sm">Вы действительно хотите удалить пользователя?</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Отмена" color="primary" v-close-popup />
          <q-btn flat label="Удалить" color="negative" @click="deleteUser" :loading="loading" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { ref, computed, onMounted, reactive } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { date } from 'quasar';

export default {
  name: 'AdminUsers',

  setup() {
    const store = useStore();
    const router = useRouter();
    const $q = useQuasar();

    // Состояние компонента
    const loading = computed(() => store.getters['admin/isLoading']);
    const users = computed(() => store.getters['admin/usersList']);
    const pagination = computed(() => store.getters['admin/usersPagination']);

    const filters = reactive({
      email: '',
      phone: '',
      is_verified: null,
      interest_type: null,
      date_from: '',
      date_to: '',
      utm_source: ''
    });

    const columns = [
      { name: 'id', label: 'ID', field: 'id', sortable: true, align: 'left' },
      { name: 'name', label: 'Имя', field: 'name', sortable: true, align: 'left' },
      { name: 'email', label: 'Email', field: 'email', sortable: true, align: 'left' },
      { name: 'phone', label: 'Телефон', field: 'phone', sortable: true, align: 'left' },
      { name: 'is_verified', label: 'Верифицирован', field: 'is_verified', sortable: true, align: 'center' },
      { name: 'interest_type', label: 'Интерес', field: 'interest_type', sortable: true, align: 'center' },
      { name: 'created_at', label: 'Дата регистрации', field: 'created_at', sortable: true, align: 'center' },
      { name: 'actions', label: 'Действия', field: 'actions', align: 'center' }
    ];

    const deleteDialog = ref(false);
    const userToDelete = ref(null);

    // Загрузка пользователей при монтировании компонента
    onMounted(async () => {
      try {
        await store.dispatch('admin/fetchUsers');
      } catch (error) {
        showError('Ошибка при загрузке пользователей');
      }
    });

    // Обработчики событий
    const applyFilters = async () => {
      try {
        await store.dispatch('admin/fetchUsers', { filters });
      } catch (error) {
        showError('Ошибка при применении фильтров');
      }
    };

    const resetFilters = () => {
      Object.keys(filters).forEach(key => {
        filters[key] = key === 'is_verified' || key === 'interest_type' ? null : '';
      });
      applyFilters();
    };

    const onRequest = async (props) => {
      const { page, rowsPerPage } = props.pagination;

      try {
        await store.dispatch('admin/fetchUsers', {
          page,
          filters
        });
      } catch (error) {
        showError('Ошибка при загрузке пользователей');
      }
    };

    const viewUser = (user) => {
      router.push({ name: 'admin.users.show', params: { id: user.id } });
    };

    const confirmDelete = (user) => {
      userToDelete.value = user;
      deleteDialog.value = true;
    };

    const deleteUser = async () => {
      if (!userToDelete.value) return;

      try {
        await store.dispatch('admin/deleteUser', userToDelete.value.id);
        await store.dispatch('admin/fetchUsers', { filters });

        $q.notify({
          color: 'positive',
          message: 'Пользователь успешно удален'
        });
      } catch (error) {
        showError('Ошибка при удалении пользователя');
      }
    };

    const exportUsers = () => {
      // Создаем временную ссылку для скачивания
      const exportUrl = `${process.env.API_URL}/api/admin/users/export?${new URLSearchParams(filters).toString()}`;

      // Создаем ссылку и эмулируем клик
      const link = document.createElement('a');
      link.href = exportUrl;
      link.setAttribute('download', 'users.xlsx');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      $q.notify({
        color: 'positive',
        message: 'Экспорт пользователей начат'
      });
    };

    // Вспомогательные функции
    const formatDate = (dateString) => {
      return date.formatDate(dateString, 'DD.MM.YYYY HH:mm');
    };

    const showError = (message) => {
      $q.notify({
        color: 'negative',
        message
      });
    };

    return {
      users,
      loading,
      pagination,
      columns,
      filters,
      deleteDialog,
      applyFilters,
      resetFilters,
      onRequest,
      viewUser,
      confirmDelete,
      deleteUser,
      exportUsers,
      formatDate
    };
  }
};
</script>
