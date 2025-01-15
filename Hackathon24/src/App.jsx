import { useEffect, useState } from 'react'
//import './App.css'
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
                <div
                style={{
                    backgroundImage: "url('src/images/fasho.png')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                }}
                className="flex flex-col items-center justify-center text-center text-white"
                >  
                <h1 className = "uppercase font-bold text-4xl sm:text-5xl md:text6xl lg:text7xl">Welcome to <span className = "text-yellow-400">Chariot</span></h1>
                <br></br>
                <div className = "flex flex-col items-center gap-4">
                <p>Please Sign in</p>
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
                        <button className = "w-32 bg-yellow-600 text-white py-2 rounded" onClick = {handleCodeSubmit}>Submit</button>
                        {errorMessage && <p style = {{color: 'red'}}>{errorMessage}</p>}
                    </div>
                )}
                </div>
                </div>

            </div>
        );
    }
}
export default App
