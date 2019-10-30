import Vue from 'vue/dist/vue.common.dev'
import Vuex from 'vuex'
import 'es6-promise/auto'
Vue.use(Vuex)
Vue.config.productionTip = false;

////////////////////////////////////////////////////////////////////////////////
// Todo
Vue.component('todos', {
  template: `
  <div class="todo">
    <div>
      <input></input>
      <button>+</button>
    </div>
    <ul>
    <li><input type="checkbox"><span style="text-decoration: unset;">Hola Mundo</span><button>x</button></li>
    </ul>
  </div>`  
});
////////////////////////////////////////////////////////////////////////////////

Vue.component('calc', {
  template: `
  <div>
    Calc
  </div>`  
});
Vue.component('invoice', {
  template: `
  <div>
    Items
  </div>`  
});

////////////////////////////////////////////////////////////////////////////////

const TodoTab = 'TodoTab';
const CalcTab = 'CalcTab';
const InvoiceTab = 'InvoiceTab';

const appStoreModule = {
  state: {
    tab: TodoTab
  },
  mutations: {
    changeTab (state,tab) {
      state.tab = tab;
    }
  }
};
Vue.component('todoapp-vue', {
  template: `
  <div>
    <ul>
      <li><button v-on:click="showTodos">Todo</button></li>
      <li><button v-on:click="showCalc">Calc</button></li>
      <li><button v-on:click="showInvoice">Invoice</button></li>
    </ul>
    <todos v-if="isTodo"></todos>
    <calc v-if="isCalc"></calc>
    <invoice v-if="isInvoice"></invoice>
  </div>
  `,
  computed: {
    isTodo: function(){
      return this.$store.state.app.tab == TodoTab;
    },
    isCalc: function(){
      return this.$store.state.app.tab == CalcTab;
    },
    isInvoice: function(){
      return this.$store.state.app.tab == InvoiceTab;
    }
  },
  methods: {
    showTodos: function(){
      this.$store.commit('changeTab', TodoTab);
    },
    showCalc: function(){
      this.$store.commit('changeTab', CalcTab);
    },
    showInvoice: function(){
      this.$store.commit('changeTab', InvoiceTab);
    }
  }
});

// setup

const store = new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',
  modules: {
    app: appStoreModule
  }
});
new Vue({
  el: '#todoapp-vue',
  store
});
