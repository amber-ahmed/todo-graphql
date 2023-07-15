import { Route, Routes } from 'react-router-dom';
import './App.css';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client'

function App() {
  const client = new ApolloClient({
    cache : new InMemoryCache(),
    uri: process.env.REACT_APP_SERVER_URL
  })
  return (
    <ApolloProvider client={client}>

    <Routes>
    <Route path='/' element={<Register/>}/>
      <Route path='/login' element={<Login/>}/>
      <Route path='/home' element={<Home/>}/>
    </Routes>
    </ApolloProvider>

  );
}

export default App;
