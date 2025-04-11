<template>
  <q-page padding>
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 flex justify-between items-center">
        <div>
          <h1 class="text-h4 q-mb-md">{{ isEdit ? 'Редактирование события' : 'Создание события' }}</h1>
          <p class="text-subtitle1">{{ isEdit ? 'Измените данные события' : 'Заполните форму для создания нового события' }}</p>
        </div>
        <q-btn color="primary" icon="arrow_back" label="Назад к списку" :to="{ name: 'admin-events' }" />
      </div>
    </div>

    <!-- Loading indicator -->
    <div v-if="loading" class="full-width row flex-center q-my-lg">
      <q-spinner size="3em" color="primary" />
      <span class="q-ml-sm">Загрузка данных...</span>
    </div>

    <q-form
      v-else
      @submit="submitForm"
      class="q-gutter-md"
    >
      <q-card>
        <q-card-section>
          <div class="text-h6">Основная информация</div>
        </q-card-section>

        <q-card-section>
          <div class="row q-col-gutter-md">
            <div class="col-md-6 col-sm-12">
              <q-input
                v-model="form.title"
                label="Название события *"
                outlined
                :rules="[val => !!val || 'Название обязательно для заполнения']"
              />
            </div>

            <div class="col-md-6 col-sm-12">
              <q-input
                v-model="form.event_date"
                label="Дата события"
                outlined
                type="datetime-local"
              />
            </div>
          </div>

          <div class="row q-col-gutter-md q-mt-md">
            <div class="col-md-6 col-sm-12">
              <q-select
                v-model="form.category"
                :options="categoryOptions"
                label="Категория"
                outlined
                emit-value
                map-options
                clearable
              />
            </div>

            <div class="col-md-6 col-sm-12">
              <q-input
                v-model="form.link"
                label="Ссылка"
                outlined
                placeholder="https://example.com"
              />
            </div>
          </div>

          <div class="row q-col-gutter-md q-mt-md">
            <div class="col-12">
              <q-editor
                v-model="form.description"
                min-height="200px"
                label="Описание"
                placeholder="Введите описание события..."
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <q-card>
        <q-card-section>
          <div class="text-h6">Изображение события</div>
        </q-card-section>

        <q-card-section>
          <div class="row q-col-gutter-md">
            <div class="col-md-4 col-sm-12">
              <q-file
                v-model="form.image_file"
                outlined
                accept="image/*"
                label="Выберите изображение"
              >
                <template v-slot:prepend>
                  <q-icon name="image" />
                </template>
              </q-file>
              <div class="text-caption q-mt-sm">
                Рекомендуемый размер: 1200x800px, максимальный размер: 2MB
              </div>
            </div>

            <div class="col-md-8 col-sm-12">
              <div class="text-center">
                <div v-if="form.image_url || form.image_file" class="q-mb-md">
                  <q-img
                    :src="getImagePreviewUrl()"
                    style="max-height: 200px; max-width: 100%"
                    fit="contain"
                  />
                </div>
                <div v-else class="text-grey flex flex-center" style="height: 200px; border: 1px dashed #ccc;">
                  <div class="text-center">
                    <q-icon name="image" size="4em" />
                    <div class="q-mt-sm">Нет изображения</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <q-card>
        <q-card-section>
          <div class="text-h6">Дополнительные настройки</div>
        </q-card-section>

        <q-card-section>
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <q-toggle
                v-model="form.is_active"
                label="Событие активно"
              />
              <div class="text-caption q-mt-sm">
                Если отключено, событие не будет отображаться на сайте
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            type="button"
            flat
            color="negative"
            label="Отмена"
            :to="{ name: 'admin-events' }"
          />
          <q-btn
            type="submit"
            color="primary"
            :label="isEdit ? 'Сохранить изменения' : 'Создать событие'"
            :loading="submitting"
          />
        </q-card-actions>
      </q-card>
    </q-form>
  </q-page>
</template>

<script>
import { ref, computed, reactive, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import { api } from 'src/boot/axios';

export default {
  name: 'AdminEventForm',

  props: {
    id: {
      type: [String, Number],
      default: null
    }
  },

  setup(props) {
    const router = useRouter();
    const route = useRoute();
    const $q = useQuasar();

    // Determine if editing or creating
    const isEdit = computed(() => !!props.id);

    // State
    const loading = ref(isEdit.value);
    const submitting = ref(false);

    // Form data
    const form = reactive({
      title: '',
      description: '',
      event_date: '',
      link: '',
      category: null,
      is_active: true,
      image_file: null,
      image_url: null
    });

    // Category options
    const categoryOptions = [
      { label: 'Плантация 20 га', value: '20ha' },
      { label: '5 га + коттедж', value: '5ha_cottage' }
    ];

    // Get image preview URL safely (fixes URL.createObjectURL issue)
    const getImagePreviewUrl = () => {
      if (form.image_file) {
        // Use window.URL instead of just URL
        return window.URL.createObjectURL(form.image_file);
      } else if (form.image_url) {
        return form.image_url;
      }
      return '';
    };

    // Load event data (for edit mode)
    const loadEvent = async () => {
      try {
        loading.value = true;
        const response = await api.get(`/api/admin/events/${props.id}`);
        const event = response.data.event;

        // Update form with event data
        form.title = event.title || '';
        form.description = event.description || '';
        form.link = event.link || '';
        form.category = event.category || null;
        form.is_active = event.is_active === undefined ? true : event.is_active;
        form.image_url = event.image_url || null;

        // Format date for input if available
        if (event.event_date) {
          const date = new Date(event.event_date);
          form.event_date = date.toISOString().slice(0, 16);
        }
      } catch (error) {
        console.error('Error loading event:', error);
        $q.notify({
          color: 'negative',
          message: 'Ошибка при загрузке данных события',
          icon: 'error'
        });

        // Navigate back to events list on error
        router.push({ name: 'admin-events' });
      } finally {
        loading.value = false;
      }
    };

    // Submit form
    const submitForm = async () => {
      try {
        submitting.value = true;

        // Create FormData for file upload
        const formData = new FormData();
        formData.append('title', form.title);
        formData.append('description', form.description || '');

        if (form.event_date) {
          formData.append('event_date', form.event_date);
        }

        if (form.link) {
          formData.append('link', form.link);
        }

        if (form.category) {
          formData.append('category', form.category);
        }

        formData.append('is_active', form.is_active ? '1' : '0');

        if (form.image_file) {
          formData.append('image', form.image_file);
        }

        let response;

        if (isEdit.value) {
          // Update existing event
          formData.append('_method', 'PUT'); // For Laravel method spoofing
          response = await api.post(`/api/admin/events/${props.id}`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
        } else {
          // Create new event
          response = await api.post('/api/admin/events', formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
        }

        // Show success notification
        $q.notify({
          color: 'positive',
          message: isEdit.value
            ? 'Событие успешно обновлено'
            : 'Событие успешно создано',
          icon: 'check_circle'
        });

        // Navigate back to events list
        router.push({ name: 'admin-events' });
      } catch (error) {
        console.error('Error submitting event:', error);

        // Show error notification with validation errors if available
        if (error.response && error.response.data && error.response.data.errors) {
          const errorMessages = Object.values(error.response.data.errors).flat();

          errorMessages.forEach(message => {
            $q.notify({
              color: 'negative',
              message: message,
              icon: 'error'
            });
          });
        } else {
          $q.notify({
            color: 'negative',
            message: 'Ошибка при сохранении события',
            icon: 'error'
          });
        }
      } finally {
        submitting.value = false;
      }
    };

    // Load data on component mount (for edit mode)
    onMounted(() => {
      if (isEdit.value) {
        loadEvent();
      }
    });

    return {
      isEdit,
      loading,
      submitting,
      form,
      categoryOptions,
      submitForm,
      getImagePreviewUrl
    };
  }
};
</script>
