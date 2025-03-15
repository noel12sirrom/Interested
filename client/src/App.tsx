import { useState } from 'react'
import Login from './components/Login'
import './index.css'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<string | null>(null)

  const handleLogin = async (email: string, password: string) => {
    // Here you would typically make an API call to your backend
    // For now, we'll simulate a successful login
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setIsLoggedIn(true)
      setUser(email)
    } catch (error) {
      throw new Error('Login failed')
    }
  }

  return (
    <div className="App">
      {!isLoggedIn ? (
        <Login onLogin={handleLogin} />
      ) : (
        <div>
          <h1>Welcome, {user}!</h1>
          <button onClick={() => setIsLoggedIn(false)}>Logout</button>
        </div>
      )}
    </div>
  )
}

export default App 