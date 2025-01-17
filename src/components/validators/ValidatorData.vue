<script lang="ts">
import { defineComponent, computed, ref, onMounted, watch } from 'vue';
import ValidatorDataTable from 'src/components/validators/ValidatorDataTable.vue';
import { api } from 'src/api';
import { useStore } from 'src/store';
import ViewTransaction from 'src/components/ViewTransanction.vue';
import { GetTableRowsParams } from 'src/types';
import WalletModal from 'src/components/WalletModal.vue';
import { getChain } from 'src/config/ConfigManager';
import { Name } from '@greymass/eosio';

const chain = getChain();

export default defineComponent({
    name: 'ValidatorData',
    components: {
        ValidatorDataTable,
        ViewTransaction,
        WalletModal,
    },
    setup() {
        const store = useStore();
        const symbol = chain.getSystemToken().symbol;
        const account = computed(() => store.state.account.accountName);
        const balance = computed(
            () => (Number(lastWeight.value).toFixed(2) || '0') + ` ${symbol}`,
        );
        const activecount = computed(() => {
            if (store.state.chain.producers.length > 42) {
                return 42;
            } else {
                return store.state.chain.producers.length;
            }
        });
        const lastUpdated = ref<string>('');
        const producerVotes = ref<Name[]>([]);
        const currentVote = computed(() => store.state.account.vote);
        const showCpu = ref<boolean>(false);
        const voteChanged = ref<boolean>(false);
        const resetFlag = ref<boolean>(false);
        const lastWeight = ref<number>(0);
        const lastStaked = ref<number>(0);
        const stakedAmount = ref<number>(0);
        const accountValid = computed(() => account.value && account.value !== '');
        const transactionId = ref<string>(store.state.account.TransactionId);
        const transactionError = ref<unknown>(store.state.account.TransactionError);
        const openTransaction = ref<boolean>(false);
        const showWalletModal = ref<boolean>(false);
        const payrate = ref(0);
        const top21pay24h = ref(0);
        const supply = ref(0);
        const voters = ref(0);
        const amount_voted = ref(0);
        const votesProgress = computed(() => amount_voted.value / supply.value || 0);

        function assetToAmount(asset: string, decimals = -1): number {
            try {
                let qty: string = asset.split(' ')[0];
                let val: number = parseFloat(qty);
                if (decimals > -1) {
                    qty = val.toFixed(decimals);
                }
                return val;
            } catch (error) {
                return 0;
            }
        }
        async function getVotingStatistics() {
            await getVoteWeight();
            await updateVoteAmount();
            await updateSupply();
            await updatePayRate();
        }

        async function getVoteWeight() {
            const paramsVoteWeight = {
                code: 'eosio',
                scope: 'eosio',
                table: 'voters',
                lower_bound: Name.from(account.value),
                limit: 1,
            } as GetTableRowsParams;
            lastWeight.value = (
        (await api.getTableRows(paramsVoteWeight)) as {
          rows: { last_vote_weight: number }[];
        }
            ).rows[0].last_vote_weight;
        }

        async function updatePayRate() {
            const sharecount =
        activecount.value <= 21
            ? activecount.value * 2
            : 42 + (activecount.value - 21);
            const paramsPayrate = {
                code: 'eosio',
                scope: 'eosio',
                table: 'payrate',
            } as GetTableRowsParams;
            payrate.value = (
        (await api.getTableRows(paramsPayrate)) as {
          rows: { bpay_rate: number }[];
        }
            ).rows[0].bpay_rate;
            // 2 shares per top 21 bp
            // 1 share for standby up untill 42 bps
            top21pay24h.value =
        (((payrate.value / 100000) * supply.value) / 365 / sharecount) * 2;
        }

        async function updateSupply() {
            const paramsSupply = {
                code: 'eosio.token',
                scope: chain.getSystemToken().symbol,
                table: 'stat',
            } as GetTableRowsParams;
            supply.value = assetToAmount(
                (
          (await api.getTableRows(paramsSupply)) as {
            rows: { supply: string }[];
          }
                ).rows[0].supply,
            );
        }

        async function updateVoteAmount() {
            const request = {
                code: 'eosio',
                lower_bound: 'eosio',
                table: 'voters',
            };
            voters.value = (await api.getTableByScope(request))[0].count;
            const totalStakeParams = {
                code: 'eosio',
                scope: 'eosio',
                table: 'global',
            } as GetTableRowsParams;
            amount_voted.value =
        (
          (await api.getTableRows(totalStakeParams)) as {
            rows: { total_activated_stake: number }[];
          }
        ).rows[0].total_activated_stake / 10000;
        }

        function toggleView() {
            showCpu.value = !showCpu.value;
        }
        async function sendVoteTransaction() {
            if (accountValid.value) {
                await store.dispatch('account/sendVoteTransaction');
                openTransaction.value = true;
                await getVoteWeight();
            } else {
                showWalletModal.value = true;
            }
        }

        watch(activecount, () => {
            void getVotingStatistics();
        });

        onMounted(async () => {
            await getVotingStatistics();
        });

        return {
            account,
            lastUpdated,
            producerVotes,
            showCpu,
            voteChanged,
            resetFlag,
            lastWeight,
            lastStaked,
            stakedAmount,
            currentVote,
            accountValid,
            openTransaction,
            transactionId,
            transactionError,
            payrate,
            top21pay24h,
            supply,
            voters,
            amount_voted,
            votesProgress,
            balance,
            showWalletModal,
            symbol,
            toggleView,
            sendVoteTransaction,
        };
    },
});
</script>

<template lang="pug">
div
  .q-pa-md
    .row.q-col-gutter-md.q-pt-md
      .col-md-8.col-sm-12.col-xs-12
        q-card(flat).full-height.card-gradient
          q-card-section
            .row.q-pa-md.text-h5.text-weight-light Voting Statistics
            .row.q-pa-md
              .col-12
                q-linear-progress.gradient-color(size="120px" rounded :value="votesProgress" class="q-mt-sm")
            .row.q-pa-md
              .col-12
                .row
                  .col-6.text-uppercase.text-weight-light.text-grey-4 Total votes
                  .col-6
                    .float-right.text-uppercase.text-weight-light.text-grey-4 Total Supply
                .row
                  .col-6 {{ amount_voted.toLocaleString(undefined, {minimumFractionDigits: 4,maximumFractionDigits: 4,}) }}
                  .col-6
                    .float-right {{ supply.toLocaleString(undefined, {minimumFractionDigits: 4,maximumFractionDigits: 4,}) }}

      .col-md-4.col-sm-12.col-xs-12(v-if="accountValid")
        q-card(flat).full-height.card-gradient
          q-card-section.card-gradient
            .row.full-width.justify-center
              .text-h6.q-py-md.text-weight-light.text-grey-4 Current Vote Weight
              q-icon.info-icon(name="info" color="white" size="20px")
                q-tooltip(anchor="top middle" self="bottom middle" :offset="[10, 10]") Voting is inversley weighted and increases the more validators you vote for (up to 30).

            .row.full-width.justify-center.text-h5 {{ balance }}
            .row.full-width.justify-center.text-h6.q-py-md.text-weight-light.text-grey-4 {{account}}
          q-separator(color="primary" size="2px")
          q-card-section
            .row.full-width.justify-center.subtitle2.q-py-md.text-weight-light.text-grey-4.q-pt-lg SELECTED {{currentVote.length}} BLOCK PRODUCERS
            .row.full-width.justify-center
              q-btn.full-width.q-pa-sm(label="Vote for Block Producers" color="primary" @click="sendVoteTransaction")
      .col-md-4.col-sm-12.col-xs-12(v-else)
        q-card(flat).full-height.card-gradient
          q-card-section.full-height
            .column.justify-center.full-height
              .row
                .col-12.subtitle2.q-pb-md.text-weight-light.text-grey-4.q-pt-lg.text-center SELECTED {{currentVote.length}} BLOCK PRODUCERS
                .col-12
                  q-btn.full-width.q-pa-sm(label="Vote for Block Producers" color="primary" @click="sendVoteTransaction")
  ValidatorDataTable(
    ref="ValidatorDataTable"
    :top21pay24h = 'top21pay24h'
  )
  ViewTransaction(:transactionId="transactionId" v-model="openTransaction" :transactionError="transactionError || ''" message="Transaction complete")
  WalletModal( v-model='showWalletModal')
</template>

<style lang="sass" scoped>
.card-gradient
  background: var(--q-color-secondary-gradient)
  color: white

.info-icon
  display: inline-block
  margin-top: auto
  margin-bottom: auto
  margin-left: 0.5rem
</style>
