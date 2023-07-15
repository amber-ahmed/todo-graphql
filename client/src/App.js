import { Route, Routes } from 'react-router-dom';
import './App.css';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client'

function App() {
  const client = new ApolloClient({
    cache : new InMemoryCache(),
    uri: "https://tasky.amberahmed.in"
  })
  return (
    <ApolloProvider client={client}>

    <Routes>
      <Route path='/login' element={<Login/>}/>
      <Route path='/home' element={<Home/>}/>
      <Route path='/register' element={<Register/>}/>
    </Routes>
    </ApolloProvider>

  );
}

export default App;
