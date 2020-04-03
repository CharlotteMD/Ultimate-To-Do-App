import React, { useEffect, useReducer, useState } from "react";

import API, { graphqlOperation } from "@aws-amplify/api";
import PubSub from "@aws-amplify/pubsub";

import { createTodo, deleteTodo } from "./graphql/mutations";
import { listTodos } from "./graphql/queries";
import { onCreateTodo } from "./graphql/subscriptions";

import { GlobalStyles } from "./style/global-styles";
import { MainTitle, HeaderText } from "./style/typography";

import awsconfig from "./aws-exports";
import "./App.css";

API.configure(awsconfig);
PubSub.configure(awsconfig);

// Action Types
const QUERY = "QUERY";
const SUBSCRIPTION = "SUBSCRIPTION";

const initialState = {
  todos: []
};

const reducer = (state, action) => {
  switch (action.type) {
    case QUERY:
      return { ...state, todos: action.todos };
    case SUBSCRIPTION:
      return { ...state, todos: [...state.todos, action.todo] };
    default:
      return state;
  }
};

function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [values, setValues] = useState({ name: "", description: "" });

  useEffect(() => {
    getData();

    const subscription = API.graphql(graphqlOperation(onCreateTodo)).subscribe({
      next: eventData => {
        const todo = eventData.value.data.onCreateTodo;
        dispatch({ type: SUBSCRIPTION, todo });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function getData() {
    const todoData = await API.graphql(graphqlOperation(listTodos));
    dispatch({ type: QUERY, todos: todoData.data.listTodos.items });
  }

  const handleInputChange = e => {
    const { name, value } = e.target;
    setValues({ ...values, [name]: value });
  };

  async function createNewTodo(e) {
    e.preventDefault();
    await API.graphql(graphqlOperation(createTodo, { input: values }));
  }

  const submitToDo = e => {
    const { name, description } = values;
    if (!name || !description) return;
    createNewTodo(e);
  };

  async function deleteThisTodo({ todo }) {
    delete todo.name;
    delete todo.description;
    await API.graphql(graphqlOperation(deleteTodo, { input: todo }));
    getData();
  }

  return (
    <div className="App">
      <GlobalStyles />
      <MainTitle>What do you need to do today?</MainTitle>
      <form>
        <label>
          <HeaderText>Title:</HeaderText>
          <textarea type="text" name="name" onChange={handleInputChange} />
        </label>
        <label>
          <HeaderText>Description:</HeaderText>
          <textarea
            type="text"
            name="description"
            cols="40"
            rows="3"
            onChange={handleInputChange}
          />
        </label>
        <input
          type="button"
          value="Submit"
          onClick={submitToDo}
          className="submitToDo"
        />
      </form>
      <div className="todoContainer">
        {state.todos.length > 0 ? (
          state.todos.map(todo => (
            <div className="todos">
              <button
                onClick={() => deleteThisTodo({ todo })}
                className="closeToDo"
              >
                X
              </button>
              <h3 key={todo.id}>{todo.name}</h3>
              <p key={todo.id}>{todo.description}</p>
            </div>
          ))
        ) : (
          <p>Add some todos!</p>
        )}
      </div>
    </div>
  );
}

export default App;
