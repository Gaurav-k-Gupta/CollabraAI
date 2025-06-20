import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import AppRoutes from './routes/AppRoutes'
import { UserProvider } from './context/user.context'

function App() {
  const [count, setCount] = useState(0)

  return (
    <UserProvider>
       <AppRoutes />
    </UserProvider>
  )
}

export default App
