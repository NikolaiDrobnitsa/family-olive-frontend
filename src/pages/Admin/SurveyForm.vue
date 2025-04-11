<template>
  <q-page padding>
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 flex justify-between items-center">
        <div>
          <h1 class="text-h4 q-mb-md">{{ isEdit ? 'Редактирование вопроса' : 'Добавление вопроса' }}</h1>
          <p class="text-subtitle1">{{ isEdit ? 'Измените данные вопроса' : 'Заполните форму для создания нового вопроса' }}</p>
        </div>
        <q-btn color="primary" icon="arrow_back" label="Назад к списку" :to="{ name: 'admin-survey' }" />
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
          <div class="text-h6">Информация о вопросе</div>
        </q-card-section>

        <q-card-section>
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <q-input
                v-model="form.question"
                label="Текст вопроса *"
                outlined
                :rules="[val => !!val || 'Вопрос обязателен для заполнения']"
              />
            </div>
          </div>

          <div class="row q-col-gutter-md q-mt-md">
            <div class="col-md-6 col-sm-12">
              <q-select
                v-model="form.type"
                :options="typeOptions"
                label="Тип вопроса *"
                outlined
                emit-value
                map-options
                :rules="[val => !!val || 'Тип вопроса обязателен']"
              >
                <template v-slot:prepend>
                  <q-icon :name="getTypeIcon(form.type)" />
                </template>
              </q-select>
            </div>

            <div class="col-md-6 col-sm-12">
              <q-toggle
                v-model="form.is_active"
                label="Вопрос активен"
              />
              <div class="text-caption q-mt-sm">
                Если отключено, вопрос не будет отображаться в опроснике
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <q-card v-if="form.type === 'single' || form.type === 'multiple'">
        <q-card-section>
          <div class="text-h6">Варианты ответов</div>
          <div class="text-caption">Добавьте варианты ответов для вопроса с выбором</div>
        </q-card-section>

        <q-card-section>
          <div v-for="(option, index) in form.options" :key="index" class="row q-col-gutter-md q-mb-sm">
            <div class="col-10">
              <q-input
                v-model="form.options[index]"
                outlined
                dense
                :label="`Вариант ${index + 1}`"
                :rules="[val => !!val || 'Вариант ответа не может быть пустым']"
              />
            </div>
            <div class="col-2">
              <q-btn
                flat
                round
                color="negative"
                icon="delete"
                @click="removeOption(index)"
                class="q-mt-sm"
              />
            </div>
          </div>

          <div class="row justify-center q-mt-md">
            <q-btn
              color="positive"
              icon="add"
              label="Добавить вариант"
              @click="addOption"
            />
          </div>
        </q-card-section>
      </q-card>

      <q-card>
        <q-card-section>
          <div class="text-h6">Предпросмотр</div>
          <div class="text-caption">Так вопрос будет выглядеть в опроснике</div>
        </q-card-section>

        <q-card-section>
          <q-card class="q-pa-md bg-grey-1">
            <div class="text-h6 q-mb-md">{{ form.question || 'Текст вопроса' }}</div>

            <!-- Single choice preview -->
            <div v-if="form.type === 'single' && form.options.length > 0">
              <q-option-group
                v-model="previewValue"
                :options="form.options.map((opt, idx) => ({ label: opt, value: idx }))"
                type="radio"
                color="primary"
              />
            </div>

            <!-- Multiple choice preview -->
            <div v-else-if="form.type === 'multiple' && form.options.length > 0">
              <q-option-group
                v-model="previewMultiValue"
                :options="form.options.map((opt, idx) => ({ label: opt, value: idx }))"
                type="checkbox"
                color="primary"
              />
            </div>

            <!-- Text input preview -->
            <div v-else-if="form.type === 'text'">
              <q-input
                v-model="previewText"
                outlined
                placeholder="Введите ваш ответ"
              />
            </div>

            <!-- No options warning -->
            <div v-else-if="form.type === 'single' || form.type === 'multiple'" class="text-negative">
              Добавьте варианты ответов для предпросмотра
            </div>

            <!-- No type selected warning -->
            <div v-else class="text-grey">
              Выберите тип вопроса для предпросмотра
            </div>
          </q-card>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            type="button"
            flat
            color="negative"
            label="Отмена"
            :to="{ name: 'admin-survey' }"
          />
          <q-btn
            type="submit"
            color="primary"
            :label="isEdit ? 'Сохранить изменения' : 'Создать вопрос'"
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
  name: 'AdminSurveyForm',

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

    // Preview state
    const previewValue = ref(0);
    const previewMultiValue = ref([]);
    const previewText = ref('');

    // Form data
    const form = reactive({
      question: '',
      type: 'single',
      options: [''],
      is_active: true
    });

    // Type options
    const typeOptions = [
      { label: 'Одиночный выбор', value: 'single', icon: 'radio_button_checked' },
      { label: 'Множественный выбор', value: 'multiple', icon: 'check_box' },
      { label: 'Текстовый ответ', value: 'text', icon: 'text_fields' }
    ];

    // Type icon mapping
    const typeIconMapping = {
      'single': 'radio_button_checked',
      'multiple': 'check_box',
      'text': 'text_fields'
    };

    // Get type icon
    const getTypeIcon = (type) => {
      return typeIconMapping[type] || 'help';
    };

    // Add option
    const addOption = () => {
      form.options.push('');
    };

    // Remove option
    const removeOption = (index) => {
      if (form.options.length > 1) {
        form.options.splice(index, 1);
      } else {
        $q.notify({
          color: 'warning',
          message: 'Необходимо оставить хотя бы один вариант ответа',
          icon: 'warning'
        });
      }
    };

    // Load question data (for edit mode)
    const loadQuestion = async () => {
      try {
        loading.value = true;
        const response = await api.get(`/api/admin/survey/${props.id}`);
        const question = response.data.question;

        // Update form with question data
        form.question = question.question || '';
        form.type = question.type || 'single';
        form.is_active = question.is_active === undefined ? true : question.is_active;

        // Set options if available
        if (question.options && Array.isArray(question.options) && question.options.length > 0) {
          form.options = [...question.options];
        } else if (form.type !== 'text') {
          // Default empty option for non-text questions
          form.options = [''];
        }
      } catch (error) {
        console.error('Error loading question:', error);
        $q.notify({
          color: 'negative',
          message: 'Ошибка при загрузке данных вопроса',
          icon: 'error'
        });

        // Navigate back to survey list on error
        router.push({ name: 'admin-survey' });
      } finally {
        loading.value = false;
      }
    };

    // Submit form
    const submitForm = async () => {
      try {
        // Validate options for non-text questions
        if ((form.type === 'single' || form.type === 'multiple') &&
          (!form.options.length || form.options.some(opt => !opt.trim()))) {
          $q.notify({
            color: 'negative',
            message: 'Пожалуйста, заполните все варианты ответов',
            icon: 'error'
          });
          return;
        }

        submitting.value = true;

        // Prepare data for API
        const data = {
          question: form.question,
          type: form.type,
          is_active: form.is_active
        };

        // Add options for non-text questions
        if (form.type === 'single' || form.type === 'multiple') {
          data.options = form.options;
        }

        let response;

        if (isEdit.value) {
          // Update existing question
          response = await api.put(`/api/admin/survey/${props.id}`, data);
        } else {
          // Create new question
          response = await api.post('/api/admin/survey', data);
        }

        // Show success notification
        $q.notify({
          color: 'positive',
          message: isEdit.value
            ? 'Вопрос успешно обновлен'
            : 'Вопрос успешно создан',
          icon: 'check_circle'
        });

        // Navigate back to survey list
        router.push({ name: 'admin-survey' });
      } catch (error) {
        console.error('Error submitting question:', error);

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
            message: 'Ошибка при сохранении вопроса',
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
        loadQuestion();
      }
    });

    return {
      isEdit,
      loading,
      submitting,
      form,
      typeOptions,
      previewValue,
      previewMultiValue,
      previewText,
      getTypeIcon,
      addOption,
      removeOption,
      submitForm
    };
  }
};
</script>
