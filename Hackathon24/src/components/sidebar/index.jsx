import React from "react";

import './index.css'

const Sidebar = () => {
    return (
        <>
        <div className = "navBar">
            <ul className = "sideBar">
                <li className="nav-item">
                    <a className="nav-link "target = "_blank" href="">
                    <span>Ride Dashboard</span>
                    </a>
                </li>
                <li className="nav-item">
                <a className="nav-link collapsed" href="driver-faq.html">
                    <i className="bi bi-question-circle"></i>
                    <span>Sign Out</span>
                </a>
                </li>
            </ul>
        </div>
        </>
        
    )
}
export default Sidebar;