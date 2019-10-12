module TodoApp exposing (..)

import Browser
import Html exposing (Html, button, div, text, ul, li, input,span, table, tr, td, th)
import Html.Attributes exposing (value,class, attribute, type_, checked, style)
import Html.Events as Events

--------------------------------------------------------------------------------
-- Begin Todos

type alias Todo = { id: Int,
                    text: String,
                    checked: Bool }
type alias TodoModel = {    counter: Int,
                            todos: List Todo,
                            new: Todo }

emptyTodo id = Todo id "" False
firstTodos = [
        Todo 1 "Hola Mundo" False,
        Todo 2 "Cesar Arana" False,
        Todo 3 "Cesar Arana" False
    ]

type TodoAction =   AddTodo Todo
                |   CheckTodo Int Bool
                |   DeleteTodo Int
                |   UpdateNewTodo String

checkTodo : Todo -> Bool -> Todo
checkTodo todo check  =
    if xor todo.checked check
    then { todo | checked = check }
    else todo

updateTodoModel : TodoAction -> TodoModel -> TodoModel
updateTodoModel action model  =
    case action of
        AddTodo todo ->
            let counter = (model.counter + 1) in
            TodoModel counter
                      (model.new :: model.todos)
                      (emptyTodo counter)

        UpdateNewTodo text ->
            TodoModel model.counter
                      model.todos
                      (Todo model.new.id text model.new.checked)

        CheckTodo id check ->

            let 
                process : Todo -> Todo
                process todo =  if todo.id == id
                                then checkTodo todo check
                                else todo
                filtered = List.map process model.todos
            in 
                TodoModel   model.counter
                            filtered
                            model.new

        DeleteTodo id ->
            let 
                filtered = List.filter (\t -> t.id /= id ) model.todos
            in 
                TodoModel   model.counter
                            filtered
                            model.new

viewTodo : Todo -> Html TodoAction
viewTodo todo =
    li  []
        [
            input   [   type_ "checkbox",
                        checked todo.checked,
                        Events.onCheck (CheckTodo todo.id)  ]
                    []
            ,
            span    [ style "text-decoration"
                            (   if todo.checked
                                then "line-through"
                                else "unset" ) ]
                    [ text todo.text ]
            ,
            button  [ Events.onClick (DeleteTodo todo.id)]
                    [ text "x"]
        ]

viewNewTodo : Todo -> Html TodoAction
viewNewTodo newTodo =
    div []
        [
            input   [ value newTodo.text, Events.onInput  UpdateNewTodo ] []
            ,
            button  [ Events.onClick  (AddTodo newTodo) ] [ text "+" ]
        ]

viewTodoModel : TodoModel -> Html TodoAction
viewTodoModel model =
    div []
        [
            viewNewTodo model.new
            ,
            ul [] (List.map viewTodo model.todos)
        ]
-- End Todos -- 
--------------------------------------------------------------------------------

--------------------------------------------------------------------------------
-- Begin Calc
type CalcOperation = Plus | Minus | Mult | Div | Enter | Clean | Noop
type alias CalcModel = { left : Maybe Float,
                         right: Maybe Float,
                         operation: CalcOperation,
                         text: String }

processCalc : String -> CalcModel -> CalcModel
processCalc str model =
    model

viewCalcButton :  CalcModel -> String -> Html Action
viewCalcButton calc str =
    let
        userstring = case str of
            "div" -> "/"
            "mult" -> "*"
            "minus" -> "-"
            "plus" -> "+"
            "enter" -> "="
            "dot" -> "."
            _ -> str
        colspan = case str of
            "0" -> "2"
            "dot" -> "2"
            _ -> "1"
        rowspan = case str of
            "plus" -> "2"
            "enter" -> "2"
            _ -> "1"
    in
        td  [ class ("calc-button " ++ str), attribute "colspan" colspan, attribute "rowspan" rowspan ]
            [ button [] [ text userstring ] ]

viewCalcModel : CalcModel -> Html Action
viewCalcModel model =
    let
        vCalcB = viewCalcButton model
    in
    div []
        [
            input [ attribute "readonly" "" ] []
            ,
            table   []
                    [
                        tr [] [
                            vCalcB "C", vCalcB "div", vCalcB "mult", vCalcB "minus"
                        ],
                        tr [] [
                            vCalcB "7", vCalcB "8", vCalcB "9", vCalcB "plus"
                        ],
                        tr [] [
                            vCalcB "4", vCalcB "5", vCalcB "6"
                        ],
                        tr [] [
                            vCalcB "1", vCalcB "2", vCalcB "3", vCalcB "enter"
                        ],
                        tr [] [
                            vCalcB "0", vCalcB "dot"
                        ]
                    ]
        ]

-- End Calc
--------------------------------------------------------------------------------

--------------------------------------------------------------------------------
-- Begin Invoice
type alias Item = { id: Int,
                    text: String,
                    price: Float, 
                    quantity: Int, 
                    enabled: Bool }
type Tax = TaxValue Float | TaxRate Float | NoTax
type alias InvoiceModel = { counter: Int,
                            items: List Item,
                            tax: Tax }

type InvoiceAction =
        ChangeItemPrice Int String -- mmm, debo hacerlo mejor, mas funcional
    |   ChangeItemQuantity Int String -- aqui estoy trayendo valoes del gui y deberian se valores ya procesados por composicion
    |   ChangeItemText Int String
    |   CheckItem Int Bool
    |   DeleteItem Int
    |   ChangeInvoiceTaxUI String 
    |   AddNewItem

emptyItem id = Item id "" 0 0 True
firstItems = [
        Item 10 "CPU" 1000 2 True,
        Item 11 "RAM" 500 4 True
    ]

changeItemsIn: InvoiceModel  -> List Item -> InvoiceModel
changeItemsIn model list =
    InvoiceModel  model.counter list model.tax

changeTaxIn: InvoiceModel -> Tax -> InvoiceModel
changeTaxIn model tax =
    InvoiceModel model.counter  model.items tax

toTax : String -> Tax
toTax string =
    let
        trimmed = String.trim string
        cleaned = String.replace "%" "" trimmed
        value = case String.toFloat cleaned of
                    Nothing -> 0
                    Just v -> v
    in
        case trimmed of
            "" -> NoTax
            _ ->
                if      String.endsWith "%" trimmed
                then    TaxRate (value / 100.0)
                else    TaxValue value

reduceInvoice : InvoiceModel -> ( Float, Float, Float )
reduceInvoice invoice =
    let
        itemTotal item = if item.enabled then (toFloat item.quantity) * item.price else 0
        itemValues = List.map itemTotal invoice.items
        invoiceSubTotal = List.foldr (+) 0 itemValues
        tax = case invoice.tax of
                TaxRate rate -> invoiceSubTotal * rate
                TaxValue val -> val
                NoTax -> 0

    in ( invoiceSubTotal , tax, invoiceSubTotal + tax )

updateInvoiceModel : InvoiceAction -> InvoiceModel -> InvoiceModel
updateInvoiceModel action invoiceModel =
    case action of 
        DeleteItem  id -> 
            let
                newItems = List.filter
                                (\i -> i.id /= id )
                                invoiceModel.items
                
            in
            changeItemsIn invoiceModel newItems
        CheckItem  id checked  -> 
            let
                newItems = List.map 
                                (\i -> if i.id == id then Item i.id i.text i.price i.quantity checked else i )
                                invoiceModel.items
                
            in
            changeItemsIn invoiceModel newItems
        ChangeItemText  id text -> 
            let
                newItems = List.map 
                                (\i -> if i.id == id then Item i.id text i.price i.quantity i.enabled else i )
                                invoiceModel.items
                
            in
            changeItemsIn invoiceModel newItems

        ChangeItemPrice  id string -> 
            let
                price = case String.toFloat string of 
                            Nothing -> 0
                            Just val -> val
                newItems = List.map 
                                (\i -> if i.id == id then Item i.id i.text price i.quantity i.enabled else i )
                                invoiceModel.items
                
            in
            changeItemsIn invoiceModel newItems

        ChangeItemQuantity id string -> 
            
            let
                quantity = case String.toInt string of 
                            Nothing -> 0
                            Just val -> val
                newItems = List.map 
                                (\i -> if i.id == id then Item i.id i.text i.price quantity i.enabled else i )
                                invoiceModel.items
            in
                changeItemsIn invoiceModel newItems

        ChangeInvoiceTaxUI str -> 
            changeTaxIn invoiceModel (toTax str)
        AddNewItem ->
            let
                counter = invoiceModel.counter + 1
                items = List.append invoiceModel.items [ emptyItem counter ]
                invoiceModel2 = { invoiceModel | counter = counter }
            in
                { invoiceModel2 | items = items }




viewInvoiceItem: Item -> Html InvoiceAction
viewInvoiceItem item =  
    let
        total = if item.enabled
                    then ((toFloat item.quantity) * item.price)
                    else 0

    in
    tr [] [
          td [] [ button [  Events.onClick  (DeleteItem item.id) ]
                            [text "-"]  ]
        , td [] [ input [   Html.Attributes.checked item.enabled, Html.Attributes.type_ "checkbox",
                            Events.onCheck  (CheckItem item.id) ]
                        []  ]
        , td [] [ input [   value item.text,
                            Events.onInput  (ChangeItemText item.id) ]
                        []  ]
        , td [] [ input [   value (String.fromFloat item.price),
                            Events.onInput  (ChangeItemPrice item.id) ]
                        [] 
                ]
        , td [] [ input [   value (String.fromInt item.quantity),
                            Events.onInput  (ChangeItemQuantity item.id)]
                        []
                ]
        , td [] [ text (String.fromFloat total)]
    ]
    

viewInvoiceModel : InvoiceModel -> Html InvoiceAction
viewInvoiceModel model =
    
        viewInvoiceModelTable model
    

viewInvoiceModelTableHeader =
    tr [] [
            th [] [ ], th [] [],
        th [] [ text "Item" ]
        , th [] [ text "Vlr Uni."]
        , th [] [ text "Cant."]
        , th [] [ text "Total"]
    ]

viewInvoiceModelTable : InvoiceModel -> Html InvoiceAction
viewInvoiceModelTable model =

    let
        ( subTotal, tax, total ) = reduceInvoice model
        taxValue =
            case      model.tax of
            TaxRate rate ->   (String.fromFloat (rate*100)) ++ " %"
            TaxValue val ->    String.fromFloat val
            NoTax -> ""

    in

    table []
        
        (
            [   
                viewInvoiceModelTableHeader
            ]
            ++
            List.map viewInvoiceItem model.items
            ++
            [
                tr [] [
                    td [] [ button [ Events.onClick AddNewItem ] [ text "+"] ]
                ]
                ,
                tr [] [
                    td [] [  ],td [] [  ],td [] [  ]
                    , td [] [ ]
                    , td [] [ text "Sub Total" ]
                    , td [] [ text  (String.fromFloat  subTotal ) ]
                ]
                ,
                tr [] [
                    td [] [  ],td [] [  ],td [] [  ]
                    , td [] [ text "Impuesto" ]
                    , td [] [ input [   value taxValue,
                                        Events.onInput ChangeInvoiceTaxUI ] [] ]
                    , td [] [ text  (String.fromFloat tax) ]
                ]
                ,
                tr [] [
                    td [] [  ],td [] [  ],td [] [  ]

                    , td [] [ ]
                    , td [] [ text "Total" ]
                    , td [] [ text  (String.fromFloat  total ) ]
                ]
            ]
        )


-- End Invoice
--------------------------------------------------------------------------------

--------------------------------------------------------------------------------
-- Begin App
type Tab = TodoTab | CalcTab | InvoiceTab
type alias Model = {    todoModel: TodoModel,
                        invoiceModel: InvoiceModel,
                        calcModel: CalcModel,
                        tab: Tab }

type Action =
        MainTodoAction TodoAction

    |   CalculatorClick String
    |   MainInvoiceAction InvoiceAction
    |   ChangeTab Tab

model0 : Model 
model0 = Model  (TodoModel  100 firstTodos (emptyTodo 100))
                (InvoiceModel 100 firstItems (TaxRate 0.19) )
                (CalcModel Nothing Nothing Noop "")
                InvoiceTab

-- End App
--------------------------------------------------------------------------------

--------------------------------------------------------------------------------
-- Main

update : Action -> Model -> Model
update msg model =
    case msg of 
        
        MainTodoAction action ->
            { model | todoModel = updateTodoModel action model.todoModel  }
            
        CalculatorClick str ->
            { model | calcModel = processCalc str model.calcModel }

        MainInvoiceAction action ->
            { model | invoiceModel = updateInvoiceModel action model.invoiceModel }

        ChangeTab tab ->
            { model | tab = tab }

view : Model -> Html Action
view model =
    div [] [
        ul  []
            [
                li [] [ button  [ Events.onClick (ChangeTab TodoTab)]
                                [ text "Todo"] ]
                ,
                li [] [ button  [ Events.onClick (ChangeTab CalcTab)]
                                [ text "Calc"] ]
                ,
                li [] [ button  [ Events.onClick (ChangeTab InvoiceTab)]
                                [ text "Invoice"] ]
            ]
        ,
        case model.tab of
            TodoTab -> Html.map MainTodoAction (viewTodoModel model.todoModel)
            CalcTab -> viewCalcModel model.calcModel
            InvoiceTab -> Html.map  MainInvoiceAction
                                    (viewInvoiceModel model.invoiceModel)
    ]

main = Browser.sandbox {
        init = model0,
        view = view,
        update = update
    }

-- End Main
--------------------------------------------------------------------------------



