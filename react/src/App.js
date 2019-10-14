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
  console.warn("r",prev, input);
  let display = input == "" && prev != null ? prev : input ;
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
function InvoiceApp (){
  return (<div>invoice</div>);
}

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
  tab: (state = TodoTab,{type}) => {
    if ( type === TodoTab ) return type;
    if ( type === CalcTab ) return type;
    if ( type === InvoiceTab ) return type;
    return state;
  },
  todoModel,
  calcModel
}));

function Root() {
  return (
    <Provider store={store}>
      <App />
    </Provider>
  );
}

export default Root;
