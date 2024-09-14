import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import PageMain from "./components/Page_Main"

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Routes>
        <Route path = '/components/Page_Main' element = {<PageMain/>}/>
        
      </Routes>
    </>
  )
}

export default App
