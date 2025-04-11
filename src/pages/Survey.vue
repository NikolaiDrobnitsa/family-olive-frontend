<template>
  <q-page class="survey-page q-py-lg">
    <div class="container">
      <div class="row justify-center">
        <div class="col-xs-12 col-sm-10 col-md-8 col-lg-6">
          <q-card class="survey-card q-pa-lg">
            <q-card-section>
              <div class="text-h4 text-center q-mb-lg">Опрос для участников Family Olive Club</div>
              <div class="text-subtitle1 q-mb-xl">
                Пожалуйста, ответьте на несколько вопросов, чтобы мы могли предложить вам оптимальные варианты инвестирования.
              </div>
            </q-card-section>

            <!-- Загрузка -->
            <q-card-section v-if="loading">
              <div class="text-center">
                <q-spinner size="50px" color="primary" />
                <div class="q-mt-md">Загрузка вопросов...</div>
              </div>
            </q-card-section>

            <template v-else>
              <!-- Процесс опроса -->
              <q-card-section v-if="currentQuestionIndex < questions.length">
                <div class="text-h6 q-mb-md">{{ currentQuestion.question }}</div>

                <!-- Вопрос с одиночным выбором -->
                <div v-if="currentQuestion.type === 'single'">
                  <q-option-group
                    v-model="answers[currentQuestion.id]"
                    :options="optionsForQuestion"
                    type="radio"
                    class="q-mb-md"
                  />
                </div>

                <!-- Вопрос с множественным выбором -->
                <div v-else-if="currentQuestion.type === 'multiple'">
                  <q-option-group
                    v-model="multipleAnswers[currentQuestion.id]"
                    :options="optionsForQuestion"
                    type="checkbox"
                    class="q-mb-md"
                  />
                </div>

                <!-- Вопрос с текстовым ответом -->
                <div v-else-if="currentQuestion.type === 'text'">
                  <q-input
                    v-model="answers[currentQuestion.id]"
                    outlined
                    placeholder="Введите ваш ответ"
                    class="q-mb-md"
                  />
                </div>

                <div class="row q-mt-xl">
                  <div class="col-6">
                    <q-btn
                      flat
                      label="Назад"
                      @click="prevQuestion"
                      :disabled="currentQuestionIndex === 0"
                    />
                  </div>
                  <div class="col-6 text-right">
                    <q-btn
                      color="primary"
                      :label="currentQuestionIndex === questions.length - 1 ? 'Завершить' : 'Далее'"
                      @click="nextQuestion"
                      :disabled="!isCurrentQuestionAnswered"
                    />
                  </div>
                </div>

                <!-- Индикатор прогресса -->
                <div class="q-mt-md">
                  <q-linear-progress
                    :value="progress"
                    color="primary"
                    size="10px"
                    class="q-mt-md"
                  />
                  <div class="text-caption text-center q-mt-sm">
                    Вопрос {{ currentQuestionIndex + 1 }} из {{ questions.length }}
                  </div>
                </div>
              </q-card-section>

              <!-- Завершение опроса -->
              <q-card-section v-else>
                <div class="text-center">
                  <q-icon name="check_circle" color="positive" size="100px" />
                  <div class="text-h5 q-mt-md">Спасибо за прохождение опроса!</div>
                  <div class="q-mt-md">
                    Ваши ответы помогут нам подобрать оптимальное предложение.
                  </div>
                  <q-btn
                    color="primary"
                    label="Вернуться на главную"
                    class="q-mt-xl"
                    to="/"
                  />
                </div>
              </q-card-section>
            </template>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

export default {
  name: 'SurveyPage',

  setup() {
    const $q = useQuasar();
    const router = useRouter();
    const store = useStore();

    const questions = ref([]);
    const currentQuestionIndex = ref(0);
    const answers = ref({});
    const multipleAnswers = ref({});
    const loading = ref(true);
    const submitting = ref(false);

    // Получаем текущий вопрос
    const currentQuestion = computed(() => {
      if (questions.value.length === 0 || currentQuestionIndex.value >= questions.value.length) {
        return null;
      }
      return questions.value[currentQuestionIndex.value];
    });

    // Формируем список опций для текущего вопроса
    const optionsForQuestion = computed(() => {
      if (!currentQuestion.value || !currentQuestion.value.options) return [];
      return currentQuestion.value.options.map(option => ({
        label: option,
        value: option
      }));
    });

    // Вычисляем прогресс прохождения опроса
    const progress = computed(() => {
      return (currentQuestionIndex.value + 1) / questions.value.length;
    });

    // Проверяем, ответил ли пользователь на текущий вопрос
    const isCurrentQuestionAnswered = computed(() => {
      if (!currentQuestion.value) return true;

      const questionId = currentQuestion.value.id;

      if (currentQuestion.value.type === 'multiple') {
        return multipleAnswers.value[questionId] && multipleAnswers.value[questionId].length > 0;
      }

      return !!answers.value[questionId];
    });

    // Загружаем вопросы опроса
    const loadQuestions = async () => {
      try {
        loading.value = true;
        questions.value = await store.dispatch('survey/fetchQuestions');

        // Загружаем предыдущие ответы пользователя, если есть
        const userResponses = await store.dispatch('survey/fetchUserResponses');

        if (userResponses.length > 0) {
          // Если пользователь уже отвечал на вопросы, заполняем ответы
          userResponses.forEach(response => {
            const question = questions.value.find(q => q.id === response.question_id);

            if (question) {
              if (question.type === 'multiple') {
                multipleAnswers.value[question.id] = response.answer.split(', ');
              } else {
                answers.value[question.id] = response.answer;
              }
            }
          });

          // Если опрос уже завершен, показываем последний шаг
          if (store.state.survey.completed) {
            currentQuestionIndex.value = questions.value.length;
          }
        }
      } catch (error) {
        $q.notify({
          color: 'negative',
          message: 'Ошибка при загрузке вопросов. Пожалуйста, попробуйте позже.'
        });
        console.error(error);
      } finally {
        loading.value = false;
      }
    };

    // Переход к следующему вопросу
    const nextQuestion = async () => {
      if (currentQuestionIndex.value < questions.value.length - 1) {
        // Если не последний вопрос, просто переходим к следующему
        currentQuestionIndex.value++;
      } else {
        // Если последний вопрос, отправляем ответы
        await submitSurvey();
      }
    };

    // Возврат к предыдущему вопросу
    const prevQuestion = () => {
      if (currentQuestionIndex.value > 0) {
        currentQuestionIndex.value--;
      }
    };

    // Отправка ответов на опрос
    const submitSurvey = async () => {
      try {
        submitting.value = true;

        // Формируем массив ответов для отправки
        const responses = [];

        // Обрабатываем вопросы с одиночным и текстовым ответом
        for (const questionId in answers.value) {
          if (answers.value[questionId]) {
            responses.push({
              question_id: parseInt(questionId),
              answer: answers.value[questionId]
            });
          }
        }

        // Обрабатываем вопросы с множественным выбором
        for (const questionId in multipleAnswers.value) {
          if (multipleAnswers.value[questionId] && multipleAnswers.value[questionId].length > 0) {
            responses.push({
              question_id: parseInt(questionId),
              answer: multipleAnswers.value[questionId].join(', ')
            });
          }
        }

        // Отправляем ответы
        await store.dispatch('survey/submitResponses', responses);

        // Показываем последний шаг (благодарность)
        currentQuestionIndex.value = questions.value.length;

        // Обновляем информацию о прохождении опроса в store
        store.commit('survey/SET_COMPLETED', true);

        $q.notify({
          color: 'positive',
          message: 'Спасибо за ваши ответы!'
        });
      } catch (error) {
        $q.notify({
          color: 'negative',
          message: 'Ошибка при отправке ответов. Пожалуйста, попробуйте позже.'
        });
        console.error(error);
      } finally {
        submitting.value = false;
      }
    };

    // При монтировании компонента загружаем вопросы
    onMounted(() => {
      loadQuestions();
    });

    return {
      questions,
      currentQuestionIndex,
      currentQuestion,
      optionsForQuestion,
      answers,
      multipleAnswers,
      loading,
      submitting,
      progress,
      isCurrentQuestionAnswered,
      nextQuestion,
      prevQuestion
    };
  }
};
</script>

<style scoped>
.survey-page {
  background-color: #f5f5f5;
  min-height: 100vh;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 15px;
}

.survey-card {
  margin: 20px 0;
  border-radius: 10px;
}
</style>
