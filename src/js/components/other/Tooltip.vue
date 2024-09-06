<template>
    <Transition name="comment-tooltip-animation">
        <div class="comment-tooltip" v-show="comment && hideIcon && showCommentTooltip">{{ comment }}</div>
    </Transition>
</template>

<script>
export default {
    name: 'Tooltip',
    props: {
        hideIcon: Boolean,
        showCommentTooltip: Boolean,
        comment: String,
    },
};
</script>
