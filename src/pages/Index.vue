<template>
  <q-page>
    <!-- Главный баннер -->
    <div class="hero-section">
      <div class="container">
        <div class="hero-content text-white text-center">
          <h1 class="text-h2 q-mb-md">Добро пожаловать в Family Olive Club</h1>
          <p class="text-h5">Эксклюзивные оливковые плантации в Средиземноморье</p>
        </div>
      </div>
    </div>

    <!-- О нас -->
    <div id="about" class="section">
      <div class="container">
        <h2 class="section-title text-h4 text-center q-mb-xl">О нас</h2>
        <div class="row q-col-gutter-xl">
          <div class="col-md-6 col-sm-12">
            <p class="text-body1">
              Family Olive Club предлагает эксклюзивную возможность инвестировать в оливковые плантации мирового класса.
              Наш проект объединяет традиции оливкового земледелия и современные технологии выращивания,
              обеспечивая высокую урожайность и качество продукции.
            </p>
            <p class="text-body1">
              Многовековые традиции оливководства Средиземноморья в сочетании с инновационными методами
              возделывания создают идеальную почву для перспективных инвестиций.
            </p>
          </div>
          <div class="col-md-6 col-sm-12">
            <p class="text-body1">
              Мы предлагаем различные варианты инвестирования, от приобретения участков крупных плантаций
              до покупки индивидуальных участков с уютными коттеджами. Каждый инвестор получает не только
              стабильный доход, но и возможность прикоснуться к многовековой традиции оливководства.
            </p>
            <p class="text-body1">
              Инвестиции в оливковые плантации - это не только выгодное размещение капитала,
              но и вклад в экологически чистое производство, традиции и культуру региона.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Плантации -->
    <div id="plantations" class="section bg-grey-2">
      <div class="container">
        <h2 class="section-title text-h4 text-center q-mb-xl">Наши плантации</h2>

        <q-tabs
          v-model="plantationTab"
          indicator-color="primary"
          class="text-primary q-mb-lg"
          align="center"
        >
          <q-tab name="20ha" label="Плантация 20 га" />
          <q-tab name="5ha" label="5 га + коттедж" />
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="plantationTab" animated>
          <!-- Плантация 20 га -->
          <q-tab-panel name="20ha">
            <div class="row q-col-gutter-xl">
              <div class="col-md-6 col-sm-12 order-md-1 order-sm-2">
                <h3 class="text-h5 q-mb-md">Плантация 20 гектаров</h3>
                <p class="text-body1">
                  Наша крупная плантация площадью 20 гектаров представляет собой уникальную возможность для масштабного инвестирования.
                  Расположенная в экологически чистом регионе, плантация включает тысячи оливковых деревьев элитных сортов.
                </p>
                <h4 class="text-h6 q-mt-lg">Инвестиционные преимущества:</h4>
                <q-list>
                  <q-item>
                    <q-item-section avatar>
                      <q-icon color="positive" name="check_circle" />
                    </q-item-section>
                    <q-item-section>Высокая урожайность благодаря передовым технологиям выращивания</q-item-section>
                  </q-item>
                  <q-item>
                    <q-item-section avatar>
                      <q-icon color="positive" name="check_circle" />
                    </q-item-section>
                    <q-item-section>Современная система орошения и ухода за деревьями</q-item-section>
                  </q-item>
                  <q-item>
                    <q-item-section avatar>
                      <q-icon color="positive" name="check_circle" />
                    </q-item-section>
                    <q-item-section>Профессиональный менеджмент и поддержка на всех этапах</q-item-section>
                  </q-item>
                  <q-item>
                    <q-item-section avatar>
                      <q-icon color="positive" name="check_circle" />
                    </q-item-section>
                    <q-item-section>Возможность приобретения долей различного размера</q-item-section>
                  </q-item>
                </q-list>
              </div>
              <div class="col-md-6 col-sm-12 order-md-2 order-sm-1">
                <q-img
                  src="~assets/plantation-20ha.jpg"
                  spinner-color="primary"
                  class="rounded-borders"
                  style="height: 400px"
                />
              </div>
            </div>
          </q-tab-panel>

          <!-- Плантация 5 га + коттедж -->
          <q-tab-panel name="5ha">
            <div class="row q-col-gutter-xl">
              <div class="col-md-6 col-sm-12 order-md-1 order-sm-2">
                <h3 class="text-h5 q-mb-md">Плантация 5 га + коттедж</h3>
                <p class="text-body1">
                  Эксклюзивное предложение для тех, кто мечтает не только о надежном инвестировании, но и о собственном уголке в живописном месте.
                  Комплекс включает участок оливковой плантации площадью 5 гектаров и уютный современный коттедж средиземноморского стиля.
                </p>
                <h4 class="text-h6 q-mt-lg">Преимущества предложения:</h4>
                <q-list>
                  <q-item>
                    <q-item-section avatar>
                      <q-icon color="positive" name="check_circle" />
                    </q-item-section>
                    <q-item-section>Индивидуальный участок с собственным жильем</q-item-section>
                  </q-item>
                  <q-item>
                    <q-item-section avatar>
                      <q-icon color="positive" name="check_circle" />
                    </q-item-section>
                    <q-item-section>Панорамные виды на море и горы</q-item-section>
                  </q-item>
                  <q-item>
                    <q-item-section avatar>
                      <q-icon color="positive" name="check_circle" />
                    </q-item-section>
                    <q-item-section>Возможность проводить время в собственном доме посреди оливковой рощи</q-item-section>
                  </q-item>
                  <q-item>
                    <q-item-section avatar>
                      <q-icon color="positive" name="check_circle" />
                    </q-item-section>
                    <q-item-section>Полное обслуживание участка профессионалами</q-item-section>
                  </q-item>
                </q-list>
              </div>
              <div class="col-md-6 col-sm-12 order-md-2 order-sm-1">
                <q-img
                  src="~assets/plantation-5ha.jpg"
                  spinner-color="primary"
                  class="rounded-borders"
                  style="height: 400px"
                />
              </div>
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </div>
    </div>

    <!-- События -->
    <div id="events" class="section">
      <div class="container">
        <h2 class="section-title text-h4 text-center q-mb-xl">Предстоящие события</h2>

        <q-tabs
          v-model="eventsTab"
          indicator-color="primary"
          class="text-primary q-mb-lg"
          align="center"
        >
          <q-tab name="all" label="Все события" />
          <q-tab name="20ha" label="Плантация 20 га" />
          <q-tab name="5ha" label="5 га + коттедж" />
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="eventsTab" animated>
          <!-- Загрузка событий -->
          <template v-if="eventsLoading">
            <div class="text-center q-pa-xl">
              <q-spinner color="primary" size="3em" />
              <p class="q-mt-md">Загрузка событий...</p>
            </div>
          </template>

          <template v-else>
            <!-- Все события -->
            <q-tab-panel name="all">
              <div class="row q-col-gutter-md">
                <div v-for="event in events" :key="event.id" class="col-lg-4 col-md-6 col-sm-12">
                  <q-card class="event-card">
                    <q-img
                      :src="event.image_url || require('src/assets/event-default.jpg')"
                      spinner-color="primary"
                      style="height: 200px"
                    />

                    <q-card-section>
                      <div class="text-h6">{{ event.title }}</div>
                      <div v-if="event.event_date" class="text-caption text-grey q-mb-sm">
                        {{ formatDate(event.event_date) }}
                      </div>
                      <p class="text-body2 event-description">{{ event.description }}</p>
                    </q-card-section>

                    <q-card-actions v-if="event.link">
                      <q-btn flat color="primary" :href="event.link" target="_blank" label="Подробнее" />
                    </q-card-actions>
                  </q-card>
                </div>

                <div v-if="events.length === 0" class="col-12 text-center q-pa-xl">
                  <q-icon name="event_busy" size="4em" color="grey-5" />
                  <p class="q-mt-md text-grey">В данный момент нет предстоящих событий</p>
                </div>
              </div>
            </q-tab-panel>

            <!-- События 20 га -->
            <q-tab-panel name="20ha">
              <div class="row q-col-gutter-md">
                <div v-for="event in events20ha" :key="event.id" class="col-lg-4 col-md-6 col-sm-12">
                  <q-card class="event-card">
                    <q-img
                      :src="event.image_url || require('src/assets/event-default.jpg')"
                      spinner-color="primary"
                      style="height: 200px"
                    />

                    <q-card-section>
                      <div class="text-h6">{{ event.title }}</div>
                      <div v-if="event.event_date" class="text-caption text-grey q-mb-sm">
                        {{ formatDate(event.event_date) }}
                      </div>
                      <p class="text-body2 event-description">{{ event.description }}</p>
                    </q-card-section>

                    <q-card-actions v-if="event.link">
                      <q-btn flat color="primary" :href="event.link" target="_blank" label="Подробнее" />
                    </q-card-actions>
                  </q-card>
                </div>

                <div v-if="events20ha.length === 0" class="col-12 text-center q-pa-xl">
                  <q-icon name="event_busy" size="4em" color="grey-5" />
                  <p class="q-mt-md text-grey">В данный момент нет предстоящих событий для плантации 20 га</p>
                </div>
              </div>
            </q-tab-panel>

            <!-- События 5 га + коттедж -->
            <q-tab-panel name="5ha">
              <div class="row q-col-gutter-md">
                <div v-for="event in events5ha" :key="event.id" class="col-lg-4 col-md-6 col-sm-12">
                  <q-card class="event-card">
                    <q-img
                      :src="event.image_url || require('src/assets/event-default.jpg')"
                      spinner-color="primary"
                      style="height: 200px"
                    />

                    <q-card-section>
                      <div class="text-h6">{{ event.title }}</div>
                      <div v-if="event.event_date" class="text-caption text-grey q-mb-sm">
                        {{ formatDate(event.event_date) }}
                      </div>
                      <p class="text-body2 event-description">{{ event.description }}</p>
                    </q-card-section>

                    <q-card-actions v-if="event.link">
                      <q-btn flat color="primary" :href="event.link" target="_blank" label="Подробнее" />
                    </q-card-actions>
                  </q-card>
                </div>

                <div v-if="events5ha.length === 0" class="col-12 text-center q-pa-xl">
                  <q-icon name="event_busy" size="4em" color="grey-5" />
                  <p class="q-mt-md text-grey">В данный момент нет предстоящих событий для плантации 5 га + коттедж</p>
                </div>
              </div>
            </q-tab-panel>
          </template>
        </q-tab-panels>
      </div>
    </div>

    <!-- Контакты -->
    <div id="contact" class="section bg-grey-2">
      <div class="container">
        <h2 class="section-title text-h4 text-center q-mb-xl">Свяжитесь с нами</h2>
        <div class="row q-col-gutter-xl">
          <div class="col-md-6 col-sm-12">
            <p class="text-body1">
              Если у вас возникли вопросы о нашем проекте или вы хотите узнать больше о возможностях инвестирования,
              свяжитесь с нами удобным для вас способом.
            </p>
            <q-list>
              <q-item>
                <q-item-section avatar>
                  <q-icon name="email" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Email</q-item-label>
                  <q-item-label caption>info@familyoliveclub.com</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section avatar>
                  <q-icon name="phone" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Телефон</q-item-label>
                  <q-item-label caption>+7 (XXX) XXX-XX-XX</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section avatar>
                  <q-icon name="location_on" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Адрес</q-item-label>
                  <q-item-label caption>Город, Улица, Дом</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </div>
          <div class="col-md-6 col-sm-12">
            <div class="text-center">
              <h3 class="text-h6 q-mb-lg">Мы в социальных сетях</h3>
              <div class="row justify-center q-gutter-md">
                <q-btn round color="blue" icon="fab fa-facebook-f" />
                <q-btn round color="red" icon="fab fa-instagram" />
                <q-btn round color="light-blue" icon="fab fa-telegram" />
                <q-btn round color="green" icon="fab fa-whatsapp" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useStore } from 'vuex';
import { date } from 'quasar';

export default {
  name: 'IndexPage',

  setup() {
    const $q = useQuasar();
    const store = useStore();

    const plantationTab = ref('20ha');
    const eventsTab = ref('all');
    const eventsLoading = ref(false);

    // Получение данных из хранилища
    const events = computed(() => store.state.events.events);
    const events20ha = computed(() => store.getters['events/getEventsByCategory']('20ha'));
    const events5ha = computed(() => store.getters['events/getEventsByCategory']('5ha_cottage'));
    const userInterest = computed(() => store.state.auth.user?.interest_type);

    // Форматирование даты
    const formatDate = (dateString) => {
      return date.formatDate(dateString, 'DD.MM.YYYY HH:mm');
    };

    // Загрузка событий
    const loadEvents = async () => {
      eventsLoading.value = true;
      try {
        await store.dispatch('events/fetchEvents');
        await store.dispatch('events/fetchEventsByCategory', '20ha');
        await store.dispatch('events/fetchEventsByCategory', '5ha_cottage');
      } catch (error) {
        console.error('Ошибка при загрузке событий:', error);
      } finally {
        eventsLoading.value = false;
      }
    };

    // При монтировании загружаем события и устанавливаем вкладку по интересу пользователя
    onMounted(async () => {
      await loadEvents();

      // Устанавливаем вкладку в зависимости от интереса пользователя
      if (userInterest.value === 'Плантация 20 га') {
        plantationTab.value = '20ha';
      } else if (userInterest.value === '5 га + коттедж') {
        plantationTab.value = '5ha';
      }
    });

    return {
      plantationTab,
      eventsTab,
      eventsLoading,
      events,
      events20ha,
      events5ha,
      formatDate
    };
  }
};
</script>

<style scoped>
.hero-section {
  height: 500px;
  background-image: url('../assets/auth-background.jpg');
  background-size: cover;
  background-position: center;
  position: relative;
}

.hero-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}

.hero-content {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.section {
  padding: 80px 0;
}

.section-title {
  position: relative;
  display: inline-block;
  margin-bottom: 60px;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -15px;
  left: 50%;
  transform: translateX(-50%);
  width: 50px;
  height: 3px;
  background-color: var(--q-primary);
}

.event-card {
  height: 100%;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.event-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.event-description {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 768px) {
  .hero-section {
    height: 300px;
  }

  .section {
    padding: 40px 0;
  }
}
</style>
