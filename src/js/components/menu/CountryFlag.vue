<template>
    <div>
        <RuFlag v-once v-if="country === 'ru'" />
        <EnFlag v-once v-else-if="country === 'en'" />
    </div>
</template>

<script>
 import RuFlag from '@img/icons/flags/ru.svg?inline';
 import EnFlag from '@img/icons/flags/us.svg?inline';
export default {
    props: {
        country: String,
    },

    components: {
        RuFlag,
        EnFlag,
    },
};
</script>

<style lang="scss"></style>
