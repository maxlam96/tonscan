<template>
    <transition name="theme-popup-transition">
        <div class="mobile-menu-popup language-popup" v-if="isOpenLanguage && isMobile">
            <div class="mobile-menu-popup__item"
                v-for="languageCode in availableLanguages"
                v-bind:key="languageCode"
                v-on:click="selected = languageCode"
                v-bind:class="{'mobile-menu-popup__item--active': selected === languageCode }"
            >
                <div class="mobile-menu-popup__item--icon">
                    <CountryFlag v-bind:country="languageCode" size="small" />
                </div>
                <div style="flex-grow: 1;">
                    {{ $t(`settings.language.${languageCode}`) }}
                </div>
                <div v-if="languageCode === selected" class="mobile-menu-popup__item--dot"></div>
            </div>
        </div>
    </transition>
</template>

<script>
import CountryFlag from './CountryFlag.vue';

export default {
    props: {
        isOpenLanguage: Boolean,
    },

    computed: {
        availableLanguages() {
            return this.$i18n.availableLocales;
        },

        selected: {
            get() {
                return this.$store.state.appLocale;
            },

            set(lang) {
                if (this.selected !== lang) {
                    this.$store.commit('updateLocale', lang);
                    // Set small delay so transition looks better
                    setTimeout(() => {
                        this.$emit('toggle-language');
                    }, 500);
                } else {
                    this.$emit('toggle-language');
                }
            },
        },
    },

    components: {
        CountryFlag,
    },
};
</script>

<style lang="scss">
.language-popup {
    left: 20px;
}
</style>
