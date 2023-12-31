import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../utils/socket.js";
import { gql, useLazyQuery, useMutation, useQuery } from "@apollo/client";
import Navbar from "./Navbar.js";

const Home = () => {

  const [editModal, setEditModal] = useState("hidden");
  const [deleteModal, setDeleteModal] = useState("hidden");
  const [isAdd, setIsAdd] = useState(false);
  const [currentTask, setCurrentTask] = useState({
    name: "",
    desc: "",
  });
  const searchText = useRef();
  const navigate = useNavigate()
  let [todos, setTodos] = useState([])
  const QUERY_FETCH_ALL = gql`
  query FetchAll{
    fetchall{
        ...on TodosSuccess{
            access
            msg
            todos{
                name
                desc
            }
        }
        ...on TodosError{
            access
            msg
        }
    }
}

  `
  let { data, loading, error, refetch } = useQuery(QUERY_FETCH_ALL, {
    context: {
      headers: {
        id: localStorage.getItem('id')
      }
    }
  })
  const QUERY_SEARCH = gql`
  query GetByName($name: String!){
    search(name: $name) {
        name
        desc
    }
}
  `

  let [search, { data: searchData, loading: loadingSearch, error: searchError }] = useLazyQuery(QUERY_SEARCH, {
    context: {
      headers: {
        id: localStorage.getItem('id')
      }
    }
  })
  const QUERY_ADD_N_UPDATE = gql`
  mutation AddnEdit($addnEditInput: AddnEditInput!){
    addnedit(input: $addnEditInput) {
        msg
        access
    }
}
`
  const [addnedit, { error: addneditError }] = useMutation(QUERY_ADD_N_UPDATE, {
    context: {
      headers: {
        id: localStorage.getItem('id')
      }
    }
  })
  const QUERY_DELETE = gql`
  mutation Delete($deleteName: String!){
    delete(name: $deleteName) {
        msg
        access
    }
}
  `
  const [deletetask, { error: deleteError }] = useMutation(QUERY_DELETE, {
    context: {
      headers: {
        id: localStorage.getItem('id')
      }
    }
  })



  useEffect(() => {
    socket.on('add' + localStorage.getItem('id'), () => {
      refetch()
    })
    socket.on('delete' + localStorage.getItem('id'), () => {
      refetch()
    })
  }, [])
  async function addnEdit(e) {
    e.preventDefault()
    addnedit({
      variables: {
        addnEditInput: {
          name: currentTask.name,
          desc: currentTask.desc
        }
      }
    })
    refetch()
    socket.emit('todo-added', localStorage.getItem('id'))
    setEditModal("hidden");
  }

  async function deleteTask(e) {
    e.preventDefault()
    deletetask({
      variables: {
        deleteName: currentTask.name
      }
    })
    refetch()
    socket.emit('todo-deleted', localStorage.getItem('id'))
    setDeleteModal("hidden")
  }

  useEffect(() => {
    if (data) {
      if (data.fetchall.access)
        setTodos(data.fetchall.todos)
    }
    console.log(data)
  }, [data])

  return (
    <>
      <Navbar value={'value'}/>
      <div className="mt-16">
        <label
          htmlFor="default-search"
          className="mb-2 mt-16 text-sm font-medium text-gray-900 sr-only dark:text-white"
        >
          Search
        </label>
        <div className="relative">
          <input
            onChange={(event) => {
              if (!event.target.value) {
                console.log(event.target.value)
                refetch()
                if (data) {
                  if (data.fetchall.access)
                    setTodos(data.fetchall.todos)
                  console.log(data.fetchall)
                }
              } else {
                search({
                  variables: {
                    name: event.target.value
                  }
                })
                if (searchData)
                  setTodos(searchData.search)
              }
            }}
            ref={searchText}
            type="search"
            id="default-search"
            className="block w-4/5 mx-auto p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Search by name or description"
            required
          />
        </div>
      </div>
      {error || (data && !data.fetchall.access) && <h1>something went wrong</h1>}
      {loading && <h1>Loading</h1>}
      <table className="table-auto w-full mt-8  text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xl py-32 text-gray-700 uppercase bg-blue-200 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" className="px-6 py-3">
              Name
            </th>
            <th scope="col" className="px-6 py-3">
              Description
            </th>
            <th scope="col" className="px-6 py-3">
              Edit
            </th>
            <th scope="col" className="px-6 py-3">
              Delete
            </th>
          </tr>
        </thead>


        <tbody>
          {
            todos.map((todo, index) => (
              <tr key={index + 1} className="bg-white border-b hover:bg-gray-200 dark:bg-gray-800 dark:border-gray-700">
                <td
                  scope="row"
                  className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                >
                  {todo.name}
                </td>
                <td
                  scope="row"
                  className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                >
                  {todo.desc}
                </td>
                <td
                  scope="row"
                  className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                >
                  <i
                    onClick={() => {
                      setIsAdd(false);
                      setCurrentTask(todo);
                      setEditModal("");
                    }}
                    className="fa fa-edit font-bold  text-blue-700  text-[24px] cursor-pointer"
                  ></i>
                </td>
                <td
                  scope="row"
                  className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                >
                  <i
                    onClick={() => {
                      setCurrentTask(todo);
                      setDeleteModal("");
                    }}
                    className="fa fa-trash-o font-bold text-blue-700  text-[24px]    cursor-pointer"
                  ></i>
                </td>
              </tr>
            ))
          }

        </tbody>
      </table>

      {/* <!-- Edit modal --> */}
      <div
        id="authentication-modal"
        tabIndex="-1"
        aria-hidden="true"
        className={`${editModal} fixed top-8  z-50  w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full`}
      >
        <div className="relative w-full max-w-md max-h-full">
          {/* <!-- Modal content --> */}
          <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
            <button
              onClick={() => {
                setIsAdd(false);
                setEditModal("hidden");
              }}
              type="button"
              className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-800 dark:hover:text-white"
              data-modal-hide="authentication-modal"
            >
              <svg
                aria-hidden="true"
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                ></path>
              </svg>
              <span className="sr-only">Close modal</span>
            </button>
            <div className="px-6 py-6 lg:px-8">
              <h3 className="mb-4 text-xl font-medium text-gray-900 dark:text-white">
                {isAdd ? "Add Task" : "Update Task"}
              </h3>
              <form className="space-y-6" onSubmit={addnEdit}>
                <div>
                  <label
                    htmlFor="name"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Name
                  </label>
                  <input
                    value={currentTask.name}
                    onChange={(e) =>
                      setCurrentTask({
                        ...currentTask,
                        name: e.target.value,
                      })
                    }
                    readOnly={!isAdd}
                    type="text"
                    placeholder="enter task name"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500  dark:text-white"
                  ></input>
                </div>
                <div>
                  <label
                    htmlFor="description"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Description
                  </label>
                  <input
                    value={currentTask.desc}
                    onChange={(e) =>
                      setCurrentTask({
                        ...currentTask,
                        desc: e.target.value,
                      })
                    }
                    placeholder="enter task description"
                    type="description"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500  dark:text-white"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                >
                  {isAdd ? "Add" : "Update"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/*delete modl*/}
      <div
        id="authentication-modal"
        tabIndex="-1"
        aria-hidden="true"
        className={`${deleteModal} fixed top-8  z-50  w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full`}
      >
        <div className="relative w-full max-w-md max-h-full">
          {/* <!-- Modal content --> */}
          <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
            <button
              onClick={() => setDeleteModal("hidden")}
              type="button"
              className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-800 dark:hover:text-white"
              data-modal-hide="authentication-modal"
            >
              <svg
                aria-hidden="true"
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                ></path>
              </svg>
              <span className="sr-only">Close modal</span>
            </button>
            <div className="px-6 py-6 lg:px-8">
              <h3 className="mb-4 text-xl font-medium text-gray-900 dark:text-white">
                Delete Task
              </h3>
              <form className="space-y-6" onSubmit={deleteTask}>
                <div>
                  <label
                    htmlFor="name"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Name
                  </label>
                  <h1
                    type="text"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500  dark:text-white"
                  >
                    {currentTask.name}
                  </h1>
                </div>
                <div>
                  <label
                    htmlFor="description"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Description
                  </label>
                  <h1
                    type="description"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500  dark:text-white"
                  >
                    {currentTask.desc}
                  </h1>
                </div>

                <button
                  type="submit"
                  className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                >
                  Delete
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <i
        onClick={() => {
          setCurrentTask({
            name: "",
            desc: "",
          });
          setIsAdd(true);
          setEditModal("");
        }}
        className="fixed text-blue-700 bottom-8 right-8 cursor-pointer text-[80px] fa fa-plus"
      ></i>
    </>
  );
};

export default Home;
