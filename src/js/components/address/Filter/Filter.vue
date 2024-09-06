<template>
    <div class="filter filter-hidden">
        <filter-button
            v-on:open-menu-request="openMenu = $event"
            v-bind:openMenu="this.openMenu"
            v-bind:toggle-menu="toggleMenu"
        />
        <filter-menu
            v-on:open-menu-request="openMenu = $event"
            v-bind:openMenu="this.openMenu"
            v-bind:toggle-menu="toggleMenu"
        />
        <div
            class="filter-overlay"
            v-if="this.openMenu"
            v-on:click="toggleMenu"
        ></div>
    </div>
</template>

<script>
import FilterButton from './FilterButton/FilterButton.vue';
import FilterMenu from './FilterMenu/FilterMenu.vue';

export default {
    data() {
        return {
            openMenu: false,
        };
    },

    methods: {
        toggleMenu() {
            this.openMenu = !this.openMenu;
        },
    },

    components: {
        FilterButton,
        FilterMenu,
    },
};
</script>

<style lang="scss">
.filter {
    padding: 0 10px;
    position: relative;
    z-index: 1020;
}

// .filter-hidden {
//     display: none;
// }

.filter-button {
    cursor: pointer;
    position: relative;
}

.filter:before {
    content: "";
    height: 100%;
    width: 80px;
    position: absolute;
    left: -75px;
    top: 0;
    background: linear-gradient(to left, var(--card-background), transparent);
}

.filter-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 90000;
}

@media screen and (max-width: 599px) {
    .filter-overlay {
        background: rgba(0,0,0,0.4);
    }
}
</style>
