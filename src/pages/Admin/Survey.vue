<template>
  <q-page padding>
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 flex justify-between items-center">
        <div>
          <h1 class="text-h4 q-mb-md">Управление опросником</h1>
          <p class="text-subtitle1">Добавление, редактирование и сортировка вопросов</p>
        </div>
        <q-btn color="positive" icon="add" label="Добавить вопрос" :to="{ name: 'admin-survey-create' }" />
      </div>
    </div>

    <!-- Questions List -->
    <q-card>
      <q-card-section>
        <div class="text-h6">Список вопросов</div>
        <div class="text-caption">Перетащите вопросы, чтобы изменить порядок отображения в опроснике</div>
      </q-card-section>

      <q-card-section>
        <div v-if="loading" class="text-center q-py-lg">
          <q-spinner size="3em" color="primary" />
          <div class="q-mt-sm">Загрузка вопросов...</div>
        </div>

        <div v-else-if="questions.length === 0" class="text-center q-py-xl">
          <q-icon name="help" size="4em" color="grey-5" />
          <div class="text-h6 q-mt-md">Нет вопросов в опроснике</div>
          <q-btn color="positive" label="Добавить первый вопрос" :to="{ name: 'admin-survey-create' }" class="q-mt-lg" />
        </div>

        <q-list v-else bordered separator class="drag-questions-list">
          <q-item
            v-for="question in questions"
            :key="question.id"
            class="q-py-md cursor-move"
            :class="{ 'bg-grey-2': !question.is_active }"
          >
            <q-item-section avatar>
              <q-avatar color="primary" text-color="white">
                <q-icon :name="getTypeIcon(question.type)" />
              </q-avatar>
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-h6">
                {{ question.question }}
                <q-badge v-if="!question.is_active" color="negative" class="q-ml-sm">
                  Неактивно
                </q-badge>
              </q-item-label>
              <q-item-label caption>
                Тип: {{ getTypeLabel(question.type) }}
              </q-item-label>

              <div v-if="question.options && question.options.length > 0" class="q-mt-sm">
                <div class="text-caption text-grey-8">Варианты ответов:</div>
                <div class="row q-col-gutter-sm q-mt-xs">
                  <div v-for="(option, index) in question.options" :key="index" class="col-auto">
                    <q-chip size="sm" dense color="primary" text-color="white">
                      {{ option }}
                    </q-chip>
                  </div>
                </div>
              </div>
            </q-item-section>

            <q-item-section side>
              <div class="row q-gutter-sm">
                <q-btn flat round color="primary" icon="edit" :to="{ name: 'admin-survey-edit', params: { id: question.id } }">
                  <q-tooltip>Редактировать</q-tooltip>
                </q-btn>
                <q-btn flat round color="negative" icon="delete" @click="confirmDelete(question)">
                  <q-tooltip>Удалить</q-tooltip>
                </q-btn>
              </div>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>

      <q-card-actions align="center" v-if="questions.length > 0 && orderChanged">
        <q-btn color="primary" label="Сохранить порядок" @click="saveOrder" :loading="savingOrder" />
      </q-card-actions>
    </q-card>

    <!-- Delete Confirmation Dialog -->
    <q-dialog v-model="deleteDialog.show" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="delete" color="negative" text-color="white" />
          <span class="q-ml-sm">Вы действительно хотите удалить вопрос?</span>
        </q-card-section>
        <q-card-section>
          <p>Вопрос: {{ deleteDialog.question ? deleteDialog.question.question : '' }}</p>
          <p class="text-negative">Это действие невозможно отменить. Все ответы пользователей на этот вопрос также будут удалены.</p>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Отмена" color="primary" v-close-popup />
          <q-btn flat label="Удалить" color="negative" @click="deleteQuestion" :loading="deleteDialog.loading" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { ref, reactive, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { api } from 'src/boot/axios';

// If Draggable is available, import it
let draggable;
try {
  draggable = require('vuedraggable').default;
} catch (e) {
  // Mock draggable if not available
  draggable = {
    render: h => h('div')
  };
}

export default {
  name: 'AdminSurvey',
  components: {
    draggable
  },
  setup() {
    const $q = useQuasar();

    // State
    const questions = ref([]);
    const originalQuestions = ref([]);
    const loading = ref(true);
    const orderChanged = ref(false);
    const savingOrder = ref(false);

    // Delete dialog state
    const deleteDialog = reactive({
      show: false,
      question: null,
      loading: false
    });

    // Type mapping
    const typeMapping = {
      'single': 'Одиночный выбор',
      'multiple': 'Множественный выбор',
      'text': 'Текстовый ответ'
    };

    // Type icon mapping
    const typeIconMapping = {
      'single': 'radio_button_checked',
      'multiple': 'check_box',
      'text': 'text_fields'
    };

    // Get type label
    const getTypeLabel = (type) => {
      return typeMapping[type] || type || 'Неизвестный тип';
    };

    // Get type icon
    const getTypeIcon = (type) => {
      return typeIconMapping[type] || 'help';
    };

    // Load questions
    const loadQuestions = async () => {
      try {
        loading.value = true;
        const response = await api.get('/api/admin/survey');
        questions.value = response.data.questions;
        originalQuestions.value = [...questions.value]; // Make a copy for comparison
      } catch (error) {
        console.error('Error loading questions:', error);
        $q.notify({
          color: 'negative',
          message: 'Ошибка при загрузке вопросов',
          icon: 'error'
        });
      } finally {
        loading.value = false;
      }
    };

    // Check if order changed
    const checkOrderChanged = () => {
      if (questions.value.length !== originalQuestions.value.length) {
        orderChanged.value = true;
        return;
      }

      for (let i = 0; i < questions.value.length; i++) {
        if (questions.value[i].id !== originalQuestions.value[i].id) {
          orderChanged.value = true;
          return;
        }
      }

      orderChanged.value = false;
    };

    // Handle drag and drop
    const handleChange = () => {
      checkOrderChanged();
    };

    // Save new order
    const saveOrder = async () => {
      try {
        savingOrder.value = true;

        // Prepare data for API
        const questionsOrder = questions.value.map((question, index) => ({
          id: question.id,
          sort_order: index
        }));

        // Send to API
        await api.post('/api/admin/survey/order', { questions: questionsOrder });

        // Update original order
        originalQuestions.value = [...questions.value];
        orderChanged.value = false;

        // Show success notification
        $q.notify({
          color: 'positive',
          message: 'Порядок вопросов успешно сохранен',
          icon: 'check_circle'
        });
      } catch (error) {
        console.error('Error saving order:', error);
        $q.notify({
          color: 'negative',
          message: 'Ошибка при сохранении порядка вопросов',
          icon: 'error'
        });
      } finally {
        savingOrder.value = false;
      }
    };

    // Show delete confirmation
    const confirmDelete = (question) => {
      deleteDialog.question = question;
      deleteDialog.show = true;
    };

    // Delete question
    const deleteQuestion = async () => {
      if (!deleteDialog.question) return;

      try {
        deleteDialog.loading = true;

        // Call API to delete question
        await api.delete(`/api/admin/survey/${deleteDialog.question.id}`);

        // Close dialog
        deleteDialog.show = false;

        // Show success notification
        $q.notify({
          color: 'positive',
          message: 'Вопрос успешно удален',
          icon: 'check_circle'
        });

        // Reload questions
        await loadQuestions();
      } catch (error) {
        console.error('Error deleting question:', error);
        $q.notify({
          color: 'negative',
          message: 'Ошибка при удалении вопроса',
          icon: 'error'
        });
      } finally {
        deleteDialog.loading = false;
      }
    };

    // Load data on component mount
    onMounted(() => {
      loadQuestions();
    });

    return {
      questions,
      loading,
      orderChanged,
      savingOrder,
      deleteDialog,
      getTypeLabel,
      getTypeIcon,
      handleChange,
      saveOrder,
      confirmDelete,
      deleteQuestion
    };
  }
};
</script>

<style>
.drag-questions-list .q-item {
  transition: background-color 0.3s;
}

.drag-questions-list .q-item:hover {
  background-color: #f0f8ff;
}

.sortable-ghost {
  opacity: 0.5;
  background: #c8e6c9;
}

.sortable-drag {
  cursor: move;
}
</style>
