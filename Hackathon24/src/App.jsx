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
                <h1 className = "uppercase font-bold text-4xl sm:text-5xl md:text6xl lg:text7xl">Welcome to <span className = "text-blue-500">Chariot</span></h1>
                <br></br>
                <div className = "flex flex-col items-center gap-4">
                <p className = "text-sm md:text-base font-light">Please Sign in</p>
                <button className = "w-32 bg-blue-500 text-white py-2 rounded" onClick={handleDriverButtonClick}>Driver</button>
                <button className = "w-32 bg-blue-500 text-white py-2 rounded" onClick={handlePassengerButtonClick}>Passenger</button>
                {showCodeInput && (
                    <div className = "flex flex-row gap-4">
                    <br></br>
                    <input
                        type = "text"
                        value = {code}
                        onChange={(e) => setCode(e.target.value)}   
                        placeholder = "Enter Code"
                        />
                        <button className = "w-32 bg-blue-500 text-white py-2 rounded" onClick = {handleCodeSubmit}>Submit</button>
                        {errorMessage && <p style = {{color: 'red'}}>{errorMessage}</p>}
                    </div>
                )}
                </div>

            </div>
        );
    }
}
export default App
