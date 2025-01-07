import './index.css'
import React from 'react'
import LoginCard from '../Xlogin_card';

const PageSignin = ({ onLogin }) => {
    return (

        <div className="container">
            <LoginCard onLogin={onLogin}/>
        </div>

    );
};
export default PageSignin;