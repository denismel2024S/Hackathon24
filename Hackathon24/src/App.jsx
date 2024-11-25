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
import PageMain from "./Components/Page_Main/index.jsx"
import {PageRider} from './Components/Page_Rider/index.jsx'
import PageDriver from './Components/Page_Driver/index.jsx'
import PageSignin from './Components/Page_Signin/index.jsx'
import Sidebar from './Components/sidebar/index.jsx'
import {Login} from './Components/RiderLogin/index.jsx'
//import PageMain from './components/Page_Main/index.jsx'


import { withAuthInfo, useRedirectFunctions, useLogoutFunction } from '@propelauth/react'

const App = withAuthInfo((props) => {
    const [showCodeInput, setShowCodeInput] = useState(false);
    const [code, setCode] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isRider, setIsRider] = useState(false);
    const [username, setUsername] = useState(''); 
    const logoutFunction = useLogoutFunction()
    const { redirectToLoginPage, redirectToSignupPage, redirectToAccountPage } = useRedirectFunctions()
    // Or if you want to make links instead
    // const { getLoginPageUrl, getSignupPageUrl, getAccountPageUrl } = useHostedPageUrls()
    const correctCode = '12345';

    const handlePassengerButtonClick = () => {
        setShowCodeInput(true);
        setErrorMessage('');
        setCode('');
    };

    const handleCodeSubmit = () => {
        if(code == correctCode){
            setIsRider(true);
            setErrorMessage('');
        }else{
            setErrorMessage('Invalid code');
            setCode('');
        }
    };

    if (props.isLoggedIn) {
        return (
                <div>
                <PageDriver/>
                <p>You are logged in as a driver{props.user.email}</p>
                <button onClick={() => redirectToAccountPage()}>Account</button>
                <button onClick={() => logoutFunction(true)}>Logout</button>
            </div>
        );
    }else if(isRider){
        return(
            <div>
                username ? <PageRider username = {username}/> : <Login onSubmit = {setUsername}/>
            </div>
        );
    }else {
        return (
            <div>
                <p>You are not logged in</p>
                <button onClick={() => redirectToLoginPage()}>Login</button>
                <button onClick={() => redirectToSignupPage()}>Signup</button>
                <button onClick={handlePassengerButtonClick}>Passenger</button>
                {showCodeInput && (
                    <div>
                        <input 
                        type = "text"
                        value = {code}
                        onChange={(e) => setCode(e.target.value)}   
                        placeHolder = "Enter Code"
                        />
                        <button onClick = {handleCodeSubmit}>Submit</button>
                        {errorMessage && <p style = {{color: 'red'}}>{errorMessage}</p>}
                    </div>

                )}

            </div>
        );
    }
})




export default App
