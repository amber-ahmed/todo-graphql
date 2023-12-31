import React, { useRef } from "react";
import todoicon from "../assets/images/todobig.png";
import { Navigate, useNavigate } from "react-router-dom";
import { gql, useLazyQuery, useMutation, useQuery } from "@apollo/client";
const Login = () => {
  const email = useRef()
  const password = useRef()

  const QUERY_LOGIN = gql`
  query Login($loginDetails: LoiginInput!) {
    login(input: $loginDetails) {
       access
       msg
       id
    }
}

`
  const [login, { data, loading, error }] = useLazyQuery(QUERY_LOGIN)

  if (loading) return <h1>Loading</h1>
  if (error) return <h1>something went wrong</h1>
  if (data?.login?.access){
    console.log(data.login)
    localStorage.setItem('id',data.login.id)
    return <Navigate to={'/home'}  />
  }
  if(data && !data?.login.access){
    console.log(data)
    alert(data?.login.msg)
  }
  return (
    <section className="h-screen">
      <div className="container h-full px-6 py-24">
        <div className="g-6 flex h-full flex-wrap items-center justify-center lg:justify-between">
          {/* <!-- Left column container with background-> */}
          <div className="mb-12 md:mb-0 md:w-8/12 lg:w-6/12">
            <img src={todoicon} className="w-full" alt="Phone image" />
          </div>

          {/* <!-- Right column container with form --> */}
          <div className="md:w-8/12 lg:ml-6 lg:w-5/12">
            <form >
              {/* <!-- Email input --> */}
              <div className="relative mb-6" data-te-input-wrapper-init>
                <input
                  ref={email}
                  required
                  type="text"
                  className="peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[2.15] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none dark:text-neutral-200 dark:placeholder:text-neutral-200 [&:not([data-te-input-placeholder-active])]:placeholder:opacity-0"
                  id="exampleFormControlInput3"
                  placeholder="Email address"
                />
                <label
                  for="exampleFormControlInput3"
                  className="pointer-events-none absolute left-3 top-0 mb-0 max-w-[90%] origin-[0_0] truncate pt-[0.37rem] leading-[2.15] text-neutral-500 transition-all duration-200 ease-out peer-focus:-translate-y-[1.15rem] peer-focus:scale-[0.8] peer-focus:text-primary peer-data-[te-input-state-active]:-translate-y-[1.15rem] peer-data-[te-input-state-active]:scale-[0.8] motion-reduce:transition-none dark:text-neutral-200 dark:peer-focus:text-primary"
                >
                  Email address
                </label>
              </div>

              {/* <!-- Password input --> */}
              <div className="relative mb-6" data-te-input-wrapper-init>
                <input
                  ref={password}
                  required
                  type="password"
                  className="peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[2.15] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none dark:text-neutral-200 dark:placeholder:text-neutral-200 [&:not([data-te-input-placeholder-active])]:placeholder:opacity-0"
                  id="exampleFormControlInput33"
                  placeholder="Password"
                />
                <label
                  for="exampleFormControlInput33"
                  className="pointer-events-none absolute left-3 top-0 mb-0 max-w-[90%] origin-[0_0] truncate pt-[0.37rem] leading-[2.15] text-neutral-500 transition-all duration-200 ease-out peer-focus:-translate-y-[1.15rem] peer-focus:scale-[0.8] peer-focus:text-primary peer-data-[te-input-state-active]:-translate-y-[1.15rem] peer-data-[te-input-state-active]:scale-[0.8] motion-reduce:transition-none dark:text-neutral-200 dark:peer-focus:text-primary"
                >
                  Password
                </label>
              </div>

              <div className="mb-6 flex items-center justify-between">

                <p class="mb-0 mt-2 pt-1 text-sm font-semibold">
                  Don't have an account ?
                  <a
                    href="/"
                    class="text-danger ml-4 transition duration-150 ease-in-out hover:text-danger-600 focus:text-danger-600 active:text-danger-700"
                  >
                    <span className="text-blue-700">Register</span>
                  </a>
                </p>
              </div>

              <button
                onClick={() => {
                  if (!password.current.value && !email.current.value )
                    return alert('provide all credentials')
                  login({
                    variables: {
                      loginDetails: {
                        email: email.current.value,
                        password: password.current.value
                      }
                    }
                  })
                }}
                type="submit"
                className="mb-3 bg-[#3b5998] flex w-full items-center justify-center rounded bg-primary px-7 pb-2.5 pt-3 text-center text-sm font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] dark:shadow-[0_4px_9px_-4px_rgba(59,113,202,0.5)] dark:hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)]"
              >
                Sign in
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;
