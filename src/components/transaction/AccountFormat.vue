<script lang="ts">
import { computed, defineComponent } from 'vue';

export default defineComponent({
    name: 'AccountFormat',
    props: {
        account: {
            type: String,
            default: () => '',
        },
        type: {
            type: String,
            required: true,
        },
    },
    setup(props) {
        const accAccount = computed(() => props.account);
        return {
            accType: props.type,
            accAccount,
        };
    },
});
</script>

<template lang="pug">
a(:href=" '/' + type + '/' + accAccount" class="hover-dec text-no-wrap") {{type === 'transaction' ? accAccount.slice(0, 8) : accAccount}}
</template>

<style lang="sass" scoped>
.hover-dec
  text-decoration: none
  &:hover
    text-decoration: underline
</style>
