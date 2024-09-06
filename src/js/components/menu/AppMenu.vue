<template>
    <transition name="menu-transition-modal">
        <div
            class="app-menu"
            v-if="isOpen || keepMarkup"
            v-bind:style="{ transform: `translateX(${currentX}px)`, transition: transitionProperty }"
            v-on:touchstart="handleTouchStart"
            v-on:touchmove.prevent="handleTouchMove"
            v-on:touchend="handleTouchEnd"
            v-on:click.self="$emit('close-popups')"
        >
            <div class="app-menu-close" v-on:click="closeModal">
                <icon-close />
            </div>
            <div class="app-menu-body">
                <div class="app-menu-nav">
                    <ui-link
                        v-for="(link, index) in links"
                        v-bind:key="index"
                        class="app-menu-nav__item"
                        v-bind:class="{ 'active': link === $route.name }"
                        v-bind:to="{ name: link }"
                        v-on:click.native="closeModal"
                    >
                        <span>{{ $t(`header.links.${link}`) }}</span>
                    </ui-link>
                </div>
            </div>
            <div class="app-menu-footer">
                <!-- The button below will be used in the future -->
                <!-- <div class="app-menu-footer__top">
                    <button class="app-connect-button">
                        <span>{{ $t('menu.connect_wallet') }}</span>
                    </button>
                </div> -->
                <div class="app-menu-footer__bottom">
                    <div class="app-menu-options">
                        <div class="app-menu-options__item-language">
                            <button class="app-menu-options__button" v-bind:class="{'app-menu-options__button--active': isOpenLanguage}" v-on:click="toggleLanguage">
                                <div class="app-menu-options__button--icon">
                                    <CountryFlag v-bind:country="language"/>
                                </div>
                                <div class="app-menu-options__button--value">
                                    <span>{{ $t(`settings.language.${language}`) }}</span>
                                </div>
                            </button>
                        </div>
                        <div class="app-menu-options__item-currency">
                            <button class="app-menu-options__button" v-bind:class="{'app-menu-options__button--active': isOpenCurrency}" v-on:click="toggleCurrency">
                                <div class="app-menu-options__button--icon">
                                    <CurrencyLogo v-bind:currency="currency" />
                                </div>
                                <div class="app-menu-options__button--value">
                                    <span>{{ currency }}</span>
                                </div>
                            </button>
                        </div>
                        <div class="app-menu-options__item">
                            <button class="app-menu-options__button" v-bind:class="{'app-menu-options__button--active': isOpenTheme}" v-on:click="toggleTheme">
                                <div class="app-menu-options__button--icon" v-if="theme === 'light'">
                                    <icon-union />
                                </div>
                                <div class="app-menu-options__button--icon" v-else-if="theme === 'dark'">
                                    <icon-moon />
                                </div>
                                <div class="app-menu-options__button--icon" v-else>
                                    <IconSemiCircle />
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </transition>
</template>

<script>
import IconClose from '@img/icons/tonscan/close.svg?vue';
import IconLanguage from '@img/icons/tonscan/language.svg?vue';
import IconCurrency from '@img/icons/tonscan/currency.svg?vue';
import IconUnion from '@img/icons/tonscan/union.svg?vue';
import IconMoon from '@img/icons/tonscan/moon.svg?vue';
import IconSemiCircle from '@img/icons/tonscan/semi-circle.svg?vue';
import CurrencyLogo from './CurrencyLogo.vue';
import CountryFlag from './CountryFlag.vue';

export default {
    props: {
        isOpen: {
            type: Boolean,
            default: false,
        },
        hideCloseButton: {
            type: Boolean,
            default: false,
        },
        keepMarkup: {
            type: Boolean,
            default: false,
        },
        isOpenTheme: {
            type: Boolean,
        },
        isOpenLanguage: {
            type: Boolean,
        },
        isOpenCurrency: {
            type: Boolean,
        },
    },

    data() {
        return {
            startX: 0,
            currentX: 0,
            moving: false,
            transitionProperty: '',
        };
    },

    computed: {
        links() {
            return [
                'index',
                'blocks',
                'stats',
                'apps',
            ];
        },

        language() {
            return this.$store.state.appLocale;
        },

        currency() {
            return this.$store.state.exchangeRateCurrency;
        },

        theme: {
            get() {
                return this.$store.state.appTheme;
            },

            set(theme) {
                this.$store.commit('updateTheme', theme);
            },
        },
    },

    methods: {
        toggleLanguage() {
            this.$emit('toggle-language');
        },

        toggleCurrency() {
            this.$emit('toggle-currency');
        },

        toggleTheme() {
            this.$emit('toggle-theme');
        },

        closeModal() {
            this.$emit('update:isOpen', false);
            this.$emit('close-popups');
            this.$emit('modal-close');
        },

        // Механика свайпа
        handleTouchStart(event) {
            this.startX = event.touches[0].clientX;
            this.transitionProperty = '';
            this.currentX = 0;
            if (this.startX < 20) {
                this.$emit('close-popups');
            }
        },
        handleTouchMove(event) {
            const touchX = event.touches[0].clientX;
            const deltaX = touchX - this.startX;
            if (deltaX > 0 && this.startX < 60) {
                this.currentX = deltaX;
            } else {
                this.currentX = 0;
            }
        },
        handleTouchEnd() {
            if (this.currentX >= 80) {
                this.closeModal();
            } else {
                this.transitionProperty = '.3s all ease';
            }
            this.currentX = 0;
        },
        // Механика свайпа
    },

    components: {
        IconClose,
        IconUnion,
        IconMoon,
        IconSemiCircle,
        CurrencyLogo,
        CountryFlag,
    },
};
</script>

<style lang="scss">
.app-menu {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: var(--card-background);
    z-index: 99999;
    box-sizing: border-box;
    transition: .3s left ease;
    box-shadow: 0 0.5rem 1.2rem var(--card-box-shadow-color);
}

.app-menu-close {
    position: absolute;
    top: 15px;
    right: 15px;
    width: 24px;
    height: 24px;
    color: var(--body-muted-text-color);
    cursor: pointer;

    &:active {
        opacity: .8;
    }
}

.app-menu-header {
    padding: 25px 0;
    position: relative;
    user-select: none;

    &--title {
        text-align: center;
        font-size: 22px;
        font-weight: 500;
    }
}

.app-menu-back-btn {
    position: absolute;
    left: 20px;
    top: 52%;
    transform: translateY(-50%);
    cursor: pointer;
    display: flex;
    color: var(--blue-bright);
    font-size: 18px;

    svg {
        width: 14px;
        margin-right: 3px;
    }
}

.app-menu-body {
    margin: 50px 0 0 0;
}

.app-menu-nav {
    &__item {
        display: block;
        padding: 5px 20px;
        font-size: 24px;
        font-weight: 500;
        margin-bottom: 20px;
        color: var(--body-muted-text-color);
        position: relative;
        text-decoration: none;
        user-select: none;
    }

    &__item:hover {
        text-decoration: none;
        background: transparent;
    }

    &__item:last-child {
        margin-bottom: 0;
    }

    &__item::after {
        content: "";
        position: absolute;
        left: 0;
        top: 0;
        width: 3px;
        height: 100%;
        border-radius: 0 2px 2px 0;
        background: var(--blue-bright);
        opacity: 0;
    }

    .active {
        color: var(--body-text-color);
        text-decoration: none;
    }

    .active::after {
        opacity: 1;
    }
}

.app-menu-footer {
    padding: 0 20px 20px 20px;
    &__top {
        margin-bottom: 10px;
    }
}

.app-connect-button {
    background-color: var(--big-blue-button-background);
    border: none;
    border-radius: 12px;
    color: #fff;
    cursor: pointer;
    display: block;
    font-size: 14px;
    font-weight: 500;
    padding: 15px 0;
    text-align: center;
    text-transform: uppercase;
    width: 100%;
}

.app-menu-options {
    display: flex;
    justify-content: space-between;
    gap: 10px;

    &__item-language {
        flex: 2;
    }

    &__item-currency {
        flex: 1;
    }

    &__button {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        background-color: var(--button-options-background);
        color: var(--button-options-text);
        border: none;
        border-radius: 12px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        padding: 13px 20px;
        text-align: center;
        text-transform: uppercase;
        width: 100%;
        user-select: none;

        &--icon {
            width: 22px;
            height: 22px;
        }

        &--image {
            width: 22px;
            border-radius: 50%;
        }

        &--active {
            background-color: var(--button-options-background-hover);
        }
    }
}

.mobile-menu-popup {
    position: fixed;
    z-index: 100000;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 6px;
    background-color: var(--theme-popup-background);
    border-radius: 12px;
    cursor: pointer;
    transition: .2s ease;
    border: 1px solid var(--card-border-color);
    width: 210px;
    bottom: 82px;

    &__item {
        height: 35px;
        font-size: 16px;
        padding: 0 9px 0 8px;
        display: flex;
        align-items: center;
        gap: 8px;
        border-radius: 8px;
        transition: .2s;

        &--icon {
            svg {
                fill: var(--button-options-text);
                color: var(--button-options-text);
                width: 16px;
                transform: translateY(1.5px);
            }
        }

        &--icon-active {
            svg {
                fill: var(--blue-bright)!important;
                color: var(--blue-bright)!important;
            }
        }

        &:hover, &--active {
            background-color: var(--theme-popup-active-background);
        }

        &:last-child {
            margin-bottom: 0;
        }

        &--dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background-color: var(--blue-bright);
            // transform: translateY(-1px);
        }
    }
}

.theme-popup-transition-enter-to, .theme-popup-transition-leave {
    opacity: 1;
}

.theme-popup-transition-enter, .theme-popup-transition-leave-to {
    opacity: 0;
    bottom: 74px;
}

.menu-transition-modal-enter-to, .menu-transition-modal-leave {
    left: 0;
}

.menu-transition-modal-enter, .menu-transition-modal-leave-to {
    left: 100vw;
}
</style>
