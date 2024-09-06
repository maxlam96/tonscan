<template>
    <section>
        <app-header-bar/>

        <!-- As soon as this element scrolls out of the viewport, consider page "scrolled": -->
        <app-scroll-detector/>

        <main class="content">
            <router-view/>
        </main>

        <ui-modal
            align-top v-bind:isOpen.sync="settingsModalVisible"
            v-if="!isMobile">
            <template v-slot:header>
                {{$t('settings.title')}}
            </template>
            <app-settings/>
        </ui-modal>

        <app-menu
            v-else
            v-bind:isOpen.sync="settingsModalVisible"
            v-bind:isOpenLanguage="openLanguage"
            v-bind:isOpenCurrency="openCurrency"
            v-bind:isOpenTheme="openTheme"
            v-on:toggle-language="toggleLanguage"
            v-on:toggle-currency="toggleCurrency"
            v-on:toggle-theme="toggleTheme"
            v-on:close-popups="closePopups"
        />

        <app-theme-popup
            v-bind:isOpenTheme="openTheme && settingsModalVisible"
            v-on:toggle-theme="toggleTheme"
        />

        <app-currency-popup
            v-bind:isOpenCurrency="openCurrency && settingsModalVisible"
            v-on:toggle-currency="toggleCurrency"
        />

        <app-language-popup
            v-bind:isOpenLanguage="openLanguage && settingsModalVisible"
            v-on:toggle-language="toggleLanguage"
        />

        <app-toast-container/>
        <app-up-button/>
    </section>
</template>

<script>
import AppScrollDetector from '~/components/AppScrollDetector.vue';
import AppToastContainer from '~/components/AppToastContainer.vue';
import AppHeaderBar from '~/components/AppHeaderBar.vue';
import AppSettings from '~/components/settings/AppSettings.vue';
import AppUpButton from '~/components/AppUpButton.vue';
import AppMenu from './menu/AppMenu.vue';
import AppThemePopup from './menu/AppThemePopup.vue';
import AppLanguagePopup from './menu/AppLanguagePopup.vue';
import AppCurrencyPopup from './menu/AppCurrencyPopup.vue';

export default {
    data() {
        return {
            settingsModalVisible: false,
            openLanguage: false,
            openCurrency: false,
            openTheme: false,
        };
    },

    provide() {
        return {
            openSettings: () => {
                this.settingsModalVisible = true;
            },
        };
    },

    metaInfo() {
        return {
            // Add alternate lang links to every page:
            // @see https://developers.google.com/search/docs/specialty/international/localized-versions
            link: this.$i18n.availableLocales.map(lang => Object.freeze({
                rel: 'alternate',
                hreflang: lang,
                href: this.$localizedUrl(lang),
            })),
        };
    },

    methods: {
        toggleLanguage() {
            this.openLanguage = !this.openLanguage;
            this.openTheme = false;
            this.openCurrency = false;
        },

        toggleCurrency() {
            this.openCurrency = !this.openCurrency;
            this.openTheme = false;
            this.openLanguage = false;
        },

        toggleTheme() {
            this.openTheme = !this.openTheme;
            this.openLanguage = false;
            this.openCurrency = false;
        },

        closePopups() {
            this.openLanguage = false;
            this.openCurrency = false;
            this.openTheme = false;
        },
    },

    components: {
        AppScrollDetector,
        AppToastContainer,
        AppHeaderBar,
        AppSettings,
        AppUpButton,
        AppMenu,
        AppThemePopup,
        AppLanguagePopup,
        AppCurrencyPopup,
    },
};
</script>
