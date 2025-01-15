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
        if(code == correctCode ){
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
                <>
                    <RiderLogin/>
                </>
        );
    }else if(driverOrRider === 'driver'){
        return (
                <>
                    <DriverLogin/>
                </>
        );
    }
    else {
        return (
            <div className="mainPage">
            <h1 className="welcome">Welcome to <span className="text-yellow-400">Chariot</span></h1>
            <img className="mainImage" src="./src/images/fasho.png" />
            <div>
                <h2 className="gotACode">Got A Code?</h2>
                <div className="codeContainer">
                <input
                    type="tel"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder={errorMessage ? "Invalid Code" : "Enter Code"}
                    style={errorMessage ? { borderColor: 'red' } : {}}
                />
                <button className="submit" onClick={handleCodeSubmit}>Submit</button>
                <button className="driverButton" onClick={handleDriverButtonClick}>Driver Login</button>
                </div>
            </div>
            </div>
        );
    }
}
export default App
