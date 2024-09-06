<template>
    <div
        v-bind:class="{ 'filter-button': true, 'active': openMenu }"
        v-on:click="handleClick"
    >
        <div class="filter-button__icon">
            <icon-filter-active v-if="openMenu" />
            <icon-filter v-else />
        </div>
        <div class="filter-button__title" v-if="!isTablet && !isMobile">
            <span>{{$t('address.filter.title')}}</span>
        </div>
    </div>
</template>

<script>
import IconFilter from '@img/icons/tonscan/filter.svg?vue';
import IconFilterActive from '@img/icons/tonscan/filter-active.svg?vue';

export default {
    props: ['toggleMenu', 'openMenu'],
    components: {
        IconFilter,
        IconFilterActive,
    },
    methods: {
        handleClick() {
            this.toggleMenu();
        },
    },
};
</script>

<style lang="scss">
.filter-button {
    display: flex;
    align-items: center;
    gap: 10px;
    position: relative;
    border-radius: 8px;
    border: 2px solid var(--card-row-separator);
    padding: 0 17px;
    line-height: 36px;
    user-select: none;
    z-index: 90;
    svg {
        width: 100%;
        height: 100%;
    }
    &__icon {
        display: flex;
        align-items: center;
        width: 18px;
        color: var(--body-muted-text-color);
        fill: var(--blue-bright);
        height: 36px;
        z-index: 1;
    }
    &__title {
        text-transform: uppercase;
        font-weight: 500;
        color: var(--card-header-tab-color);
    }
}

.filter-button.active {
    border-color: var(--blue-bright);
}

.active {
    .filter-button {
        &__icon {
            color: var(--body-text-color);
        }
        &__title {
            color: var(--body-text-color);
        }
    }
}

@media screen and (max-width: 480px) {
    .filter-button, .filter-button.active {
        border-color: transparent;
        padding: 0 5px;
    }
}

</style>
