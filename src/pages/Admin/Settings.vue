<template>
  <q-page padding>
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12">
        <h1 class="text-h4 q-mb-md">Настройки системы</h1>
        <p class="text-subtitle1">Управление настройками системы и администраторами</p>
      </div>
    </div>

    <div v-if="loading" class="text-center q-py-lg">
      <q-spinner size="3em" color="primary" />
      <div class="q-mt-sm">Загрузка настроек...</div>
    </div>

    <div v-else class="row q-col-gutter-md">
      <!-- System Settings -->
      <div class="col-md-7 col-sm-12">
        <q-card>
          <q-card-section>
            <div class="text-h6">Настройки системы</div>
          </q-card-section>

          <q-card-section>
            <q-form ref="settingsForm" @submit="saveSettings">
              <div class="text-subtitle1 q-mb-md">Видимость разделов</div>

              <div class="q-mb-lg">
                <q-list bordered separator>
                  <q-item tag="label" v-ripple v-for="section in sectionSettings" :key="section.key">
                    <q-item-section>
                      <q-item-label>{{ section.label }}</q-item-label>
                      <q-item-label caption>{{ section.description }}</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-toggle v-model="settings[section.key]" />
                    </q-item-section>
                  </q-item>
                </q-list>
              </div>

              <div class="text-subtitle1 q-mb-md">Языки</div>

              <div class="q-mb-lg">
                <q-list bordered separator>
                  <q-item tag="label" v-ripple v-for="language in languageSettings" :key="language.key">
                    <q-item-section avatar>
                      <q-icon :name="language.icon" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ language.label }}</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-toggle v-model="settings[language.key]" />
                    </q-item-section>
                  </q-item>
                </q-list>
              </div>

              <div class="text-subtitle1 q-mb-md">Социальные сети</div>

              <div class="row q-col-gutter-md q-mb-lg">
                <div v-for="social in socialSettings" :key="social.key" class="col-md-6 col-sm-12">
                  <q-input
                    v-model="settings[social.key]"
                    :label="social.label"
                    outlined
                  >
                    <template v-slot:prepend>
                      <q-icon :name="social.icon" />
                    </template>
                  </q-input>
                </div>
              </div>

              <div class="row justify-end">
                <q-btn
                  color="primary"
                  label="Сохранить настройки"
                  type="submit"
                  :loading="savingSettings"
                />
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </div>

      <!-- Admin Management and Password -->
      <div class="col-md-5 col-sm-12">
        <!-- Change Password Card -->
        <q-card class="q-mb-md">
          <q-card-section>
            <div class="text-h6">Изменение пароля</div>
          </q-card-section>

          <q-card-section>
            <q-form ref="passwordForm" @submit="changePassword">
              <q-input
                v-model="passwordForm.current_password"
                label="Текущий пароль"
                type="password"
                outlined
                :rules="[val => !!val || 'Введите текущий пароль']"
              />

              <q-input
                v-model="passwordForm.new_password"
                label="Новый пароль"
                type="password"
                outlined
                class="q-mt-md"
                :rules="[
                  val => !!val || 'Введите новый пароль',
                  val => val.length >= 8 || 'Минимальная длина пароля - 8 символов'
                ]"
              />

              <q-input
                v-model="passwordForm.new_password_confirmation"
                label="Подтверждение нового пароля"
                type="password"
                outlined
                class="q-mt-md"
                :rules="[
                  val => !!val || 'Подтвердите новый пароль',
                  val => val === passwordForm.new_password || 'Пароли не совпадают'
                ]"
              />

              <div class="row justify-end q-mt-md">
                <q-btn
                  color="primary"
                  label="Изменить пароль"
                  type="submit"
                  :loading="changingPassword"
                />
              </div>
            </q-form>
          </q-card-section>
        </q-card>

        <!-- Admin Users Management -->
        <q-card v-if="isSuper">
          <q-card-section>
            <div class="text-h6">Администраторы</div>
          </q-card-section>

          <q-card-section>
            <q-list bordered separator>
              <q-item v-for="admin in admins" :key="admin.id">
                <q-item-section>
                  <q-item-label>{{ admin.name }}</q-item-label>
                  <q-item-label caption>{{ admin.email }}</q-item-label>
                </q-item-section>
                <q-item-section side v-if="admin.id !== currentUser.id">
                  <q-btn
                    flat
                    round
                    color="negative"
                    icon="delete"
                    @click="confirmDeleteAdmin(admin)"
                  >
                    <q-tooltip>Удалить администратора</q-tooltip>
                  </q-btn>
                </q-item-section>
              </q-item>
            </q-list>

            <!-- Add Admin Form -->
            <q-form ref="adminForm" @submit="createAdmin" class="q-mt-lg">
              <div class="text-subtitle1 q-mb-md">Добавить администратора</div>

              <div class="row q-col-gutter-md">
                <div class="col-md-6 col-sm-12">
                  <q-input
                    v-model="adminForm.name"
                    label="Имя"
                    outlined
                    :rules="[val => !!val || 'Введите имя']"
                  />
                </div>
                <div class="col-md-6 col-sm-12">
                  <q-input
                    v-model="adminForm.email"
                    label="Email"
                    type="email"
                    outlined
                    :rules="[
                      val => !!val || 'Введите email',
                      val => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || 'Введите корректный email'
                    ]"
                  />
                </div>
              </div>

              <div class="row q-col-gutter-md q-mt-md">
                <div class="col-md-6 col-sm-12">
                  <q-input
                    v-model="adminForm.password"
                    label="Пароль"
                    type="password"
                    outlined
                    :rules="[
                      val => !!val || 'Введите пароль',
                      val => val.length >= 8 || 'Минимальная длина пароля - 8 символов'
                    ]"
                  />
                </div>
                <div class="col-md-6 col-sm-12 flex items-end">
                  <q-btn
                    color="positive"
                    label="Добавить"
                    type="submit"
                    class="full-width"
                    :loading="creatingAdmin"
                  />
                </div>
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Delete Admin Dialog -->
    <q-dialog v-model="deleteAdminDialog.show" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="delete" color="negative" text-color="white" />
          <span class="q-ml-sm">Удаление администратора</span>
        </q-card-section>
        <q-card-section>
          <p>Вы действительно хотите удалить администратора?</p>
          <p v-if="deleteAdminDialog.admin">
            <strong>{{ deleteAdminDialog.admin.name }}</strong> ({{ deleteAdminDialog.admin.email }})
          </p>
          <p class="text-negative">Это действие невозможно отменить.</p>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Отмена" color="primary" v-close-popup />
          <q-btn
            flat
            label="Удалить"
            color="negative"
            @click="deleteAdmin"
            :loading="deleteAdminDialog.loading"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useStore } from 'vuex';
import { api } from 'src/boot/axios';

export default {
  name: 'AdminSettings',

  setup() {
    const $q = useQuasar();
    const store = useStore();

    // Current user
    const currentUser = computed(() => store.state.auth.user);
    const isSuper = computed(() => currentUser.value && currentUser.value.is_super_admin);

    // State
    const loading = ref(true);
    const settings = ref({});
    const admins = ref([]);

    const savingSettings = ref(false);
    const changingPassword = ref(false);
    const creatingAdmin = ref(false);

    // Section settings
    const sectionSettings = [
      { key: 'show_section_about', label: 'Раздел "О нас"', description: 'Отображение информации о проекте' },
      { key: 'show_section_plantations', label: 'Раздел "Плантации"', description: 'Отображение информации о типах плантаций' },
      { key: 'show_section_events', label: 'Раздел "События"', description: 'Отображение предстоящих событий' },
      { key: 'show_section_contact', label: 'Раздел "Контакты"', description: 'Отображение контактной информации' }
    ];

    // Language settings
    const languageSettings = [
      { key: 'enable_lang_en', label: 'Английский', icon: 'flag' },
      { key: 'enable_lang_zh', label: 'Китайский', icon: 'flag' },
      { key: 'enable_lang_ar', label: 'Арабский', icon: 'flag' },
      { key: 'enable_lang_ru', label: 'Русский', icon: 'flag' }
    ];

    // Social media settings
    const socialSettings = [
      { key: 'social_facebook', label: 'Facebook URL', icon: 'fab fa-facebook' },
      { key: 'social_instagram', label: 'Instagram URL', icon: 'fab fa-instagram' },
      { key: 'social_telegram', label: 'Telegram URL', icon: 'fab fa-telegram' },
      { key: 'social_whatsapp', label: 'WhatsApp URL', icon: 'fab fa-whatsapp' }
    ];

    // Forms
    const passwordForm = reactive({
      current_password: '',
      new_password: '',
      new_password_confirmation: ''
    });

    const adminForm = reactive({
      name: '',
      email: '',
      password: ''
    });

    // Delete admin dialog
    const deleteAdminDialog = reactive({
      show: false,
      admin: null,
      loading: false
    });

    // Load settings
    const loadSettings = async () => {
      try {
        loading.value = true;
        const response = await api.get('/api/admin/settings');

        settings.value = response.data.settings;

        // If super admin, load admin users
        if (isSuper.value) {
          admins.value = response.data.admins || [];
        }
      } catch (error) {
        console.error('Error loading settings:', error);
        $q.notify({
          color: 'negative',
          message: 'Ошибка при загрузке настроек',
          icon: 'error'
        });
      } finally {
        loading.value = false;
      }
    };

    // Save settings
    const saveSettings = async () => {
      try {
        savingSettings.value = true;
        await api.post('/api/admin/settings', { settings: settings.value });

        $q.notify({
          color: 'positive',
          message: 'Настройки успешно сохранены',
          icon: 'check_circle'
        });
      } catch (error) {
        console.error('Error saving settings:', error);
        $q.notify({
          color: 'negative',
          message: 'Ошибка при сохранении настроек',
          icon: 'error'
        });
      } finally {
        savingSettings.value = false;
      }
    };

    // Change password
    const changePassword = async () => {
      try {
        changingPassword.value = true;
        await api.post('/api/admin/settings/password', passwordForm);

        // Reset form
        passwordForm.current_password = '';
        passwordForm.new_password = '';
        passwordForm.new_password_confirmation = '';

        $q.notify({
          color: 'positive',
          message: 'Пароль успешно изменен',
          icon: 'check_circle'
        });
      } catch (error) {
        console.error('Error changing password:', error);

        if (error.response && error.response.data && error.response.data.errors) {
          const errorMessages = Object.values(error.response.data.errors).flat();

          errorMessages.forEach(message => {
            $q.notify({
              color: 'negative',
              message: message,
              icon: 'error'
            });
          });
        } else if (error.response && error.response.data && error.response.data.message) {
          $q.notify({
            color: 'negative',
            message: error.response.data.message,
            icon: 'error'
          });
        } else {
          $q.notify({
            color: 'negative',
            message: 'Ошибка при изменении пароля',
            icon: 'error'
          });
        }
      } finally {
        changingPassword.value = false;
      }
    };

    // Create admin
    const createAdmin = async () => {
      try {
        creatingAdmin.value = true;
        await api.post('/api/admin/settings/admin', adminForm);

        // Reload admins
        const response = await api.get('/api/admin/settings');
        admins.value = response.data.admins || [];

        // Reset form
        adminForm.name = '';
        adminForm.email = '';
        adminForm.password = '';

        $q.notify({
          color: 'positive',
          message: 'Администратор успешно создан',
          icon: 'check_circle'
        });
      } catch (error) {
        console.error('Error creating admin:', error);

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
            message: 'Ошибка при создании администратора',
            icon: 'error'
          });
        }
      } finally {
        creatingAdmin.value = false;
      }
    };

    // Confirm delete admin
    const confirmDeleteAdmin = (admin) => {
      deleteAdminDialog.admin = admin;
      deleteAdminDialog.show = true;
    };

    // Delete admin
    const deleteAdmin = async () => {
      if (!deleteAdminDialog.admin) return;

      try {
        deleteAdminDialog.loading = true;
        await api.delete(`/api/admin/settings/admin/${deleteAdminDialog.admin.id}`);

        // Update admins list
        admins.value = admins.value.filter(admin => admin.id !== deleteAdminDialog.admin.id);

        // Close dialog
        deleteAdminDialog.show = false;
        deleteAdminDialog.admin = null;

        $q.notify({
          color: 'positive',
          message: 'Администратор успешно удален',
          icon: 'check_circle'
        });
      } catch (error) {
        console.error('Error deleting admin:', error);
        $q.notify({
          color: 'negative',
          message: 'Ошибка при удалении администратора',
          icon: 'error'
        });
      } finally {
        deleteAdminDialog.loading = false;
      }
    };

    // Load data on component mount
    onMounted(() => {
      loadSettings();
    });

    return {
      loading,
      savingSettings,
      changingPassword,
      creatingAdmin,
      currentUser,
      isSuper,
      settings,
      admins,
      sectionSettings,
      languageSettings,
      socialSettings,
      passwordForm,
      adminForm,
      deleteAdminDialog,
      loadSettings,
      saveSettings,
      changePassword,
      createAdmin,
      confirmDeleteAdmin,
      deleteAdmin
    };
  }
};
</script>
