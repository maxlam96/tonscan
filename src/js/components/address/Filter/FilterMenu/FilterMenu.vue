<template>
    <div class="filter-menu" v-if="this.openMenu">
        <div class="card filter-menu__card">
            <div class="filter-section">
                <div class="filter-section__title">
                    <span>{{$t('filter.timeFormat')}}</span>
                </div>
                <!-- <div class="filter-select-buttons">
                    <div class="filter-select-buttons__content">
                        <div
                            class="filter-select-button"
                            v-bind:class="{ 'active-button': timeFormatData === 'absolute'}"
                            v-on:click="setTimeFormatData('absolute')"
                        >
                            <span>Absolute</span>
                        </div>
                        <div
                            class="filter-select-button"
                            v-bind:class="{ 'active-button': timeFormatData === 'smart' }"
                            v-on:click="setTimeFormatData('smart')"
                        >
                            <span>Smart</span>
                        </div>
                        <div
                            class="filter-select-button"
                            v-bind:class="{ 'active-button': timeFormatData === 'relative' }"
                            v-on:click="setTimeFormatData('relative')"
                        >
                            <span>Relative</span>
                        </div>
                    </div>
                </div> -->
                <div class="filter-select-menu">
                    <div
                        class="filter-select-menu__button"
                        v-bind:class="{ 'active-select': timeFormatData === 'relative' }"
                        v-on:click="setTimeFormatData('relative')"
                    >
                        <div class="filter-select-menu__button-item">
                            <div class="filter-select-menu__button-title">
                                <span>{{$t('filter.timeRelativeTitle')}}</span>
                            </div>
                            <div class="filter-select-menu__button-description">
                                <span>{{$t('filter.timeRelativeDescription')}}</span>
                            </div>
                        </div>
                        <div class="filter-select-menu__button-item">
                            <div class="filter-select-menu__check">
                                <icon-success class="filter-select-menu__check__check-icon"/>
                            </div>
                        </div>
                    </div>
                    <div
                        class="filter-select-menu__button"
                        v-bind:class="{ 'active-select': timeFormatData === 'smart' }"
                        v-on:click="setTimeFormatData('smart')"
                    >
                        <div class="filter-select-menu__button-item" >
                            <div class="filter-select-menu__button-title">
                                <span>{{$t('filter.timeSmartTitle')}}</span>
                            </div>
                            <div class="filter-select-menu__button-description">
                                <span>{{$t('filter.timeSmartDescription')}}</span>
                            </div>
                        </div>
                        <div class="filter-select-menu__button-item">
                            <div class="filter-select-menu__check">
                                <icon-success class="filter-select-menu__check__check-icon"/>
                            </div>
                        </div>
                    </div>
                    <div
                        class="filter-select-menu__button"
                        v-bind:class="{ 'active-select': timeFormatData === 'unix' }"
                        v-on:click="setTimeFormatData('unix')"
                    >
                        <div class="filter-select-menu__button-item">
                            <div class="filter-select-menu__button-title">
                                <span>Unix</span>
                            </div>
                            <div class="filter-select-menu__button-description">
                                <span>1725262625000</span>
                            </div>
                        </div>
                        <div class="filter-select-menu__button-item">
                            <div class="filter-select-menu__check">
                                <icon-success class="filter-select-menu__check__check-icon"/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="filter-section">
                <div class="filter-section__title">
                    <span>{{$t('filter.transactionView')}}</span>
                </div>
                <div
                    class="filter-section__closed"
                    v-on:click="handleClick"
                >✕</div>
                <div class="filter-select-menu">
                    <div
                        class="filter-select-menu__button"
                        v-bind:class="{ 'active-select': transactionViewData === 'alternative' }"
                        v-on:click="setTransactionViewData('alternative')"
                    >
                        <div class="filter-select-menu__button-item">
                            <div class="filter-select-menu__button-title">
                                <span>{{$t('filter.transactionAlternativeTitle')}}</span>
                            </div>
                            <div class="filter-select-menu__button-description">
                                <span>{{$t('filter.transactionAlternativeDescription')}}</span>
                            </div>
                        </div>
                        <div class="filter-select-menu__button-item">
                            <div class="filter-select-menu__check">
                                <icon-success class="filter-select-menu__check__check-icon"/>
                            </div>
                        </div>
                    </div>
                    <div
                        class="filter-select-menu__button"
                        v-bind:class="{ 'active-select': transactionViewData === 'professional' }"
                        v-on:click="setTransactionViewData('professional')"
                    >
                        <div class="filter-select-menu__button-item">
                            <div class="filter-select-menu__button-title">
                                <span>{{$t('filter.transactionProfessionalTitle')}}</span>
                            </div>
                            <div class="filter-select-menu__button-description">
                                <span>{{$t('filter.transactionProfessionalDescription')}}</span>
                            </div>
                        </div>
                        <div class="filter-select-menu__button-item">
                            <div class="filter-select-menu__check">
                                <icon-success class="filter-select-menu__check__check-icon"/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <!-- <div class="filter-section">
                <div class="filter-section__title">
                    <span>Hide small amounts</span>
                </div>
                <div class="filter-select-buttons">
                    <div class="filter-select-buttons__content">
                        <div
                            class="filter-select-button"
                            v-bind:class="{ 'active-button': buttonData === '' && inputData === '' }"
                            v-on:click="setCleanData()"
                        >
                            <span>No</span>
                        </div>
                        <div
                            class="filter-select-button"
                            v-bind:class="{ 'active-button': buttonData === '0.01' }"
                            v-on:click="setButtonData('0.01')"
                        >
                            <span>0.01</span>
                        </div>
                        <div
                            class="filter-select-button"
                            v-bind:class="{ 'active-button': buttonData === '0.1' }"
                            v-on:click="setButtonData('0.1')"
                        >
                            <span>0.1</span>
                        </div>
                    </div>
                    <div class="filter-select-buttons__input" v-bind:class="{ 'active-input': inputDataNotEmpty }">
                        <input
                            type="text"
                            class="input"
                            placeholder="SET"
                            v-model="inputData"
                            v-on:input="handleInput"
                        />
                    </div>
                </div>
            </div>
            <div class="filter-section">
                <div class="filter-section__title">
                    <span>Appearance</span>
                </div>
                <div class="filter-select-menu">
                    <div class="filter-select-menu__button" v-on:click="toggleShowExternals()">
                        <div class="filter-select-menu__button-item">
                            <div class="filter-select-menu__button-title">
                                <span>Show externals</span>
                            </div>
                        </div>
                        <div class="filter-select-menu__button-item">
                            <div
                                class="filter-select-menu-toggle"
                                v-bind:class="{ 'active-toggle': showExternals === true }"
                            ></div>
                        </div>
                    </div>
                    <div class="filter-select-menu__button" v-on:click="toggleShowIcons()">
                        <div class="filter-select-menu__button-item">
                            <div class="filter-select-menu__button-title">
                                <span>Show icons</span>
                            </div>
                        </div>
                        <div class="filter-select-menu__button-item">
                            <div
                                class="filter-select-menu-toggle"
                                v-bind:class="{ 'active-toggle': showIcons === true }"
                            ></div>
                        </div>
                    </div>
                    <div class="filter-select-menu__button" v-on:click="toggleShowEvents()">
                        <div class="filter-select-menu__button-item">
                            <div class="filter-select-menu__button-title">
                                <span>Show events</span>
                            </div>
                        </div>
                        <div class="filter-select-menu__button-item">
                            <div
                                class="filter-select-menu-toggle"
                                v-bind:class="{ 'active-toggle': showEvents === true }"
                            ></div>
                        </div>
                    </div>
                </div>
            </div> -->
        </div>
    </div>
</template>

<script>
import IconSuccess from '@primer/octicons/build/svg/check-16.svg?inline';

export default {
    data() {
        return {
            buttonData: '',
            inputData: '',
            timeFormatData: this.$store.state.timeFormatData,
            transactionViewData: this.$store.state.transactionViewData,
            showExternals: false,
            showIcons: false,
            showEvents: false,
        };
    },
    props: ['toggleMenu', 'openMenu'],
    computed: {
        inputDataNotEmpty() {
            return this.inputData !== '';
        },
    },
    methods: {
        handleClick() {
            this.toggleMenu();
        },
        toggleShowExternals() {
            this.showExternals = !this.showExternals;
        },
        toggleShowIcons() {
            this.showIcons = !this.showIcons;
        },
        toggleShowEvents() {
            this.showEvents = !this.showEvents;
        },
        setButtonData(value) {
            this.buttonData = value;
            this.inputData = '';
        },
        setTimeFormatData(value) {
            this.timeFormatData = value;
            this.$store.commit('updateTimeFormatData', value);
            window.localStorage.setItem('timeFormatData', value);
        },
        setTransactionViewData(value) {
            this.transactionViewData = value;
            this.$store.commit('updateTransactionViewData', value);
            window.localStorage.setItem('transactionViewData', value);
        },
        setCleanData() {
            this.inputData = '';
            this.buttonData = '';
        },
        handleInput(e) {
            const input = e.target.value;
            e.target.value = input.replace(/\D/g, '');
            this.inputData = e.target.value;
            if (this.inputData) {
                this.buttonData = '';
            }
        },
    },
    components: { IconSuccess },
};
</script>

<style lang="scss">
.filter-select-menu-toggle::after,
.filter-select-menu-toggle {
    -webkit-transition: all .2s;
    -o-transition: all .2s;
    transition: all .2s;
}

.filter-menu {
    position: absolute;
    top: 47px;
    right: 10px;
    width: 400px;
    z-index: 90001;
    padding-bottom: 20px;
    &__card {
        padding: 16px;
    }
}

.filter-section {
    margin-bottom: 15px;
    &__title {
        padding: 4px 2px 2px;
        text-transform: uppercase;
        font-size: 14px;
        font-weight: 500;
        margin: 0;
        opacity: 0.6;
        margin-bottom: 15px;
    }
    &__closed {
        position: absolute;
        top: 20px;
        right: 20px;
        font-size: 16px;
        opacity: .6;
        display: none;
        cursor: pointer;
    }
}

.filter-section:last-child {
    margin-bottom: 0;
}

.filter-select-menu {
    background: var(--modal-dark-background);
    min-height: 20px;
    border-radius: 12px;
    &__button-item:first-child {
        flex-grow: 1;
    }
    &__button {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px;
        border: 2px solid transparent;
        border-radius: 12px;
        cursor: pointer;
        position: relative;
        user-select: none;
    }
    &__button-title {
        font-size: 14px;
        font-weight: 500;
    }
    &__button-description {
        font-size: 12px;
        margin-top: 7px;
        color: var(--body-muted-text-color);
    }
    &__check {
        opacity: 0;
        width: 22px;
        height: 22px;
        background: var(--blue-bright);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        &__check-icon {
            fill: #FFF;
            width: 14px;
        }
    }
}

.filter-select-menu-toggle {
    width: 45px;
    height: 25px;
    background: var(--modal-toggle-background);
    border-radius: 50px;
    position: relative;
}

.filter-select-menu-toggle::after {
    content: "";
    position: absolute;
    left: 3px;
    top: 50%;
    width: 20px;
    height: 20px;
    background: #fff;
    border-radius: 50px;
    transform: translate(0%,-50%);
}

.filter-select-menu {
    &__button::after {
        content: "";
        width: calc(100% - 30px);
        position: absolute;
        left: 15px;
        bottom: -1px;
        height: 1px;
        background: var(--card-row-separator);
    }
    &__button:last-child::after {
        opacity: 0;
    }
}

.active-toggle {
    background: var(--blue-bright);
}

.active-toggle::after {
    left: 23px;

}

.active-select::after {
    opacity: 0;
}

.active-select {
    border: 2px solid var(--blue-bright);
    background: var(--modal-button-select-color);
    .filter-select-menu {
        &__check {
            opacity: 1;
        }
    }
}

.active-input::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: transparent;
    border-radius: 12px;
    z-index: 1;
    pointer-events: none;
    border: 2px solid var(--blue-bright);
}

.active-button::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: transparent;
    border-radius: 12px;
    z-index: 1;
    pointer-events: none;
    border: 2px solid var(--blue-bright);
}

.filter-select-buttons {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 15px;
    &__content {
        background: var(--modal-dark-background);
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-grow: 1;
    }
    &__input {
        width: 90px;
        position: relative;
    }
}

.filter-select-buttons .input {
    background: var(--modal-dark-background);
    color: var(--body-text-color);
    text-align: center;
    border-radius: 12px;
    width: 100%;
    line-height: 43px;
    border: 0;
    padding: 0 15px;
    box-sizing: border-box;
    cursor: pointer;
    font-weight: 500;
}

.filter-select-buttons .input::placeholder {
  font-weight: bold;
  text-align: center;
  -webkit-text-align: center;
  -moz-text-align: center;
}

.filter-select-button {
    position: relative;
    line-height: 43px;
    font-weight: 500;
    width: 33.333%;
    text-align: center;
    cursor: pointer;
    user-select: none;
}

.filter-select-button::after {
    content: "";
    height: calc(100% - 14px);
    position: absolute;
    right: 0px;
    bottom: 7px;
    width: 1px;
    background: var(--card-row-separator);
}

.filter-select-button:last-child::after {
    opacity: 0;
}

@media screen and (max-width: 599px) {
    .filter-menu {
        position: fixed;
        top: auto;
        bottom: 0;
        right: 0;
        width: 100%;
        z-index: 90001;
        padding-bottom: 0;
    }
    .filter-section {
        &__closed {
            display: block;
        }
    }
    .filter-menu {
        &__card {
            border-radius: 12px 12px 0 0!important;
        }
    }
}
</style>
