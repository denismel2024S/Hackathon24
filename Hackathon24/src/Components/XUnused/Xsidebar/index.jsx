import React from "react";

import './index.css'
import SigninSignoutButton from "../Xsignin_signout_button";

const Sidebar = () => {
    const loggedIn = true; // test to see if display updates when user is logged in/out

    return (
        <>
        <div className = "navBar">
            <ul className = "sideBar">
                <li className="nav-item">
                    <a className="nav-link "target = "_blank" href="">
                    <span>Ride Dashboard</span>
                    </a>
                </li>
                <SigninSignoutButton
                isLoggedIn={loggedIn}
                />
            </ul>
        </div>
        </>
    )
}
export default Sidebar;