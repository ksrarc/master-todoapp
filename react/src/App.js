import React from 'react';
import { Provider, connect } from 'react-redux';
import { combineReducers,createStore } from 'redux'

//------------------------------------------------------------------------------
// Todo App

const AddTodo = 'AddTodo';
const CheckTodo = 'CheckTodo';
const DeleteTodo = 'DeleteTodo';
const UpdateNewTodo = 'UpdateNewTodo';

const TodoApp = connect(
  (state) => { return {
    // se pasa el estado inicial, desde la raiz.
    todos: state.todoModel.todos,
    newText: state.todoModel.newText
  }},
  (dispatch) => {return {
    addTodo: () => dispatch({type: AddTodo}),
    checkTodo: (id,checked) => dispatch({type: CheckTodo, id, checked}),
    deleteTodo: (id) => dispatch({type: DeleteTodo, id}),
    updateNewTodo: (text)=>dispatch({type:UpdateNewTodo,text})
  }}
)(({todos, newText, addTodo,checkTodo,deleteTodo,updateNewTodo})=>{
  //console.info(todos, newText, addTodo,checkTodo,deleteTodo,updateNewTodo);
  let lis = todos.map(({id,text,checked},k) =>
  <li key={k}>
    <input  type="checkbox"
            checked={checked}
            onChange={(e)=>checkTodo(id,e.target.checked)}>
    </input>
    <span   style={{'textDecoration': checked ? 'line-through':'unset'}}>
      {text}
    </span>
    <button onClick={()=>deleteTodo(id)}>x</button>
  </li>);
  return (
  <div className="todo">
    <div>
      <input  value={newText}
              onChange={(e)=>updateNewTodo(e.target.value)}>
      </input>
      <button onClick={addTodo}>+</button>
    </div>
    <ul>
      {lis}
    </ul>
  </div>
  );
});
// updateFunction
const todoModel = (state ={todos:[],newText:"", counter: 0},{type, id, checked,text}) => {
    if ( type === AddTodo ) {
      return {
        todos: [...state.todos, {id: state.counter, text: state.newText, checked: false}],
        newText:"",
        counter: state.counter+1
      }
    }
    if ( type === CheckTodo ) {
      return {
        ...state,
        todos: state.todos.map( (todo) => ( id === todo.id )? { ...todo, checked } : todo )
      }
    }
    if ( type === DeleteTodo ) {
      return {
        ...state,
        todos: state.todos.filter( (todo) => id !== todo.id )
      }
    }
    if ( type === UpdateNewTodo ) {
      return {
        ...state,
        newText: text
      }
    }
    return state;
  };

//------------------------------------------------------------------------------
// Calc App

const CalcClear = 'CalcClear';
const CalcDot = 'CalcDot';
const CalcEnter = 'CalcEnter';
const CalcOper = 'CalcOper';
const CalcNumber = 'CalcNumber';
const numberSet = new Set(["0","1","2","3","4","5","6","7","8","9"]);
const operSet = new Set(["+","-","*","/"]);

const resolveOperation = (left, operation, input) => {
  let right = parseFloat(input);
  console.warn(left, operation, input, right);
  if ( !isNaN(right) && operation === "+" && !isNaN(left) ) return left + right;
  if ( !isNaN(right) && operation === "-" && !isNaN(left) ) return left - right;
  if ( !isNaN(right) && operation === "*" && !isNaN(left) ) return left * right;
  if ( !isNaN(right) && operation === "/" && !isNaN(left) ) return left / right;
  if ( !isNaN(right) && operation === "=" ) return right;
  if ( !isNaN(right) && left === null ) return right;
  return left;
};

const viewCalcButton = (calcClear,
                        calcNumber,
                        calcDot,
                        calcEnter,
                        calcOper,
                        str) => {
  let colspan = "1";
  if ( str === "0" ) colspan = "2";
  let rowspan = "1";
  if ( str === "+" || str === "=" ) rowspan = "2";
  let onClick = () => {};
  if ( str === "C" ) onClick = calcClear;
  if ( numberSet.has(str) ) onClick = () => calcNumber(str);
  if ( str === ".") onClick = calcDot;
  if ( str === "=") onClick = calcEnter;
  if ( operSet.has(str)) onClick = () => calcOper(str);

  return (
    <td rowSpan={rowspan} colSpan={colspan}>
      <button onClick={onClick}>{str}</button>
    </td>
  );
};

const CalcApp = connect(
  (state) => {return{
    prev: state.calcModel.prev,
    input: state.calcModel.input,
    operation: state.calcModel.operation
  }},
  (dispatch) => {return{
    calcClear: () => dispatch({type:CalcClear}),
    calcNumber: (str) => dispatch({type:CalcNumber, str}),
    calcDot: () => dispatch({type:CalcDot}),
    calcEnter: () => dispatch({type:CalcEnter}),
    calcOper: (oper) => dispatch({type:CalcOper, oper})
  }}
)(({prev,input,operation,calcClear,calcNumber, calcDot, calcEnter, calcOper})=>{
  let display = input === "" && prev != null ? prev : input ;
  let vCb = (str) => viewCalcButton(calcClear,
                                    calcNumber,
                                    calcDot,
                                    calcEnter,
                                    calcOper,
                                    str);
  return (
    <div className="calc">
      <span>
        <input readOnly={true} value={operation==null?"":operation}></input>
        <input readOnly={true} value={display}></input>
      </span>
      <table>
        <tbody>
        <tr>{vCb("C")}{vCb("/")}{vCb("*")}{vCb("-")}</tr>
        <tr>{vCb("7")}{vCb("8")}{vCb("9")}{vCb("+")}</tr>
        <tr>{vCb("4")}{vCb("5")}{vCb("6")}</tr>
        <tr>{vCb("1")}{vCb("2")}{vCb("3")}{vCb("=")}</tr>
        <tr>{vCb("0")}{vCb(".")}</tr>
        </tbody>
      </table>
    </div>
  );
});
const calcModel = (state = {prev: null, input:"", operation:null}, {type, str,oper}) => {
  let { prev, input, operation} = state;
  if ( type===CalcClear ) {
    return {
      prev: null,
      input: "",
      operation: null
    };
  }
  if ( type === CalcNumber) {
    let nprev = operation == null ? null: prev;
    let text = "";
    if ( input === "" && prev == null ) text = input + str;
    if ( input === "" && prev != null ) text = str;
    else text = input + str;
    return {
      prev: nprev,
      input: text,
      operation
    }
  }
  if ( type === CalcDot ) {
    let text = input.indexOf(".") > -1 ? input : input + ".";
    return {
      ...state,
      input: text
    }
  }
  if ( type === CalcEnter ){
    let result = resolveOperation(prev, operation, input);
    return {
      prev: result,
      input: "",
      operation: null
    }
  }
  if ( type === CalcOper ) {
    if ( prev == null ) {
      return {
        operation: oper,
        prev: parseFloat(input),
        input: ""
      };
    } else {
      let result = resolveOperation(prev,operation, input);
      return {
        prev: result,
        input: "",
        operation: oper
      }
    }
  }
  return state;
};

//------------------------------------------------------------------------------
// Invoice App

const AddNewItem = 'AddNewItem';
const DeleteItem = 'DeleteItem';
const CheckItem = 'CheckItem';
const ChangeItemText = 'ChangeItemText';
const ChangeItemPrice = 'ChangeItemPrice';
const ChangeItemQuantity = 'ChangeItemQuantity';
const ChangeInvoiceTaxUI = 'ChangeInvoiceTaxUI';

const viewInvoiceItem = (items,dispatchers) => {
  let {
    deleteItem,
    checkItem,
    changeItemText,
    changeItemPrice,
    changeItemQuantity
  } = dispatchers;
  return (
    <>
      {items.map((item)=>{
        let total = item.checked ? item.quantity * item.price : 0;
        return (<li key={item.id}>
          <span>
            <button onClick={()=>deleteItem(item.id)}>x</button>
            <input checked={item.checked} type="checkbox" onChange={(e)=>checkItem(item.id,e.target.checked)}></input>
          </span>
          <input value={item.text} onChange={(e)=>changeItemText(item.id,e.target.value)}></input>
          <input value={item.price} onChange={(e)=>changeItemPrice(item.id,e.target.value)}></input>
          <input value={item.quantity} onChange={(e)=>changeItemQuantity(item.id,e.target.value)}></input>
          <span>{total}</span>
        </li>)
      }
      )}
    </>
  );
};

const InvoiceApp = connect(
  (state) => {return {
    items: state.invoiceModel.items,
    tax: state.invoiceModel.tax
  }},
  (dispatch) => {return{
    dispatchers: {
      // como son muchos los encapsulo en un object para simplicar la firma.
      // esto acosta de perder legibilidad.
      addNewItem: () => dispatch({type:AddNewItem}),
      deleteItem: (id) => dispatch({type:DeleteItem,id}),
      checkItem: (id,checked)=>dispatch({type:CheckItem,id,checked}),
      changeItemText: (id,text)=>dispatch({type:ChangeItemText,id,text}),
      changeItemPrice: (id,price)=>dispatch({type:ChangeItemPrice,id,price}),
      changeItemQuantity: (id,quantity)=>dispatch({type:ChangeItemQuantity,id,quantity}),
      changeTax: (tax) => dispatch({type:ChangeInvoiceTaxUI,tax})
    }
  }}
)(({items,tax,dispatchers}) => {
  let ritems = viewInvoiceItem(items,dispatchers);
  let vtax = tax.val + (tax.percent?" %":"");
  let changeTax = dispatchers.changeTax;

  let subtotal = items.reduce((sub,item)=>
    sub + (item.checked?item.quantity*item.price:0)
  ,0);
  let taxValue = (tax.percent?(subtotal*tax.val/100):subtotal+tax.val);
  let total = subtotal + taxValue;

  return (
    <div className="invoice">
      <ul>
        <li>
          <span>Item</span>
          <span>Vlr U.</span>
          <span>Cantidad</span>
          <span>Total</span>
        </li>
        { ritems }
      </ul>
      <div>
        <button onClick={dispatchers.addNewItem}>+</button>
      </div>
      <div>
        <span>Sub Total</span>
        <span>{subtotal}</span>
      </div>
      <div>
        <span>Impuesto</span>
        <span><input value={vtax} onChange={(e)=>changeTax(e.target.value)}></input></span>
        <span>{taxValue}</span>
      </div>
      <div>
        <span>Total</span>
        <span>{total}</span>
      </div>
    </div>
  );
});

const _items = [
  {id: 1, text: "CPU", price: 200, quantity: 3, checked: true}
];

const invoiceModel = (state={ items:_items, counter:100, tax: {percent:true, val:0} },
                      {type, id, checked, text, price, quantity, tax}) => {
  let { items, counter } = state;
  if ( type === AddNewItem ) {
    let ncounter = counter +1;
    return {
      ...state,
      items: [...items, {id:ncounter, text:"", price:0, quantity:0, checked: true}],
      counter: ncounter,
      tax: { val: 0, percent: true }
    };
  }
  if ( type === DeleteItem ) {
    return {
      ...state,
      items: items.filter(i=>i.id!==id)
    };
  }
  if ( type === CheckItem ) {
    return {
      ...state,
      items: items.map(i=>i.id!==id?i:{...i,checked})
    };
  }
  if ( type === ChangeItemText ) {
    return {
      ...state,
      items: items.map(i=>i.id!==id?i:{...i,text})
    };
  }
  if ( type === ChangeItemPrice ) {
    let np = parseFloat(price);
    if ( isNaN(np) ) return state;
    return {
      ...state,
      items: items.map(i=>i.id!==id?i:{...i,price:np})
    };
  }
  if ( type === ChangeItemQuantity ) {
    let nq = parseFloat(quantity);
    if ( isNaN(nq) ) return state;
    return {
      ...state,
      items: items.map(i=>i.id!==id?i:{...i,quantity:nq})
    };
  }
  if ( type === ChangeInvoiceTaxUI ) {
    let percent = tax.indexOf("%") > -1;
    let val = parseFloat(tax.replace(/%/g,""));
    console.warn(percent,val);
    if ( isNaN(val) ) val = 0;
    return {
      ...state,
      tax: {
        percent,
        val
      }
    };
  }
  return state;
};

//------------------------------------------------------------------------------
// Main App

const TodoTab = "TodoTab";
const CalcTab = "CalcTab";
const InvoiceTab = "InvoiceTab";

const App = connect(
  // mapStateToProps
  (state) => {return {
    tab: state.tab
  }},
  // mapDispatchToProps
  (dispatch) => {return {
    showTodo: () => dispatch({type:TodoTab}),
    showCalc: () => dispatch({type:CalcTab}),
    showInvoice: () => dispatch({type:InvoiceTab})
  }}
)(({tab,showTodo,showCalc,showInvoice})=>{

  let cmp = null;
  if ( tab === TodoTab ) cmp = <TodoApp />;
  if ( tab === CalcTab ) cmp = <CalcApp />;
  if ( tab === InvoiceTab ) cmp = <InvoiceApp />;
  return (
    <div>
      <ul>
        <li><button onClick={showTodo}>Todo</button></li>
        <li><button onClick={showCalc}>Calc</button></li>
        <li><button onClick={showInvoice}>Invoice</button></li>
      </ul>
      { cmp }
    </div>
  );
});
// Modelo inicial
const store = createStore(combineReducers({
  tab: (state = InvoiceTab,{type}) => {
    if ( type === TodoTab ) return type;
    if ( type === CalcTab ) return type;
    if ( type === InvoiceTab ) return type;
    return state;
  },
  todoModel,
  calcModel,
  invoiceModel
}));

function Root() {
  return (
    <Provider store={store}>
      <App />
    </Provider>
  );
}

export default Root;
