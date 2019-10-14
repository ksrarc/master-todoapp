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

function CalcApp() {
  return (<div>calc</div>);
};
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
  todoModel
}));

function Root() {
  return (
    <Provider store={store}>
      <App />
    </Provider>
  );
}

export default Root;
