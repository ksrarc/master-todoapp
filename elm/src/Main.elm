module TodoApp exposing (..)

import Browser
import Html exposing (Html, button, div, text, ul, li, input,span, table, tr, td, th)
import Html.Attributes exposing (value,class, attribute, type_, checked, style)
import Html.Events as Events

--------------------------------------------------------------------------------
-- Begin Todos
--
type alias Todo = { id: Int,
                    text: String,
                    checked: Bool }
type alias TodoModel = {    counter: Int,
                            todos: List Todo,
                            newText: String }

emptyTodo id = Todo id "" False
firstTodos = [
        Todo 1 "Hola Mundo" False,
        Todo 2 "Cesar Arana" False,
        Todo 3 "Cesar Arana" False
    ]

type TodoAction =   AddTodo
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
        AddTodo ->
            let counter = (model.counter + 1) in
            TodoModel counter
                      (Todo counter model.newText False :: model.todos)
                      ""

        UpdateNewTodo text ->
            TodoModel model.counter
                      model.todos
                      text

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
                            model.newText

        DeleteTodo id ->
            let 
                filtered = List.filter (\t -> t.id /= id ) model.todos
            in 
                TodoModel   model.counter
                            filtered
                            model.newText

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

viewNewTodo : String -> Html TodoAction
viewNewTodo string =
    div []
        [
            input   [ value string, Events.onInput  UpdateNewTodo ] []
            ,
            button  [ Events.onClick AddTodo ] [ text "+" ]
        ]

viewTodoModel : TodoModel -> Html TodoAction
viewTodoModel model =
    div [ class "todo"]
        [
            viewNewTodo model.newText
            ,
            ul [] (List.map viewTodo model.todos)
        ]
-- End Todos -- 
--------------------------------------------------------------------------------

--------------------------------------------------------------------------------
-- Begin Calc
type CalcOperation = Plus | Minus | Mult | Div | Enter
type alias CalcModel = { prev : Maybe Float,
                         input: String,
                         operation: Maybe CalcOperation }
type CalcAction = CalcClear
                | CalcDot
                | CalcEnter
                | CalcOper CalcOperation
                | CalcNumber Int

resolveOperation : Maybe Float ->  Maybe CalcOperation -> String -> Maybe Float
resolveOperation prev oper str =
    let convert = String.toFloat str
    in case ( convert, oper, prev ) of
        ( Just right, Just Plus, Just left ) -> Just <| left + right
        ( Just right, Just Minus, Just left ) -> Just <| left - right
        ( Just right, Just Mult, Just left ) -> Just <| left * right
        ( Just right, Just Div, Just left ) -> Just <| left / right
        ( Just right, Just Enter, Just left ) -> Just <| right
        ( Just right, _, Nothing ) -> Just <| right
        _ ->  prev

o2s : Maybe CalcOperation -> String
o2s oper =
    case oper of
    (Just Plus) -> " +"
    (Just Minus) -> " -"
    (Just Div) -> " /"
    (Just Mult) -> " *"
    _ -> ""

processCalc : CalcAction -> CalcModel -> CalcModel
processCalc action model =
    case ( action, model ) of 

    ( CalcClear, { input, operation } ) -> 
        CalcModel Nothing "" Nothing
        {- case operation of
            Just _ -> { model | operation = Nothing }
            _ -> { model | input = String.slice 0 -1 input } 
            -}

    ( CalcNumber n, { input, prev, operation } ) ->
        let
            text = case (input,prev) of
                    ("",Nothing) -> input ++ String.fromInt n
                    ("",Just op) -> String.fromInt n
                    (_,_) -> input ++ String.fromInt n
            nprev = case operation of
                Nothing -> Nothing
                _ -> prev
        in
            CalcModel nprev text model.operation

    ( CalcDot, { input } ) ->
        let
            text = if String.contains "." input
                    then input
                    else input ++ "."
        in
            CalcModel model.prev text model.operation

    ( CalcOper op, { prev, input, operation } ) ->
        case (prev) of
        (Nothing) -> CalcModel (String.toFloat input) "" <| Just op
        (Just _) ->
            let
                result = resolveOperation prev operation input
            in
                CalcModel  result "" (Just op)

    (CalcEnter, {prev,operation,input} ) ->
        let
            result = resolveOperation prev operation input
        in
            CalcModel  result "" Nothing


viewCalcButton : String -> Html CalcAction
viewCalcButton str =
    let
        colspan = case str of
            "0" -> "2"
            _ -> "1"
        rowspan = case str of
            "+" -> "2"
            "=" -> "2"
            _ -> "1"
        action = case str of 
            "C" -> CalcClear
            "/" -> CalcOper Div
            "*" -> CalcOper Mult
            "-" -> CalcOper Minus
            "+" -> CalcOper Plus
            "=" -> CalcEnter
            "." -> CalcDot
            _ -> CalcNumber <| case String.toInt str of
                                    Just n -> n
                                    _ -> 0
    in
        td  [ attribute "colspan" colspan,
              attribute "rowspan" rowspan ]
            [ button [ Events.onClick action] [ text str ] ]

viewCalcModel : CalcModel -> Html CalcAction
viewCalcModel model =
    let
        vCb = viewCalcButton
        display = case (model.input,model.prev) of
                    ("", Just v) -> String.fromFloat v
                    (i,_) -> i
    in
    div [ class "calc"] [
        span [] [
            input [ attribute "readonly" "",
                value  <| o2s model.operation  ] [],
            input [ attribute "readonly" "",
                value  display  ] []
        ]
        ,
        table [] [
            tr [] [
                vCb "C", vCb "/", vCb "*", vCb "-"
            ],
            tr [] [
                vCb "7", vCb "8", vCb "9", vCb "+"
            ],
            tr [] [
                vCb "4", vCb "5", vCb "6"
            ],
            tr [] [
                vCb "1", vCb "2", vCb "3", vCb "="
            ],
            tr [] [
                vCb "0", vCb "."
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
    li [] [
        span [] [ button [  Events.onClick  (DeleteItem item.id) ] [text "-"]
                , input [   Html.Attributes.checked item.enabled,
                            Html.Attributes.type_ "checkbox",
                            Events.onCheck  (CheckItem item.id) ] []
            ]
        , input [   value item.text,
                    Events.onInput  (ChangeItemText item.id) ] []
          
        , input [   value (String.fromFloat item.price),
                            Events.onInput  (ChangeItemPrice item.id) ] [] 
        , input [   value (String.fromInt item.quantity),
                            Events.onInput  (ChangeItemQuantity item.id)] []
        , span [] [ text (String.fromFloat total)]
    ]
    

viewInvoiceModel : InvoiceModel -> Html InvoiceAction
viewInvoiceModel model =
    let
        ( subTotal, tax, total ) = reduceInvoice model
        taxValue =
            case      model.tax of
            TaxRate rate ->   (String.fromFloat (rate*100)) ++ " %"
            TaxValue val ->    String.fromFloat val
            NoTax -> ""

    in
    div [ class "invoice" ] [
        viewInvoiceModelTable model,
        div [] [
            button [ Events.onClick AddNewItem ] [ text "+"]
        ],
        div [] [
            span [] [ text "Sub Total" ],
            span [] [ text  (String.fromFloat  subTotal ) ]
        ],
        div [] [
            span [] [ text "Impuesto" ],
            span [] [ input [   value taxValue,
                                Events.onInput ChangeInvoiceTaxUI ] [] ],
            span [] [ text  (String.fromFloat tax) ]
        ]
        ,
        div [] [
            span [] [ text "Total" ],
            span [] [ text  (String.fromFloat  total ) ]
        ]
    ]

viewInvoiceModelTable : InvoiceModel -> Html InvoiceAction
viewInvoiceModelTable model =

    ul [] <|
        li [] [
            span [][ text "Item"],
            span [][ text "Vlr U."],
            span [][ text "Cantidad"],
            span [][ text "Total"]
        ]
        :: List.map viewInvoiceItem model.items


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

    |   MainCalcAction CalcAction
    |   MainInvoiceAction InvoiceAction
    |   ChangeTab Tab

model0 : Model 
model0 = Model  (TodoModel  100 firstTodos "")
                (InvoiceModel 100 firstItems (TaxRate 0.19) )
                (CalcModel Nothing "" Nothing)
                InvoiceTab
--
-- End App
--------------------------------------------------------------------------------

--------------------------------------------------------------------------------
-- Main

update : Action -> Model -> Model
update msg model =
    case msg of 
        
        MainTodoAction action ->
            { model | todoModel = updateTodoModel action model.todoModel  }
            
        MainCalcAction action ->
            { model | calcModel = processCalc action model.calcModel }

        MainInvoiceAction action ->
            { model | invoiceModel = updateInvoiceModel action model.invoiceModel }

        ChangeTab tab ->
            { model | tab = tab }

view : Model -> Html Action
view model =
    div [] [
        ul  [] [
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
            TodoTab -> Html.map MainTodoAction <| viewTodoModel model.todoModel
            CalcTab -> Html.map MainCalcAction <| viewCalcModel model.calcModel
            InvoiceTab -> Html.map  MainInvoiceAction <|
                                    viewInvoiceModel model.invoiceModel
    ]

main = Browser.sandbox {
        init = model0,
        view = view,
        update = update
    }

-- End Main
--------------------------------------------------------------------------------



