import Vue from 'vue';
import Vuex from 'vuex';

import FILE from './file';
import MY_CJK from './my-cjk';

Vue.use(Vuex);

export default () => {
  const store = new Vuex.Store({
    modules: {
      FILE,
      MY_CJK,
    },
  });

  return store;
};
