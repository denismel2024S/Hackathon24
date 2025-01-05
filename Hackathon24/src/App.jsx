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
import {PageRider} from './components/Page_Rider/index.jsx'
import {PageDriver} from './components/Page_Driver/index.jsx'
import PageSignin from './Components/Page_Signin/index.jsx'
import Sidebar from './Components/sidebar/index.jsx'
import {RiderLogin} from './Components/RiderLogin/index.jsx'
import {DriverLogin} from './Components/DriverLogin/index.jsx'
import { UserProvider } from "./context/UserContext";


const App = () => {
    const [showCodeInput, setShowCodeInput] = useState(false);
    const [code, setCode] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isRider, setIsRider] = useState(false);
    const [isDriver, setIsDriver] = useState(false);
    const [username, setUsername] = useState(''); 
    const correctCode = '12345';


    const handlePassengerButtonClick = () => {
        setShowCodeInput(true);
        setErrorMessage('');
        setCode('');
    };
    const handleDriverButtonClick = () => {
        console.log("Clicked Login")
        setIsDriver(true);
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




    if(isRider){
        console.log({username})
        return(
            <UserProvider>
                <div>
                    {username ? <PageRider username = {username}/> : <RiderLogin onSubmit = {setUsername}/>}
                </div>
            </UserProvider>
        );
    }else if(isDriver){
        return (
            <UserProvider>
                <div>
                    <DriverLogin/>
                </div>
            </UserProvider>
        );
    }
    else {
        return (
            <div>
                <p>You are not logged in</p>
                <br></br>
                <button onClick={handleDriverButtonClick}>Driver</button>
                <button onClick={handlePassengerButtonClick}>Passenger</button>
                {showCodeInput && (
                    <div>
                    <br></br>
                    <input 
                        type = "text"
                        value = {code}
                        onChange={(e) => setCode(e.target.value)}   
                        placeholder = "Enter Code"
                        />
                        <button onClick = {handleCodeSubmit}>Submit</button>
                        {errorMessage && <p style = {{color: 'red'}}>{errorMessage}</p>}
                    </div>

                )}

            </div>
        );
    }
}
export default App
