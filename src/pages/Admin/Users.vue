<template>
  <q-page padding>
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12">
        <h1 class="text-h4 q-mb-md">Управление пользователями</h1>
        <p class="text-subtitle1">Просмотр и управление пользователями системы</p>
      </div>
    </div>

    <!-- Filter Card -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-h6">Фильтры</div>
      </q-card-section>
      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-md-3 col-sm-6 col-xs-12">
            <q-input
              outlined
              v-model="filters.email"
              label="Email"
              dense
              clearable
              @update:model-value="onFilterChange"
            />
          </div>
          <div class="col-md-3 col-sm-6 col-xs-12">
            <q-input
              outlined
              v-model="filters.phone"
              label="Телефон"
              dense
              clearable
              @update:model-value="onFilterChange"
            />
          </div>
          <div class="col-md-3 col-sm-6 col-xs-12">
            <q-select
              outlined
              v-model="filters.is_verified"
              :options="verificationOptions"
              label="Верификация"
              dense
              clearable
              emit-value
              map-options
              @update:model-value="onFilterChange"
            />
          </div>
          <div class="col-md-3 col-sm-6 col-xs-12">
            <q-select
              outlined
              v-model="filters.interest_type"
              :options="interestTypeOptions"
              label="Тип интереса"
              dense
              clearable
              emit-value
              map-options
              @update:model-value="onFilterChange"
            />
          </div>
        </div>
        <div class="row q-col-gutter-md q-mt-sm">
          <div class="col-md-3 col-sm-6 col-xs-12">
            <q-input
              outlined
              v-model="filters.date_from"
              label="Дата от"
              dense
              clearable
              type="date"
              @update:model-value="onFilterChange"
            />
          </div>
          <div class="col-md-3 col-sm-6 col-xs-12">
            <q-input
              outlined
              v-model="filters.date_to"
              label="Дата до"
              dense
              clearable
              type="date"
              @update:model-value="onFilterChange"
            />
          </div>
          <div class="col-md-3 col-sm-6 col-xs-12">
            <q-input
              outlined
              v-model="filters.utm_source"
              label="UTM Source"
              dense
              clearable
              @update:model-value="onFilterChange"
            />
          </div>
          <div class="col-md-3 col-sm-6 col-xs-12">
            <div class="row justify-end q-gutter-sm">
              <q-btn
                color="primary"
                icon="search"
                label="Поиск"
                @click="loadUsers"
              />
              <q-btn
                outline
                color="grey"
                icon="clear_all"
                label="Сбросить"
                @click="resetFilters"
              />
              <q-btn
                color="green"
                icon="file_download"
                label="Экспорт"
                @click="exportUsers"
              />
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Users Table -->
    <q-card>
      <q-card-section>
        <div class="text-h6">Список пользователей</div>
      </q-card-section>
      <q-card-section>
        <q-table
          :rows="users"
          :columns="columns"
          row-key="id"
          :loading="loading"
          :pagination.sync="pagination"
          :rows-per-page-options="[10, 20, 50, 0]"
          @request="onRequest"
          binary-state-sort
        >
          <!-- Custom column slots -->
          <template v-slot:body-cell-is_verified="props">
            <q-td :props="props">
              <q-badge
                :color="props.row.is_verified ? 'positive' : 'negative'"
              >
                {{ props.row.is_verified ? 'Да' : 'Нет' }}
              </q-badge>
            </q-td>
          </template>

          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <div class="q-gutter-xs">
                <q-btn
                  size="sm"
                  flat
                  dense
                  color="info"
                  icon="visibility"
                  @click="viewUser(props.row)"
                >
                  <q-tooltip>Просмотр</q-tooltip>
                </q-btn>
                <q-btn
                  size="sm"
                  flat
                  dense
                  color="negative"
                  icon="delete"
                  @click="confirmDelete(props.row)"
                >
                  <q-tooltip>Удалить</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </template>

          <!-- Empty results slot -->
          <template v-slot:no-data>
            <div class="full-width row flex-center q-my-lg">
              <q-icon name="sentiment_dissatisfied" size="2em" color="grey-6" />
              <span class="text-grey-6 q-ml-sm">Нет данных для отображения</span>
            </div>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Delete Confirmation Dialog -->
    <q-dialog v-model="deleteDialog.show" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="delete" color="negative" text-color="white" />
          <span class="q-ml-sm">Вы действительно хотите удалить пользователя?</span>
        </q-card-section>
        <q-card-section>
          <p>Email: {{ deleteDialog.user ? deleteDialog.user.email : '' }}</p>
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
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { api } from 'src/boot/axios';

export default {
  name: 'AdminUsers',

  setup() {
    const router = useRouter();
    const $q = useQuasar();

    // Table data
    const users = ref([]);
    const loading = ref(false);
    const pagination = ref({
      sortBy: 'created_at',
      descending: true,
      page: 1,
      rowsPerPage: 20,
      rowsNumber: 0
    });

    // Table columns definition
    const columns = [
      {
        name: 'id',
        label: 'ID',
        field: 'id',
        sortable: true,
        align: 'left'
      },
      {
        name: 'name',
        label: 'Имя',
        field: 'name',
        sortable: true,
        align: 'left'
      },
      {
        name: 'email',
        label: 'Email',
        field: 'email',
        sortable: true,
        align: 'left'
      },
      {
        name: 'phone',
        label: 'Телефон',
        field: 'phone',
        sortable: true,
        align: 'left'
      },
      {
        name: 'is_verified',
        label: 'Верификация',
        field: 'is_verified',
        sortable: true,
        align: 'center'
      },
      {
        name: 'interest_type',
        label: 'Тип интереса',
        field: 'interest_type',
        sortable: true,
        align: 'left'
      },
      {
        name: 'created_at',
        label: 'Дата регистрации',
        field: 'created_at',
        sortable: true,
        align: 'left',
        format: val => new Date(val).toLocaleString()
      },
      {
        name: 'actions',
        label: 'Действия',
        field: 'actions',
        align: 'center',
        sortable: false
      }
    ];

    // Filter options
    const verificationOptions = [
      { label: 'Верифицированные', value: 1 },
      { label: 'Не верифицированные', value: 0 }
    ];

    const interestTypeOptions = [
      { label: 'Плантация 20 га', value: 'Плантация 20 га' },
      { label: '5 га + коттедж', value: '5 га + коттедж' }
    ];

    // Filter state
    const filters = reactive({
      email: '',
      phone: '',
      is_verified: null,
      interest_type: null,
      date_from: '',
      date_to: '',
      utm_source: ''
    });

    // Delete dialog state
    const deleteDialog = reactive({
      show: false,
      user: null,
      loading: false
    });

    // Load users data with pagination and filters
    const loadUsers = async (props = {}) => {
      try {
        loading.value = true;

        // Prepare request params
        const params = {
          page: pagination.value.page,
          per_page: pagination.value.rowsPerPage,
          sortBy: pagination.value.sortBy,
          descending: pagination.value.descending ? 1 : 0,
          ...filters
        };

        // Fetch data from API
        const response = await api.get('/api/admin/users', { params });

        // Update table data
        users.value = response.data.data;
        pagination.value.rowsNumber = response.data.total;
      } catch (error) {
        console.error('Error loading users:', error);
        $q.notify({
          color: 'negative',
          message: 'Ошибка при загрузке данных пользователей',
          icon: 'error'
        });
      } finally {
        loading.value = false;
      }
    };

    // Handle table pagination request
    const onRequest = props => {
      pagination.value.page = props.pagination.page;
      pagination.value.rowsPerPage = props.pagination.rowsPerPage;
      pagination.value.sortBy = props.pagination.sortBy;
      pagination.value.descending = props.pagination.descending;

      loadUsers();
    };

    // Handle filter changes
    const onFilterChange = () => {
      pagination.value.page = 1;
    };

    // Reset filters
    const resetFilters = () => {
      Object.keys(filters).forEach(key => {
        filters[key] = null;
      });
      pagination.value.page = 1;
      loadUsers();
    };

    // Export users
    const exportUsers = async () => {
      try {
        // Prepare export URL with all active filters
        let exportUrl = '/api/admin/users/export?';

        // Add all non-empty filters to the URL
        Object.keys(filters).forEach(key => {
          if (filters[key] !== null && filters[key] !== '') {
            exportUrl += `${key}=${encodeURIComponent(filters[key])}&`;
          }
        });

        // Open export URL in new window/tab
        window.open(exportUrl, '_blank');
      } catch (error) {
        console.error('Error exporting users:', error);
        $q.notify({
          color: 'negative',
          message: 'Ошибка при экспорте данных пользователей',
          icon: 'error'
        });
      }
    };

    // View user details
    const viewUser = user => {
      router.push({ name: 'admin-user-details', params: { id: user.id } });
    };

    // Show delete confirmation
    const confirmDelete = user => {
      deleteDialog.user = user;
      deleteDialog.show = true;
    };

    // Delete user
    const deleteUser = async () => {
      if (!deleteDialog.user) return;

      try {
        deleteDialog.loading = true;

        // Call API to delete user
        await api.delete(`/api/admin/users/${deleteDialog.user.id}`);

        // Close dialog
        deleteDialog.show = false;

        // Show success notification
        $q.notify({
          color: 'positive',
          message: 'Пользователь успешно удален',
          icon: 'check_circle'
        });

        // Reload users list
        loadUsers();
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
      loadUsers();
    });

    return {
      users,
      columns,
      loading,
      pagination,
      filters,
      verificationOptions,
      interestTypeOptions,
      deleteDialog,
      loadUsers,
      onRequest,
      onFilterChange,
      resetFilters,
      exportUsers,
      viewUser,
      confirmDelete,
      deleteUser
    };
  }
};
</script>
