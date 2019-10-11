module TodoApp exposing (..)

import Browser
import Html exposing (Html, button, div, text, ul, li, input,span, table, tr, td)
import Html.Attributes exposing (value,class, attribute, type_, checked, style)
import Html.Events as Events

-- Modelos

type Tab = TodoTab | CalcTab | InvoiceTab
type CalcOperation = Plus | Minus | Mult | Div | Enter | Clean | Noop

type alias Todo = { id: Int, text: String, checked: Bool }
type alias Item = { id: Int, text: String, price: Float, quantity: Int, enabled: Bool }


type alias CalcModel = { left : Maybe Float, right: Maybe Float, operation: CalcOperation, text: String }
type alias TodoModel = { todos: List Todo, new: Todo }
type Tax = TaxValue Float | TaxRate Float | NoTax
type alias ItemModel = { items: List Item,
                        newItem: Item,
                        tax: Tax }
type alias Model = {   
                        counter: Int,
                        todoModel : TodoModel,
                        itemModel: ItemModel,
                        calcModel: CalcModel,
                        tab: Tab
                    }

emptyTodo id = Todo id "" False
emptyItem id = Item id "" 0 0 False

firstTodos = [
        Todo 1 "Hola Mundo" False,
        Todo 2 "Cesar Arana" False,
        Todo 3 "Cesar Arana" False
    ]
firstItems = [
        Item 10 "CPU" 1000 2 True,
        Item 11 "RAM" 500 4 True
    ]

counter0 = 100 -- (List.foldl max 0 (List.map (\t -> t.id) firstTodos)) + 1

model0 : Model 
model0 = Model  (counter0)
                (TodoModel firstTodos (emptyTodo counter0))
                (ItemModel firstItems (emptyItem (counter0+1)) (TaxRate 0.19) )
                (CalcModel Nothing Nothing Noop "")
                InvoiceTab
-- Utils

changeItemsIn: ItemModel  -> List Item -> ItemModel
changeItemsIn model list =
    ItemModel  list model.newItem model.tax

changeTaxIn: ItemModel -> Tax -> ItemModel
changeTaxIn model tax =
    ItemModel  model.items model.newItem tax

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

reduceInvoice : ItemModel -> ( Float, Float, Float )
reduceInvoice itemModel =

    let
        itemTotal item = (toFloat item.quantity) * item.price
        itemValues = List.map itemTotal itemModel.items
        invoiceSubTotal = List.foldr (+) 0 itemValues
        tax = case itemModel.tax of
                TaxRate rate -> invoiceSubTotal * rate
                TaxValue val -> val
                NoTax -> 0

    in ( invoiceSubTotal , tax, invoiceSubTotal + tax )

-- Updates

type Action =
        AddTodo Todo
    |   CheckTodo Int Bool
    |   DeleteTodo Int
    |   UpdateNewTodo String

    |   CalculatorClick String

    |   ChangeItemPrice Int String -- mmm, debo hacerlo mejor, mas funcional
    |   ChangeItemQuantity Int String -- aqui estoy trayendo valoes del gui y deberian se valores ya procesados por composicion
    |   ChangeInvoiceTaxUI String 

    |   ChangeTab Tab
    |   IgnoreAction

checkTodo : Todo ->Bool -> Todo
checkTodo todo check  =
    if xor todo.checked check
    then { todo | checked = check }
    else todo

addTodo : Todo -> Model -> Model
addTodo todo model =
    let
        model1 = { model    | counter = model.counter + 1 }
        model2 = { model1   | todoModel = TodoModel (todo :: model1.todoModel.todos) (emptyTodo model1.counter) }
    in
        model2

processCalc : String -> CalcModel -> CalcModel
processCalc str model =
    model

update : Action -> Model -> Model
update msg model =
    case msg of 
        AddTodo todo -> 
            addTodo todo model
        UpdateNewTodo text ->
            let
                oldTodo = model.todoModel.new
                newTodo = { oldTodo | text = text }
            in
                { model | todoModel = TodoModel model.todoModel.todos newTodo }
        CheckTodo id check ->
            let
                process : Todo -> Todo
                process todo =
                    if todo.id == id then checkTodo todo check  else todo

                newTodos = List.map process model.todoModel.todos
            in 
                { model | todoModel = TodoModel newTodos model.todoModel.new }
        DeleteTodo id -> 
            { model | todoModel = TodoModel (List.filter (\t -> not (t.id == id) ) model.todoModel.todos) model.todoModel.new }


        CalculatorClick str ->
            { model | calcModel = processCalc str model.calcModel }

        ChangeItemPrice id string -> 
            let
                price = case String.toFloat string of 
                            Nothing -> 0
                            Just val -> val
                newItems = List.map 
                                (\i -> if i.id == id then Item i.id i.text price i.quantity i.enabled else i )
                                model.itemModel.items
                newItemModel = changeItemsIn model.itemModel newItems
            in
            { model | itemModel = newItemModel }

        ChangeItemQuantity id string -> 
            
            let
                quantity = case String.toInt string of 
                            Nothing -> 0
                            Just val -> val
                newItems = List.map 
                                (\i -> if i.id == id then Item i.id i.text i.price quantity i.enabled else i )
                                model.itemModel.items
                newItemModel = changeItemsIn model.itemModel newItems
            in
            { model | itemModel = newItemModel }

        ChangeInvoiceTaxUI str -> 

            let
                newItemModel = changeTaxIn model.itemModel (toTax str)
            in
                { model | itemModel = newItemModel }

        ChangeTab tab ->
            { model | tab = tab }

        IgnoreAction -> model
        

-- View

viewTodo : Todo -> Html Action
viewTodo todo =
    li  []
        [
            input   [ type_ "checkbox", checked todo.checked, Events.onCheck (CheckTodo todo.id )  ] []
            ,
            span    [ style "text-decoration" ( if todo.checked then "line-through" else "unset" ) ]
                    [ text todo.text ]
            ,
            button  [ Events.onClick (DeleteTodo todo.id)]
                    [ text "x"]
        ]

viewNewTodo : Todo -> Html Action
viewNewTodo newTodo =

    div []
        [
            input   [ value newTodo.text, Events.onInput  UpdateNewTodo ] []
            ,
            button  [ Events.onClick  (AddTodo newTodo) ] [ text "+" ]
        ]

viewTodoTab : TodoModel -> Html Action
viewTodoTab model =
    div []
        [
            viewNewTodo model.new
            ,
            ul [] (List.map viewTodo model.todos)
        ]



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

viewCalcTab model =
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

viewItem: Item -> Html Action
viewItem item =  
        tr [] [
            td [] [ text item.text ]
            , td [] [ input [ value (String.fromFloat item.price), Events.onInput  (ChangeItemPrice item.id)] []  ]
            , td [] [ input [ value (String.fromInt item.quantity), Events.onInput  (ChangeItemQuantity item.id)] []  ]
            , td [] [ text (String.fromFloat ((toFloat item.quantity) * item.price))]
        ]

viewInvoiceTab : ItemModel -> Html Action
viewInvoiceTab model =

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

            [   tr [] [
                    td [] [ text "Item" ]
                    , td [] [ text "Vlr Uni."]
                    , td [] [ text "Cant."]
                    , td [] [ text "Total"]
                ]
            ]
            ++
            List.map viewItem model.items
            ++
            [
                tr [] [
                    td [] [  ]
                    , td [] [ ]
                    , td [] [ text "Sub Total" ]
                    , td [] [ text  (String.fromFloat  subTotal ) ]
                ]
                ,
                tr [] [
                    td [] [  ]
                    , td [] [ text "Impuesto" ]
                    , td [] [ input [ value taxValue, Events.onInput ChangeInvoiceTaxUI ] [] ]
                    , td [] [ text  (String.fromFloat tax) ]
                ]
                ,
                tr [] [
                    td [] [  ]
                    , td [] [ ]
                    , td [] [ text "Total" ]
                    , td [] [ text  (String.fromFloat  total ) ]
                ]
            ]
        )


view : Model -> Html Action
view model =
    div [] [
        ul  []
            [
                li [] [ button [ Events.onClick (ChangeTab TodoTab)] [ text "Todo"] ]
                ,
                li [] [ button [ Events.onClick (ChangeTab CalcTab)] [ text "Calc"] ]
                ,
                li [] [ button [ Events.onClick (ChangeTab InvoiceTab)] [ text "Invoice"] ]
            ]
        ,
        case model.tab of
            TodoTab -> viewTodoTab model.todoModel
            CalcTab -> viewCalcTab model.calcModel
            InvoiceTab -> viewInvoiceTab model.itemModel
    ]
    


-- Main

main = Browser.sandbox {
        init = model0,
        view = view,
        update = update
    }
