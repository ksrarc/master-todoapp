module TodoApp exposing (..)

import Browser
import Html exposing (Html, button, div, text, ul, li, input)
import Html.Attributes exposing (value,class, attribute)
import Html.Events as Events

-- Modelos

type alias Todo = { id: Int, text: String, checked: Bool }

type alias Model = { counter: Int, todos : List Todo, newTodo: Todo }

emptyTodo id = Todo id "" False

firstTodos = [
        Todo 1 "Hola Mundo" False,
        Todo 2 "Cesar Arana" False
    ]
counter0 = (List.foldl max 0 (List.map (\t -> t.id) firstTodos)) + 1

model0 : Model 
model0 = Model counter0 firstTodos (emptyTodo counter0)

-- Updates

type Action =
        AddTodo Todo
    
    |   UpdateNewTodo String

update : Action -> Model -> Model
update msg model =
    case msg of 
        AddTodo todo -> 
            let
                counter = model.counter + 1
            in
                Model (counter) (todo :: model.todos) (emptyTodo counter)
        UpdateNewTodo text ->
            let
                oldTodo = model.newTodo
                newTodo = { oldTodo | text = text }
            in
                { model | newTodo = newTodo }
        

-- View

viewTodo : Todo -> Html a
viewTodo todo =
    li  []
        [
            text ("("++  (String.fromInt todo.id) ++ ")")
            ,
            text todo.text
        ]

viewNewTodo : Todo -> Html Action
viewNewTodo newTodo =
    
        div [] [
                    input [ value newTodo.text, Events.onInput  UpdateNewTodo ] []
                    ,
                    button [ Events.onClick  (AddTodo newTodo) ] [ text "+" ]
                ]


view : Model -> Html Action
view model =
    div []
        [
            viewNewTodo model.newTodo
            ,
            ul [] (List.map viewTodo model.todos)
        ]


-- Main

main = Browser.sandbox {
        init = model0,
        view = view,
        update = update
    }
