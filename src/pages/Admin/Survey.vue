<!-- src/pages/admin/Survey.vue -->
<template>
  <q-page padding>
    <div class="row q-mb-lg justify-between items-center">
      <div class="col-md-6 col-xs-12">
        <div class="text-h4">Опросник</div>
        <div class="text-subtitle1">Управление вопросами опросника</div>
      </div>

      <div class="col-md-6 col-xs-12 text-right">
        <q-btn
          color="primary"
          icon="add"
          label="Создать вопрос"
          :to="{ name: 'admin.survey.create' }"
        />
      </div>
    </div>

    <div v-if="loading" class="text-center q-pa-xl">
      <q-spinner color="primary" size="3em" />
      <div class="q-mt-sm">Загрузка вопросов...</div>
    </div>

    <div v-else-if="questions.length === 0" class="text-center q-pa-xl">
      <q-icon name="help" size="3em" color="grey-5" />
      <div class="q-mt-sm text-grey">Вопросы не найдены</div>
      <q-btn color="primary" label="Создать первый вопрос" class="q-mt-md" :to="{ name: 'admin.survey.create' }" />
    </div>

    <div v-else>
      <q-card>
        <q-card-section>
          <div class="text-h6 q-mb-md">Список вопросов</div>
          <p class="text-caption text-grey">Перетащите вопросы для изменения порядка отображения</p>

          <q-table
            :rows="questions"
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

            <!-- Текст вопроса -->
            <template v-slot:body-cell-question="props">
              <q-td :props="props">
                <div class="text-weight-bold">{{ props.row.question }}</div>
              </q-td>
            </template>

            <!-- Тип вопроса -->
            <template v-slot:body-cell-type="props">
              <q-td :props="props">
                <q-chip
                  :color="getTypeColor(props.row.type)"
                  text-color="white"
                  dense
                >
                  {{ formatType(props.row.type) }}
                </q-chip>
              </q-td>
            </template>

            <!-- Варианты ответов -->
            <template v-slot:body-cell-options="props">
              <q-td :props="props">
                <div v-if="props.row.type === 'text'">
                  <span class="text-grey">Текстовый ответ</span>
                </div>
                <div v-else-if="props.row.options && props.row.options.length">
                  <q-list dense>
                    <q-item v-for="(option, index) in props.row.options.slice(0, 2)" :key="index" dense>
                      <q-item-section>
                        <q-item-label caption>{{ option }}</q-item-label>
                      </q-item-section>
                    </q-item>
                    <q-item v-if="props.row.options.length > 2" dense>
                      <q-item-section>
                        <q-item-label caption>... ещё {{ props.row.options.length - 2 }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </div>
                <div v-else>
                  <span class="text-grey">Нет вариантов</span>
                </div>
              </q-td>
            </template>

            <!-- Активность -->
            <template v-slot:body-cell-is_active="props">
              <q-td :props="props">
                <q-badge :color="props.row.is_active ? 'positive' : 'negative'" class="q-py-xs q-px-sm">
                  {{ props.row.is_active ? 'Активен' : 'Неактивен' }}
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
                  :to="{ name: 'admin.survey.edit', params: { id: props.row.id } }"
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
          <span class="q-ml-sm">Вы действительно хотите удалить вопрос:<br>"{{ questionToDelete?.question }}"?</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Отмена" color="primary" v-close-popup />
          <q-btn flat label="Удалить" color="negative" @click="deleteQuestion" :loading="loading" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useQuasar } from 'quasar';

export default {
  name: 'AdminSurvey',

  setup() {
    const store = useStore();
    const $q = useQuasar();

    const questions = computed(() => store.getters['admin/questionsList']);
    const loading = computed(() => store.getters['admin/isLoading']);

    const columns = [
      { name: 'sort_order', label: '#', field: 'sort_order', sortable: true, align: 'center' },
      { name: 'question', label: 'Вопрос', field: 'question', sortable: true, align: 'left' },
      { name: 'type', label: 'Тип', field: 'type', sortable: true, align: 'center' },
      { name: 'options', label: 'Варианты ответов', field: 'options', align: 'left' },
      { name: 'is_active', label: 'Статус', field: 'is_active', sortable: true, align: 'center' },
      { name: 'actions', label: 'Действия', field: 'actions', align: 'center' }
    ];

    const deleteDialog = ref(false);
    const questionToDelete = ref(null);

    // Загрузка вопросов при монтировании компонента
    onMounted(async () => {
      try {
        await store.dispatch('admin/fetchQuestions');
      } catch (error) {
        $q.notify({
          color: 'negative',
          message: 'Ошибка при загрузке вопросов'
        });
      }
    });

    // Форматирование типа вопроса
    const formatType = (type) => {
      if (type === 'single') return 'Одиночный выбор';
      if (type === 'multiple') return 'Множественный выбор';
      if (type === 'text') return 'Текстовый';
      return type;
    };

    // Получение цвета для типа вопроса
    const getTypeColor = (type) => {
      if (type === 'single') return 'blue';
      if (type === 'multiple') return 'deep-purple';
      if (type === 'text') return 'teal';
      return 'grey';
    };

    // Подтверждение удаления
    const confirmDelete = (question) => {
      questionToDelete.value = question;
      deleteDialog.value = true;
    };

    // Удаление вопроса
    const deleteQuestion = async () => {
      if (!questionToDelete.value) return;

      try {
        await store.dispatch('admin/deleteQuestion', questionToDelete.value.id);

        $q.notify({
          color: 'positive',
          message: 'Вопрос успешно удален'
        });
      } catch (error) {
        $q.notify({
          color: 'negative',
          message: 'Ошибка при удалении вопроса'
        });
      }
    };

    return {
      questions,
      loading,
      columns,
      deleteDialog,
      questionToDelete,
      formatType,
      getTypeColor,
      confirmDelete,
      deleteQuestion
    };
  }
};
</script>

<!-- src/pages/admin/SurveyForm.vue -->
<template>
  <q-page padding>
    <div class="row q-mb-lg">
      <div class="col-12">
        <q-btn
          icon="arrow_back"
          flat
          label="Назад к списку"
          :to="{ name: 'admin.survey' }"
          class="q-mb-md"
        />

        <div class="text-h4">{{ isEdit ? 'Редактирование вопроса' : 'Создание вопроса' }}</div>
        <div class="text-subtitle1" v-if="isEdit && question">{{ question.question }}</div>
      </div>
    </div>

    <div v-if="loading && isEdit" class="text-center q-pa-xl">
      <q-spinner color="primary" size="3em" />
      <div class="q-mt-sm">Загрузка данных вопроса...</div>
    </div>

    <q-card v-else>
      <q-card-section>
        <q-form @submit="onSubmit" class="q-gutter-md">
          <div class="row q-col-gutter-md">
            <!-- Основная информация -->
            <div class="col-md-8 col-xs-12">
              <q-input
                v-model="form.question"
                label="Текст вопроса *"
                outlined
                :rules="[val => !!val || 'Текст вопроса обязателен']"
              />

              <q-select
                v-model="form.type"
                :options="typeOptions"
                label="Тип вопроса *"
                outlined
                emit-value
                map-options
                class="q-mt-md"
                :rules="[val => !!val || 'Тип вопроса обязателен']"
              />

              <div v-if="form.type !== 'text'" class="q-mt-md">
                <div class="text-subtitle1 q-mb-sm">Варианты ответов</div>

                <div v-for="(option, index) in form.options" :key="index" class="row q-col-gutter-sm q-mb-xs">
                  <div class="col">
                    <q-input
                      v-model="form.options[index]"
                      outlined
                      dense
                      :label="`Вариант ${index + 1}`"
                      :rules="[val => !!val || 'Текст варианта обязателен']"
                    />
                  </div>
                  <div class="col-auto">
                    <q-btn
                      flat
                      round
                      dense
                      color="negative"
                      icon="delete"
                      @click="removeOption(index)"
                    />
                  </div>
                </div>

                <q-btn
                  color="primary"
                  icon="add"
                  label="Добавить вариант"
                  @click="addOption"
                  class="q-mt-sm"
                  :disabled="form.options.length >= 10"
                />
              </div>
            </div>

            <!-- Настройки -->
            <div class="col-md-4 col-xs-12">
              <q-toggle
                v-model="form.is_active"
                label="Вопрос активен"
                color="positive"
              />

              <div class="q-pa-md q-mt-md bg-grey-2 rounded-borders">
                <div class="text-subtitle1">Предпросмотр</div>
                <div class="q-mt-md">
                  <div class="text-body1 q-mb-md">{{ form.question || 'Текст вопроса' }}</div>

                  <div v-if="form.type === 'single' && form.options.length > 0">
                    <q-option-group
                      v-model="previewValue"
                      :options="previewOptions"
                      type="radio"
                      dense
                    />
                  </div>

                  <div v-else-if="form.type === 'multiple' && form.options.length > 0">
                    <q-option-group
                      v-model="previewMultipleValue"
                      :options="previewOptions"
                      type="checkbox"
                      dense
                    />
                  </div>

                  <div v-else-if="form.type === 'text'">
                    <q-input
                      outlined
                      dense
                      placeholder="Текстовый ответ"
                      readonly
                    />
                  </div>

                  <div v-else class="text-grey">
                    Добавьте варианты ответов для предпросмотра
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="row q-mt-lg">
            <div class="col-12 text-right">
              <q-btn
                type="submit"
                color="primary"
                :label="isEdit ? 'Сохранить изменения' : 'Создать вопрос'"
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
  name: 'AdminSurveyForm',

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
    const question = computed(() => store.getters['admin/selectedQuestion']);
    const isEdit = computed(() => !!props.id);

    const form = ref({
      question: '',
      type: 'single',
      options: [],
      is_active: true
    });

    const submitting = ref(false);
    const previewValue = ref('');
    const previewMultipleValue = ref([]);

    const typeOptions = [
      { label: 'Одиночный выбор', value: 'single' },
      { label: 'Множественный выбор', value: 'multiple' },
      { label: 'Текстовый ответ', value: 'text' }
    ];

    // Преобразование опций для предпросмотра
    const previewOptions = computed(() => {
      return form.value.options.map(option => ({
        label: option,
        value: option
      }));
    });

    // Загрузка данных вопроса для редактирования
    onMounted(async () => {
      if (isEdit.value) {
        try {
          await store.dispatch('admin/fetchQuestion', props.id);
        } catch (error) {
          $q.notify({
            color: 'negative',
            message: 'Ошибка при загрузке данных вопроса'
          });
          router.push({ name: 'admin.survey' });
        }
      }
    });

    // При получении данных вопроса заполняем форму
    watch(question, (newQuestion) => {
      if (newQuestion) {
        form.value = {
          question: newQuestion.question || '',
          type: newQuestion.type || 'single',
          options: Array.isArray(newQuestion.options) ? [...newQuestion.options] : [],
          is_active: newQuestion.is_active !== undefined ? newQuestion.is_active : true
        };
      }
    });

    // При изменении типа вопроса обновляем предпросмотр
    watch(() => form.value.type, (newType) => {
      if (newType === 'text') {
        form.value.options = [];
      } else if (form.value.options.length === 0) {
        // Добавляем пару вариантов по умолчанию для новых вопросов с выбором
        form.value.options = ['Вариант 1', 'Вариант 2'];
      }
    });

    // Добавление нового варианта ответа
    const addOption = () => {
      form.value.options.push(`Вариант ${form.value.options.length + 1}`);
    };

    // Удаление варианта ответа
    const removeOption = (index) => {
      form.value.options.splice(index, 1);
    };

    // Отправка формы
    const onSubmit = async () => {
      submitting.value = true;

      try {
        if (isEdit.value) {
          await store.dispatch('admin/updateQuestion', {
            questionId: props.id,
            questionData: form.value
          });

          $q.notify({
            color: 'positive',
            message: 'Вопрос успешно обновлен'
          });
        } else {
          await store.dispatch('admin/createQuestion', form.value);

          $q.notify({
            color: 'positive',
            message: 'Вопрос успешно создан'
          });
        }

        // Переходим обратно к списку вопросов
        router.push({ name: 'admin.survey' });
      } catch (error) {
        $q.notify({
          color: 'negative',
          message: `Ошибка при ${isEdit.value ? 'обновлении' : 'создании'} вопроса`
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
      question,
      typeOptions,
      previewValue,
      previewMultipleValue,
      previewOptions,
      addOption,
      removeOption,
      onSubmit
    };
  }
};
</script>
