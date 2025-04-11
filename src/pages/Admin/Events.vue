<!-- src/pages/admin/Events.vue -->
<template>
  <q-page padding>
    <div class="row q-mb-lg justify-between items-center">
      <div class="col-md-6 col-xs-12">
        <div class="text-h4">События</div>
        <div class="text-subtitle1">Управление событиями и новостями</div>
      </div>

      <div class="col-md-6 col-xs-12 text-right">
        <q-btn
          color="primary"
          icon="add"
          label="Создать событие"
          :to="{ name: 'admin.events.create' }"
        />
      </div>
    </div>

    <div v-if="loading" class="text-center q-pa-xl">
      <q-spinner color="primary" size="3em" />
      <div class="q-mt-sm">Загрузка событий...</div>
    </div>

    <div v-else-if="events.length === 0" class="text-center q-pa-xl">
      <q-icon name="event_busy" size="3em" color="grey-5" />
      <div class="q-mt-sm text-grey">События не найдены</div>
      <q-btn color="primary" label="Создать первое событие" class="q-mt-md" :to="{ name: 'admin.events.create' }" />
    </div>

    <div v-else>
      <q-card>
        <q-card-section>
          <div class="text-h6 q-mb-md">Список событий</div>
          <p class="text-caption text-grey">Перетащите события для изменения порядка отображения</p>

          <q-table
            :rows="events"
            :columns="columns"
            row-key="id"
            :pagination="{ rowsPerPage: 0 }"
          >
            <!-- Порядок сортировки -->
            <template v-slot:body-cell-sort_order="props">
              <q-td :props="props" auto-width>
                <q-btn flat round dense icon="drag_indicator" class="cursor-move" />
                {{ props.row.sort_order }}
              </q-td>
            </template>

            <!-- Заголовок и изображение -->
            <template v-slot:body-cell-title="props">
              <q-td :props="props">
                <div class="row items-center">
                  <div v-if="props.row.image" class="col-auto">
                    <q-img
                      :src="getImageUrl(props.row.image)"
                      width="80px"
                      height="50px"
                      class="rounded-borders"
                    />
                  </div>
                  <div class="col q-ml-md">
                    <div class="text-weight-bold">{{ props.row.title }}</div>
                    <div class="text-caption ellipsis-2-lines">{{ props.row.description }}</div>
                  </div>
                </div>
              </q-td>
            </template>

            <!-- Дата события -->
            <template v-slot:body-cell-event_date="props">
              <q-td :props="props">
                {{ props.row.event_date ? formatDate(props.row.event_date) : '-' }}
              </q-td>
            </template>

            <!-- Категория -->
            <template v-slot:body-cell-category="props">
              <q-td :props="props">
                <q-chip
                  v-if="props.row.category"
                  :color="props.row.category === '20ha' ? 'blue' : 'orange'"
                  text-color="white"
                  dense
                >
                  {{ formatCategory(props.row.category) }}
                </q-chip>
                <span v-else class="text-grey">Все</span>
              </q-td>
            </template>

            <!-- Активность -->
            <template v-slot:body-cell-is_active="props">
              <q-td :props="props">
                <q-badge :color="props.row.is_active ? 'positive' : 'negative'" class="q-py-xs q-px-sm">
                  {{ props.row.is_active ? 'Активно' : 'Неактивно' }}
                </q-badge>
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
                  icon="edit"
                  :to="{ name: 'admin.events.edit', params: { id: props.row.id } }"
                >
                  <q-tooltip>Редактировать</q-tooltip>
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
    </div>

    <!-- Диалог подтверждения удаления -->
    <q-dialog v-model="deleteDialog" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="negative" text-color="white" />
          <span class="q-ml-sm">Вы действительно хотите удалить событие "{{ eventToDelete?.title }}"?</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Отмена" color="primary" v-close-popup />
          <q-btn flat label="Удалить" color="negative" @click="deleteEvent" :loading="loading" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useQuasar } from 'quasar';
import { date } from 'quasar';

export default {
  name: 'AdminEvents',

  setup() {
    const store = useStore();
    const $q = useQuasar();

    const events = computed(() => store.getters['admin/eventsList']);
    const loading = computed(() => store.getters['admin/isLoading']);

    const columns = [
      { name: 'sort_order', label: '#', field: 'sort_order', sortable: true, align: 'center' },
      { name: 'title', label: 'Название и описание', field: 'title', sortable: true, align: 'left' },
      { name: 'event_date', label: 'Дата события', field: 'event_date', sortable: true, align: 'center' },
      { name: 'category', label: 'Категория', field: 'category', sortable: true, align: 'center' },
      { name: 'is_active', label: 'Статус', field: 'is_active', sortable: true, align: 'center' },
      { name: 'actions', label: 'Действия', field: 'actions', align: 'center' }
    ];

    const deleteDialog = ref(false);
    const eventToDelete = ref(null);

    // Загрузка событий при монтировании компонента
    onMounted(async () => {
      try {
        await store.dispatch('admin/fetchEvents');
      } catch (error) {
        $q.notify({
          color: 'negative',
          message: 'Ошибка при загрузке событий'
        });
      }
    });

    // Форматирование категории события
    const formatCategory = (category) => {
      if (category === '20ha') return 'Плантация 20 га';
      if (category === '5ha_cottage') return '5 га + коттедж';
      return category;
    };

    // Форматирование даты
    const formatDate = (dateString) => {
      return date.formatDate(dateString, 'DD.MM.YYYY HH:mm');
    };

    // Получение URL изображения
    const getImageUrl = (image) => {
      return `${process.env.API_URL}/storage/events/${image}`;
    };

    // Подтверждение удаления
    const confirmDelete = (event) => {
      eventToDelete.value = event;
      deleteDialog.value = true;
    };

    // Удаление события
    const deleteEvent = async () => {
      if (!eventToDelete.value) return;

      try {
        await store.dispatch('admin/deleteEvent', eventToDelete.value.id);

        $q.notify({
          color: 'positive',
          message: 'Событие успешно удалено'
        });
      } catch (error) {
        $q.notify({
          color: 'negative',
          message: 'Ошибка при удалении события'
        });
      }
    };

    return {
      events,
      loading,
      columns,
      deleteDialog,
      eventToDelete,
      formatCategory,
      formatDate,
      getImageUrl,
      confirmDelete,
      deleteEvent
    };
  }
};
</script>

<style scoped>
.ellipsis-2-lines {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

<!-- src/pages/admin/EventForm.vue -->
<template>
  <q-page padding>
    <div class="row q-mb-lg">
      <div class="col-12">
        <q-btn
          icon="arrow_back"
          flat
          label="Назад к списку"
          :to="{ name: 'admin.events' }"
          class="q-mb-md"
        />

        <div class="text-h4">{{ isEdit ? 'Редактирование события' : 'Создание события' }}</div>
        <div class="text-subtitle1" v-if="isEdit && event">{{ event.title }}</div>
      </div>
    </div>

    <div v-if="loading && isEdit" class="text-center q-pa-xl">
      <q-spinner color="primary" size="3em" />
      <div class="q-mt-sm">Загрузка данных события...</div>
    </div>

    <q-card v-else>
      <q-card-section>
        <q-form @submit="onSubmit" class="q-gutter-md">
          <div class="row q-col-gutter-md">
            <!-- Основная информация -->
            <div class="col-md-8 col-xs-12">
              <q-input
                v-model="form.title"
                label="Название события *"
                outlined
                :rules="[val => !!val || 'Название обязательно']"
              />

              <q-input
                v-model="form.description"
                label="Описание"
                type="textarea"
                outlined
                autogrow
                class="q-mt-md"
              />

              <q-input
                v-model="form.link"
                label="Ссылка"
                outlined
                class="q-mt-md"
              />

              <q-input
                v-model="form.event_date"
                label="Дата события"
                outlined
                type="datetime-local"
                class="q-mt-md"
              />
            </div>

            <!-- Настройки и изображение -->
            <div class="col-md-4 col-xs-12">
              <q-select
                v-model="form.category"
                :options="categoryOptions"
                label="Категория"
                outlined
                emit-value
                map-options
              />

              <q-toggle
                v-model="form.is_active"
                label="Событие активно"
                color="positive"
                class="q-mt-lg"
              />

              <div class="q-mt-lg">
                <div class="text-subtitle1 q-mb-sm">Изображение</div>

                <div v-if="imagePreview || (isEdit && form.image)" class="q-mb-md">
                  <q-img
                    :src="imagePreview || getImageUrl(form.image)"
                    style="height: 180px; max-width: 100%"
                    class="rounded-borders"
                  />
                  <q-btn
                    class="q-mt-xs"
                    dense
                    color="negative"
                    icon="delete"
                    @click="removeImage"
                    label="Удалить"
                  />
                </div>

                <q-file
                  v-model="imageFile"
                  label="Загрузить изображение"
                  outlined
                  accept=".jpg, .jpeg, .png"
                  @update:model-value="onFileSelected"
                >
                  <template v-slot:prepend>
                    <q-icon name="attach_file" />
                  </template>
                </q-file>
                <div class="text-caption text-grey">
                  Рекомендуемые размеры: 800x600px, формат JPG или PNG
                </div>
              </div>
            </div>
          </div>

          <div class="row q-mt-lg">
            <div class="col-12 text-right">
              <q-btn
                type="submit"
                color="primary"
                :label="isEdit ? 'Сохранить изменения' : 'Создать событие'"
                :loading="submitting"
              />
            </div>
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import { useStore } from 'vuex';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';

export default {
  name: 'AdminEventForm',

  props: {
    id: {
      type: [Number, String],
      required: false
    }
  },

  setup(props) {
    const store = useStore();
    const route = useRoute();
    const router = useRouter();
    const $q = useQuasar();

    const loading = computed(() => store.getters['admin/isLoading']);
    const event = computed(() => store.getters['admin/selectedEvent']);
    const isEdit = computed(() => !!props.id);

    const form = ref({
      title: '',
      description: '',
      link: '',
      event_date: '',
      category: null,
      is_active: true,
      image: null // Для хранения имени уже загруженного изображения
    });

    const submitting = ref(false);
    const imageFile = ref(null);
    const imagePreview = ref(null);

    const categoryOptions = [
      { label: 'Все', value: null },
      { label: 'Плантация 20 га', value: '20ha' },
      { label: '5 га + коттедж', value: '5ha_cottage' }
    ];

    // Загрузка данных события для редактирования
    onMounted(async () => {
      if (isEdit.value) {
        try {
          await store.dispatch('admin/fetchEvent', props.id);
        } catch (error) {
          $q.notify({
            color: 'negative',
            message: 'Ошибка при загрузке данных события'
          });
          router.push({ name: 'admin.events' });
        }
      }
    });

    // При получении данных события заполняем форму
    watch(event, (newEvent) => {
      if (newEvent) {
        form.value = {
          title: newEvent.title || '',
          description: newEvent.description || '',
          link: newEvent.link || '',
          event_date: formatDateForInput(newEvent.event_date) || '',
          category: newEvent.category,
          is_active: newEvent.is_active !== undefined ? newEvent.is_active : true,
          image: newEvent.image
        };
      }
    });

    // Обработка выбора файла
    const onFileSelected = (file) => {
      if (!file) {
        imagePreview.value = null;
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        imagePreview.value = e.target.result;
      };
      reader.readAsDataURL(file);
    };

    // Удаление изображения
    const removeImage = () => {
      imageFile.value = null;
      imagePreview.value = null;
      form.value.image = null;
    };

    // Получение URL изображения
    const getImageUrl = (image) => {
      if (!image) return null;
      return `${process.env.API_URL}/storage/events/${image}`;
    };

    // Форматирование даты для input type="datetime-local"
    const formatDateForInput = (dateString) => {
      if (!dateString) return '';

      const date = new Date(dateString);
      return date.toISOString().slice(0, 16);
    };

    // Отправка формы
    const onSubmit = async () => {
      submitting.value = true;

      try {
        const eventData = { ...form.value };

        // Добавляем файл изображения, если он выбран
        if (imageFile.value) {
          eventData.image = imageFile.value;
        }

        // Отправляем данные на сервер
        if (isEdit.value) {
          await store.dispatch('admin/updateEvent', {
            eventId: props.id,
            eventData
          });

          $q.notify({
            color: 'positive',
            message: 'Событие успешно обновлено'
          });
        } else {
          await store.dispatch('admin/createEvent', eventData);

          $q.notify({
            color: 'positive',
            message: 'Событие успешно создано'
          });
        }

        // Переходим обратно к списку событий
        router.push({ name: 'admin.events' });
      } catch (error) {
        $q.notify({
          color: 'negative',
          message: `Ошибка при ${isEdit.value ? 'обновлении' : 'создании'} события`
        });
      } finally {
        submitting.value = false;
      }
    };

    return {
      form,
      loading,
      submitting,
      isEdit,
      event,
      imageFile,
      imagePreview,
      categoryOptions,
      onFileSelected,
      removeImage,
      getImageUrl,
      onSubmit
    };
  }
};
</script>
