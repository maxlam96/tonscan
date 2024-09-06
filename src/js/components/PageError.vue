<template>
    <div class="error-page-wrapper">
        <div class="error-page">
            <h1 class="error-page__title">
                {{$t('not_found.title')}}
            </h1>

            <div class="error-page__description">
                {{$t('not_found.description')}}
            </div>

            <ui-link class="error-page__button" v-bind:to="{ name: 'index'}">
                {{$t('not_found.button')}}
            </ui-link>
        </div>
    </div>
</template>

<script>
export default {
    metaInfo: {
        meta: [{
            name: 'robots', content: 'follow, noarchive, noindex',
        }],
    },
};
</script>

<style lang="scss">
.error-page-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    height: calc(100vh - 150px);
}

.error-page {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    max-width: 480px;
    padding: 16px;
    &__title {
        font-size: 36px;
        font-weight: 500;
        letter-spacing: -1px;
        line-height: 40px;
        margin: 0;
        padding: 0;
        text-align: center;
    }
    &__description {
        color: #909097;
        font-size: 16px;
        line-height: 1.5;
        margin-top: 10px;
        text-align: center;
    }
    &__button {
        display: inline-block;
        border: 1px solid var(--body-light-muted-color);
        padding: 0 12px;
        line-height: 36px;
        border-radius: 7px;
        color: var(--body-text-color);
        transition: all .2s;
        margin-top: 15px;
        &:hover {
            color: var(--body-text-color);
            border: 1px solid var(--body-muted-text-color);
            text-decoration: none;
        }
    }
}

@media screen and (max-width: 480px) {
    .error-page {
        &__description {
            font-size: 18px;
        }
    }
}

</style>
