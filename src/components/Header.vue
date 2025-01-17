<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useQuasar } from 'quasar';
import LoginHandler from 'components/LoginHandler.vue';
import HeaderSearch from 'components/HeaderSearch.vue';
import { getChain } from 'src/config/ConfigManager';
import { useStore } from 'src/store';

export default defineComponent({
    name: 'AppHeader',
    components: {
        LoginHandler,
        HeaderSearch,
    },
    setup() {
        const $q = useQuasar();
        const chain = getChain();
        const store = useStore();
        const account = computed(() => store.state.account.accountName);
        const isLarge = computed((): boolean => $q.screen.gt.sm);

        return {
            account,
            isLarge: isLarge,
            chain,
        };
    },
});
</script>

<template lang="pug">
.header-background
  .row.text-center.q-pt-sm.justify-between.q-pt-md
    .logo-container.col-xs-2.col-sm-2.col-md-2.col-lg-2
      .q-px-xs-xs.q-px-sm-xs.q-px-md-md.q-px-lg-md
        a( href="/").float-left.q-ml-sm
          img.logo( v-if="isLarge" :src="chain.getLargeLogoPath()")
          img.logo-token( v-else :src="chain.getSmallLogoPath()")
    .col-xs-5.col-sm-6.col-md-4.col-lg-6
      .q-px-xs-xs.q-px-sm-xs.q-px-md-md.q-px-lg-md
        .row.justify-center.full-width
          .col-12
            HeaderSearch

    LoginHandler
  .row.justify-center.col-12.q-pt-sm
    q-tabs(active-class="active-tab" indicator-color="white" align="justify" narrow-indicator color="white")
      q-route-tab.deactive(name="network" label="Network" to='/')
      q-route-tab.deactive(name="wallet" v-if="account" label="Wallet" :to="'/account/' + account")
      q-route-tab.deactive(name="vote" label="Vote" to='/vote')
      q-route-tab.deactive(name="proposal"  label="Proposal" to='/proposal')
      //- q-route-tab.deactive(name="explore" label="Explore" to='/explore')
</template>

<style lang="sass" scoped>
.q-tab
  text-transform: unset
  font-size: 18px

.logo
  width: 104px
  height:40px
.logo-token
  width: 40px
  height: 40px

.header-items
  list-style-type: none

.active-tab
  text-decoration: none
  color: #ffffff
  opacity: 1 !important

.deactive
  opacity: 0.3
  font-size: 18px

.header-background
  background: var(--q-secondary)
</style>
