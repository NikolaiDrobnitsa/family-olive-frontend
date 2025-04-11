<template>
  <q-page padding>
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 flex justify-between items-center">
        <div>
          <h1 class="text-h4 q-mb-md">Управление событиями</h1>
          <p class="text-subtitle1">Добавление, редактирование и удаление событий</p>
        </div>
        <q-btn color="positive" icon="add" label="Добавить событие" :to="{ name: 'admin-event-create' }" />
      </div>
    </div>

    <!-- Events List -->
    <q-card>
      <q-card-section>
        <div class="text-h6">Список событий</div>
        <div class="text-caption">Перетащите события, чтобы изменить порядок отображения</div>
      </q-card-section>

      <q-card-section>
        <div v-if="loading" class="text-center q-py-lg">
          <q-spinner size="3em" color="primary" />
          <div class="q-mt-sm">Загрузка событий...</div>
        </div>

        <div v-else-if="events.length === 0" class="text-center q-py-xl">
          <q-icon name="event_busy" size="4em" color="grey-5" />
          <div class="text-h6 q-mt-md">Нет доступных событий</div>
          <q-btn color="positive" label="Добавить первое событие" :to="{ name: 'admin-event-create' }" class="q-mt-lg" />
        </div>

        <q-list v-else bordered separator class="drag-events-list">
          <q-item
            v-for="event in events"
            :key="event.id"
            class="q-py-md cursor-move"
            :class="{ 'bg-grey-2': !event.is_active }"
          >
            <q-item-section avatar>
              <q-avatar size="80px">
                <img v-if="event.image_url" :src="event.image_url" />
                <q-icon v-else name="image" size="40px" color="grey-5" />
              </q-avatar>
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-h6">
                {{ event.title }}
                <q-badge v-if="!event.is_active" color="negative" class="q-ml-sm">
                  Неактивно
                </q-badge>
              </q-item-label>
              <q-item-label caption v-if="event.event_date">
                Дата: {{ formatDate(event.event_date) }}
              </q-item-label>
              <q-item-label caption v-if="event.category">
                Категория: {{ getCategoryLabel(event.category) }}
              </q-item-label>
              <q-item-label class="q-mt-xs text-grey-8" style="max-height: 60px; overflow: hidden;">
                {{ event.description }}
              </q-item-label>
            </q-item-section>

            <q-item-section side>
              <div class="row q-gutter-sm">
                <q-btn flat round color="primary" icon="edit" :to="{ name: 'admin-event-edit', params: { id: event.id } }">
                  <q-tooltip>Редактировать</q-tooltip>
                </q-btn>
                <q-btn flat round color="negative" icon="delete" @click="confirmDelete(event)">
                  <q-tooltip>Удалить</q-tooltip>
                </q-btn>
              </div>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>

      <q-card-actions align="center" v-if="events.length > 0 && orderChanged">
        <q-btn color="primary" label="Сохранить порядок" @click="saveOrder" :loading="savingOrder" />
      </q-card-actions>
    </q-card>

    <!-- Delete Confirmation Dialog -->
    <q-dialog v-model="deleteDialog.show" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="delete" color="negative" text-color="white" />
          <span class="q-ml-sm">Вы действительно хотите удалить событие?</span>
        </q-card-section>
        <q-card-section>
          <p>Название: {{ deleteDialog.event ? deleteDialog.event.title : '' }}</p>
          <p class="text-negative">Это действие невозможно отменить.</p>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Отмена" color="primary" v-close-popup />
          <q-btn flat label="Удалить" color="negative" @click="deleteEvent" :loading="deleteDialog.loading" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { ref, reactive, onMounted } from 'vue';
import { useQuasar, date } from 'quasar';
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
  name: 'AdminEvents',
  components: {
    draggable
  },
  setup() {
    const $q = useQuasar();

    // State
    const events = ref([]);
    const originalEvents = ref([]);
    const loading = ref(true);
    const orderChanged = ref(false);
    const savingOrder = ref(false);

    // Delete dialog state
    const deleteDialog = reactive({
      show: false,
      event: null,
      loading: false
    });

    // Category mapping
    const categoryMapping = {
      '20ha': 'Плантация 20 га',
      '5ha_cottage': '5 га + коттедж'
    };

    // Format date
    const formatDate = (dateString) => {
      if (!dateString) return 'Не указана';
      return date.formatDate(dateString, 'DD.MM.YYYY HH:mm');
    };

    // Get category label
    const getCategoryLabel = (category) => {
      return categoryMapping[category] || category || 'Общая';
    };

    // Load events
    const loadEvents = async () => {
      try {
        loading.value = true;
        const response = await api.get('/api/admin/events');
        events.value = response.data.events;
        originalEvents.value = [...events.value]; // Make a copy for comparison
      } catch (error) {
        console.error('Error loading events:', error);
        $q.notify({
          color: 'negative',
          message: 'Ошибка при загрузке событий',
          icon: 'error'
        });
      } finally {
        loading.value = false;
      }
    };

    // Check if order changed
    const checkOrderChanged = () => {
      if (events.value.length !== originalEvents.value.length) {
        orderChanged.value = true;
        return;
      }

      for (let i = 0; i < events.value.length; i++) {
        if (events.value[i].id !== originalEvents.value[i].id) {
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
        const eventsOrder = events.value.map((event, index) => ({
          id: event.id,
          sort_order: index
        }));

        // Send to API
        await api.post('/api/admin/events/order', { events: eventsOrder });

        // Update original order
        originalEvents.value = [...events.value];
        orderChanged.value = false;

        // Show success notification
        $q.notify({
          color: 'positive',
          message: 'Порядок событий успешно сохранен',
          icon: 'check_circle'
        });
      } catch (error) {
        console.error('Error saving order:', error);
        $q.notify({
          color: 'negative',
          message: 'Ошибка при сохранении порядка событий',
          icon: 'error'
        });
      } finally {
        savingOrder.value = false;
      }
    };

    // Show delete confirmation
    const confirmDelete = (event) => {
      deleteDialog.event = event;
      deleteDialog.show = true;
    };

    // Delete event
    const deleteEvent = async () => {
      if (!deleteDialog.event) return;

      try {
        deleteDialog.loading = true;

        // Call API to delete event
        await api.delete(`/api/admin/events/${deleteDialog.event.id}`);

        // Close dialog
        deleteDialog.show = false;

        // Show success notification
        $q.notify({
          color: 'positive',
          message: 'Событие успешно удалено',
          icon: 'check_circle'
        });

        // Reload events
        await loadEvents();
      } catch (error) {
        console.error('Error deleting event:', error);
        $q.notify({
          color: 'negative',
          message: 'Ошибка при удалении события',
          icon: 'error'
        });
      } finally {
        deleteDialog.loading = false;
      }
    };

    // Load data on component mount
    onMounted(() => {
      loadEvents();
    });

    return {
      events,
      loading,
      orderChanged,
      savingOrder,
      deleteDialog,
      formatDate,
      getCategoryLabel,
      handleChange,
      saveOrder,
      confirmDelete,
      deleteEvent
    };
  }
};
</script>

<style>
.drag-events-list .q-item {
  transition: background-color 0.3s;
}

.drag-events-list .q-item:hover {
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
