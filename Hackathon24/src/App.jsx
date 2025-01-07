import { useEffect, useState } from 'react'
import './App.css'
import './main.jsx'
import {RiderLogin} from './Components/RiderLogin/index.jsx'
import {DriverLogin} from './Components/DriverLogin/index.jsx'
import {Reset} from './Components/Reset/index.jsx'

const App = () => {
    const [showCodeInput, setShowCodeInput] = useState(false);
    const [code, setCode] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [driverOrRider, setDriverOrRider] = useState('');
    const correctCode = '1';

    const handlePassengerButtonClick = () => {
        setShowCodeInput(true);
        setErrorMessage('');
        setCode('');
    };
    const handleDriverButtonClick = () => {
        setDriverOrRider('driver');
    };
    const handleCodeSubmit = () => {
        if(code == correctCode){
            setDriverOrRider('rider');
            setErrorMessage('');
        }else{
            setErrorMessage('Invalid code');
            setCode('');
        }
    };

    useEffect(() => {
        const driverOrRider = window.localStorage.getItem('driverOrRider');
        if(driverOrRider){
            setDriverOrRider(driverOrRider);
        }
    }, []);

    useEffect(() => {
        console.log('driverOrRider:', driverOrRider);
        window.localStorage.setItem('driverOrRider', driverOrRider);
    }, [driverOrRider]);

    if(driverOrRider === 'rider'){
        return(
                <div>
                    <RiderLogin/>
                    <Reset/>
                </div>
        );
    }else if(driverOrRider === 'driver'){
        return (
                <div>
                    <DriverLogin/>
                    <Reset/>
                </div>
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
