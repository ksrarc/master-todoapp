import Vue from 'vue/dist/vue.common.dev'
import Vuex, { mapState, mapGetters, mapMutations} from 'vuex'
import 'es6-promise/auto'
Vue.use(Vuex)
Vue.config.productionTip = false;

////////////////////////////////////////////////////////////////////////////////
// Todo
const todoStoreModule = {
  namespaced: true,
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
      state.newText = text;
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
      <li v-for="todo in todos">
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
    ...mapState("todo",{
      todos: state => state.todos.map(t=>{
        return {
          ...t,
          textDecoration: t.checked?'line-through':'unset'
        };
      })
    }),
    ...mapGetters("todo",["newText"])
  },
  methods: {
    checkTodo(id,checked){
      this.$store.commit('todo/checkTodo',{id,checked});
    },
    ...mapMutations("todo",["newTodo","deleteTodo","changeNewText"])
  }
});
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// Calc

const resolveOperation = (left, operation, input) => {
  let right = parseFloat(input);
  if ( !isNaN(right) && operation === "+" && !isNaN(left) ) return left + right;
  if ( !isNaN(right) && operation === "-" && !isNaN(left) ) return left - right;
  if ( !isNaN(right) && operation === "*" && !isNaN(left) ) return left * right;
  if ( !isNaN(right) && operation === "/" && !isNaN(left) ) return left / right;
  if ( !isNaN(right) && operation === "=" ) return right;
  if ( !isNaN(right) && left === null ) return right;
  return left;
};
Vue.component('vCb', {
  template:`
  <td :colspan="colspan" :rowspan="rowspan">
    <button @click="handleButton(b)">{{b}}</button>
  </td>`,
  props:['b'],
  computed: {
    colspan(){
      return this.b === '0'?"2":"1";
    },
    rowspan(){
      return ( this.b === "+" || this.b === "=" )?"2":"1";
    }
  },
  methods: mapMutations("calc",["handleButton"])
});
const calcStoreModule = {
  namespaced: true,
  state: {
    prev: null,
    input: '',
    operation: null
  },
  getters: {
    display(state){
      if ( state.input === "" && state.prev != null ) {
        return state.prev;
      }
      return state.input;
    }
  },
  mutations:{
    handleButton(state,b){
      if ( b === "C" ) {
        state.prev = null;
        state.input = '';
        state.operation = null;
      } else if ( b==="." ) {
        if ( state.input.indexOf(".") <= -1 )
          state.input += ".";
      } else if ( b.match(/\d/) ) {
        state.prev = state.operation == null ? null :  state.prev;
        if ( state.input === "" && state.prev == null ) state.input+= b;
        else if ( state.input === "" && state.prev != null ) state.input = b;
        else state.input+= b;
      } else if ( b ==='=') {
        state.prev = resolveOperation(state.prev,state.operation,state.input);
        state.input = '';
        state.operation = null;
      } else if ( b.match(/\+|-|\*|\//) ) {
        if ( state.prev == null ) {
          state.prev = parseFloat(state.input);
          state.input = '';
          state.operation = b;
        } else {
          state.input = '';
        state.operation = b;
        state.prev = resolveOperation(state.prev,state.operation,state.input);
        }
      }
    }
  }
};
Vue.component('calc', {
  template: `
  <div class="calc">
    <span>
      <input readonly=true :value="operation"/>
      <input readonly=true :value="display" />
    </span>
    <table>
      <tbody>
      <tr><vCb b="C"/><vCb b="/"/><vCb b="*"/><vCb b="-"/></tr>
      <tr><vCb b="7"/><vCb b="8"/><vCb b="9"/><vCb b="+"/></tr>
      <tr><vCb b="4"/><vCb b="5"/><vCb b="6"/></tr>
      <tr><vCb b="1"/><vCb b="2"/><vCb b="3"/><vCb b="="/></tr>
      <tr><vCb b="0"/><vCb b="."/></tr>
      </tbody>
    </table>
  </div>`,
  computed: {
    ...mapState("calc",["input","operation"]),
    ...mapGetters("calc",["display"])
  }
});
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// Invoice

const invoiceStoreModule = {
  namespaced: true,
  state: {
    items:[],
    counter:100,
    tax: {
      percent:true,
      val:0
    }
  },
  getters: {
    summary({items, tax}) {
      let nitems = items.map(item=>{return{
        ...item,
        total:(item.checked?item.quantity*item.price:0)
      }});
      let subtotal = nitems.reduce((sub,item)=>
        sub + item.total
      ,0);
      let taxValue = (tax.percent?(subtotal*tax.val/100):subtotal+tax.val);
      return {
        items: nitems,
        subtotal,
        taxValue,
        total: subtotal + taxValue
      };
    }
  },
  mutations: {
    addItem(state){
      state.items = [...state.items, {
        id:state.counter,
        text:"",
        price:0,
        quantity:0,
        checked: true
      }];
      state.counter +=1;
    },
    deleteItem(state,id) {
      state.items = state.items.filter(t => t.id !== id);
    },
    changeItemPrice(state,{id,price}){
      state.items = state.items.map(i=>i.id===id?{...i,price}:i);
    },
    changeItemQuantity(state,{id,quantity}){
      state.items = state.items.map(i=>i.id===id?{...i,quantity}:i);
    }
  }
};
Vue.component('invoice', {
  template: `
  <div class="invoice">
    <ul>
      <li>
        <span>Item</span>
        <span>Vlr U.</span>
        <span>Cantidad</span>
        <span>Total</span>
      </li>
      <li v-for="item in summary.items">
        <span>
          <button @click="deleteItem(item.id)">x</button>
          <input type="checkbox" />
        </span>
        <input :value="item.text"></input>
        <input :value="item.price" @change="changeItemPrice(item.id,$event.target.value)" />
        <input :value="item.quantity"  @change="changeItemQuantity(item.id,$event.target.value)" ></input>
        <span>{{item.total}}</span>
      </li>
    </ul>
    <div>
      <button @click="addItem">+</button>
    </div>
    <div>
      <span>Sub Total</span>
      <span>{{summary.subtotal}}</span>
    </div>
    <div>
      <span>Impuesto</span>
      <span><input ></input></span>
      <span>{{summary.taxValue}}</span>
    </div>
    <div>
      <span>Total</span>
      <span>{{summary.total}}</span>
    </div>
  </div>`,
  computed: {
    ...mapGetters("invoice",['summary'])
  },
  methods: {
    ...mapMutations("invoice",["addItem","deleteItem"]),
    changeItemPrice(id,price){
      this.$store.commit("invoice/changeItemPrice",{id,price:parseFloat(price)});
    },
    changeItemQuantity(id,quantity){
      this.$store.commit("invoice/changeItemQuantity",{id,quantity:parseFloat(quantity)});
    }
  }
});

////////////////////////////////////////////////////////////////////////////////

const TodoTab = 'TodoTab';
const CalcTab = 'CalcTab';
const InvoiceTab = 'InvoiceTab';

const appStoreModule = {
  state: {
    tab: InvoiceTab
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
    todo: todoStoreModule,
    calc: calcStoreModule,
    invoice: invoiceStoreModule
  }
});
new Vue({
  el: '#todoapp-vue',
  store
});
