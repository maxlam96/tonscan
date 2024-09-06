<template>
    <transition name="theme-popup-transition">
        <div class="mobile-menu-popup theme-popup" v-if="isOpenTheme && isMobile">
            <div class="mobile-menu-popup__item"
                v-for="theme in availableThemes"
                v-bind:key="theme"
                v-on:click="selected = theme"
                v-bind:class="{'mobile-menu-popup__item--active': theme === selected }"
            >
                <div class="mobile-menu-popup__item--icon"
                    v-bind:class="{'mobile-menu-popup__item--icon-active': theme === selected }"
                >
                    <IconSemiCircle v-if="theme === 'auto'" />
                    <IconMoon v-else-if="theme === 'dark'"/>
                    <IconUnion v-else-if="theme === 'light'" />
                </div>
                <div style="flex-grow: 1;">
                    {{ $t(`settings.theme.${theme}`) }}
                </div>
                <div v-if="theme === selected" class="mobile-menu-popup__item--dot"></div>
            </div>
        </div>
    </transition>
</template>

<script>
import IconSemiCircle from '@img/icons/tonscan/semi-circle.svg?vue';
import IconMoon from '@img/icons/tonscan/moon.svg?vue';
import IconUnion from '@img/icons/tonscan/union.svg?vue';

export default {
    props: {
        isOpenTheme: Boolean,
    },

    data() {
        return {
            availableThemes: [
                'auto',
                'dark',
                'light',
            ],
        };
    },

    computed: {
        selected: {
            get() {
                return this.$store.state.appTheme;
            },

            set(theme) {
                if (this.selected !== theme) {
                    this.$store.commit('updateTheme', theme);
                    // Set small delay so transition looks better
                    setTimeout(() => {
                        this.$emit('toggle-theme');
                    }, 500);
                } else {
                    this.$emit('toggle-theme');
                }
            },
        },
    },

    components: {
        IconSemiCircle,
        IconMoon,
        IconUnion,
    },
};
</script>

<style lang="scss">
.theme-popup {
    right: 20px;
}
</style>
