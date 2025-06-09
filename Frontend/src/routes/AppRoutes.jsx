import React from 'react'
import { Route, BrowserRouter , Routes } from 'react-router-dom'
import Login from '../screens/login'
import SignUp from '../screens/register'
import Home from '../screens/home'

const AppRoutes = () => {
  return (
    <BrowserRouter>
        <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<SignUp />} />
        </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes