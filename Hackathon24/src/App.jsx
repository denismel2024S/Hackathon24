import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Page_Signin from "./Components/Page_Signin/index.jsx"

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Page_Signin/>
    </>
  )
}

export default App
