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


import { withAuthInfo, useRedirectFunctions, useLogoutFunction } from '@propelauth/react'

const App = withAuthInfo((props) => {
    const logoutFunction = useLogoutFunction()
    const { redirectToLoginPage, redirectToSignupPage, redirectToAccountPage } = useRedirectFunctions()
    // Or if you want to make links instead
    // const { getLoginPageUrl, getSignupPageUrl, getAccountPageUrl } = useHostedPageUrls()

    if (props.isLoggedIn) {
        return (
            <div>
                <p>You are logged in as {props.user.email}</p>
                <button onClick={() => redirectToAccountPage()}>Account</button>
                <button onClick={() => logoutFunction(true)}>Logout</button>
            </div>
        )
    } else {
        return (
            <div>
                <p>You are not logged in</p>
                <button onClick={() => redirectToLoginPage()}>Login</button>
                <button onClick={() => redirectToSignupPage()}>Signup</button>
            </div>
        )
    }
})




export default App
