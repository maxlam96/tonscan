<template>
    <div class="ui-up-button"
        v-bind:class="{
            'ui-up-button--index': $route.name === 'index',
            'ui-up-button--visible': isVisible
        }"
        v-on:click="toTop">
        <up-icon class="ui-up-button__icon"/>
    </div>
</template>

<script>
import { mapState } from 'vuex';
import UpIcon from '@img/icons/tonscan/top.svg?vue';

export default {
    data() {
        return {
            lastScrollPosition: 0,
            scrollingUpwards: false,
        };
    },

    computed: {
        ...mapState(['appIsScrolled']),

        buttonMayOverlapContents() {
            return this.isMobile || this.isTablet;
        },

        isVisible() {
            return this.buttonMayOverlapContents
                ? this.appIsScrolled && this.scrollingUpwards
                : this.appIsScrolled;
        },
    },

    mounted() {
        window.addEventListener('scroll', this.handleScroll, { passive: true });
    },

    beforeDestroy() {
        window.removeEventListener('scroll', this.handleScroll);
    },

    methods: {
        toTop() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth',
            });
        },

        handleScroll() {
            if (this.buttonMayOverlapContents) {
                const currentScrollPosition = window.scrollY;

                this.scrollingUpwards = currentScrollPosition < this.lastScrollPosition;
                this.lastScrollPosition = currentScrollPosition;
            }
        },
    },

    components: {
        UpIcon,
    },
};
</script>

<style lang="scss">
.ui-up-button {
    display: flex;
    justify-content: center;
    align-items: center;
    position: fixed;
    bottom: -80px;
    right: 30px;
    cursor: pointer;
    width: 48px;
    height: 48px;
    z-index: 8000;
    transition: all .2s;
    background: var(--card-background);
    border: 1px solid var(--card-border-color);
    border-radius: 50px;
    box-shadow: 0 0.5rem 1.2rem var(--card-box-shadow-color);
    color: var(--body-text-color);
    opacity: 0;

    @media (hover: hover) {
        &:hover {
            opacity: 1;
            color: var(--blue-bright);
        }
    }

    &--visible {
        bottom: 30px;
        opacity: 0.92;
    }

    &__icon {
        fill: currentColor;
        height: 10px;
        width: 10px;
    }
}

@media screen and (max-width: 768px) {
    .ui-up-button {
        &--index {
            display: none;
        }
    }
}
</style>
