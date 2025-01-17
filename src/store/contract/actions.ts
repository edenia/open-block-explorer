import { ActionTree } from 'vuex';
import { StateInterface } from 'src/store/index';
import { ContractStateInterface } from 'src/store/contract/state';

export const actions: ActionTree<ContractStateInterface, StateInterface> = {
    async setContract({ dispatch, commit }, contractAddress) {
        commit('setContract', contractAddress);
        await dispatch('getContractInfo', contractAddress);
    },
    getContractInfo({ commit }, contractAddress) {
    //await getContract  via api
        console.log(contractAddress); //unused var otherwise
        const response: { creator: string } = { creator: 'bob' }; //mock
        commit('setCreator', response.creator);
    },
};
