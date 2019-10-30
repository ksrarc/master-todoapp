import Vue from 'vue/dist/vue.common.dev'
import Vuex, { mapState, mapGetters, mapMutations} from 'vuex'
import 'es6-promise/auto'
Vue.use(Vuex)
Vue.config.productionTip = false;

////////////////////////////////////////////////////////////////////////////////
// Todo
const todoStoreModule = {
  state: {
    todos: [{
      id: 1, text: "hola mundo", checked: false
    },{
      id: 2, text: "cesar arana", checked: false
    }],
    newText: "",
    counter: 100
  },
  getters: {
    newText: state => state.newText
  },
  mutations: {
    checkTodo(state,{id,checked}) {
      state.todos = state.todos.map(t => t.id === id? {...t, checked} : t );
    },
    deleteTodo(state,id) {
      state.todos = state.todos.filter(t => t.id !== id);
    },
    changeNewText(state,text){
      state.newText =text;
    },
    newTodo(state){
      state.todos = [...state.todos, {
        id: state.counter,
        text: state.newText,
        checked: false
      }];
      state.counter++;
      state.newText = "";
    }
  }
};
Vue.component('todos', {
  template: `
  <div class="todo">
    <div>
      <input :value="newText" @change="changeNewText($event.target.value)" />
      <button @click="newTodo">+</button>
    </div>
    <ul>
      <li v-for="(todo,index) in todos">
        <input  type="checkbox"
                @change="checkTodo(todo.id, $event.target.checked)"/>
        <span v-bind:style="{textDecoration: todo.textDecoration}">
          {{todo.text}}
        </span>
        <button @click="deleteTodo(todo.id)">x</button>
      </li>
    </ul>
  </div>`,
  computed:{
    ...mapState({
      todos: state => state.todo.todos.map(t=>{
        return {
          ...t,
          textDecoration: t.checked?'line-through':'unset'
        };
      })
    }),
    ...mapGetters(["newText"])
  },
  //methods: mapMutations(["checkTodo"])
  // paul no sabe ... 
  methods: {
    checkTodo(id,checked){
      this.$store.commit('checkTodo',{id,checked});
    },
    ...mapMutations(["newTodo","deleteTodo","changeNewText"])
  }
});
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// Calc
Vue.component('calc', {
  template: `
  <div>
    Calc
  </div>`  
});
////////////////////////////////////////////////////////////////////////////////


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
  getters: {
    isTodoTab: state => state.tab === TodoTab,
    isCalcTab: state => state.tab === CalcTab,
    isInvoiceTab: state => state.tab === InvoiceTab
  },
  mutations: {
    showTab(state,tab){
      state.tab = tab;
    },
    showTodos(){
      this.commit('showTab',TodoTab);
    },
    showCalc(){
      this.commit('showTab',CalcTab);
    },
    showInvoice(){
      this.commit('showTab',InvoiceTab);
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
    <todos v-if="isTodoTab"></todos>
    <calc v-if="isCalcTab"></calc>
    <invoice v-if="isInvoiceTab"></invoice>
  </div>
  `,
  computed: mapGetters(["isTodoTab","isCalcTab","isInvoiceTab"]),
  methods: mapMutations(["showTodos","showCalc","showInvoice"])
});

// setup

const store = new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',
  modules: {
    app: appStoreModule,
    todo: todoStoreModule
  }
});
new Vue({
  el: '#todoapp-vue',
  store
});
