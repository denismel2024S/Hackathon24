// import { useState } from 'react'
// import './App.css'
// import './main.jsx'
// import {Routes, Route} from 'react-router-dom'
// import PageMain from "./components/Page_Main"


// function App() {

//   return (
//     <>
//     <PageMain/>
//     </>
//   )
// }

// export default App


import { useState } from 'react'
import './App.css'
import './main.jsx'
import {Routes, Route} from 'react-router-dom'
import PageMain from "./components/Page_Main"
import PageRider from './components/Page_Rider/index.jsx'
import PageDriver from './components/Page_Driver/index.jsx'
import PageSignin from './components/Page_Signin/index.jsx'
import Sidebar from './components/sidebar/index.jsx'

function App() {
    
  return (
    <div>
      <PageMain/>
    </div>
  );
}

export default App
