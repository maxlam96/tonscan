<template>
    <div>
        <div class="currency-logo currency-logo--skeleton" v-bind:class="{'currency-logo--small': size === 'small'}" v-show="!isLogoLoaded"></div>
        <img class="currency-logo" v-show="isLogoLoaded" v-bind:class="{'currency-logo--small': size === 'small'}" v-bind:src="logo" v-on:load="isLogoLoaded = true"/>
    </div>
</template>

<script>

export default {
    props: {
        currency: String,
        size: String,
    },

    data() {
        return {
            isLogoLoaded: false,
            UsdLogo,
            RubLogo,
            AedLogo,
        };
    },

    computed: {
        logo() {
            const logos = {
                usd: UsdLogo,
                rub: RubLogo,
                aed: AedLogo,
            };
            return logos[this.currency] || null;
        },
    },
};
</script>

<style lang="scss">
.currency-logo {
    width: 22px;
    height: 22px;
    border-radius: 50%;

    &--skeleton {
        background: var(--body-light-muted-color);
    }

    &--small {
        width: 18px;
        height: 18px;
        transform: translateY(1.5px);
    }
}
</style>
