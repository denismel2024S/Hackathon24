import React from "react";

const SigninSignoutButton = ( {isLoggedIn}) => {

    if (!isLoggedIn) {
      return (
      <div>
        <li className="nav-item">
            <a className="nav-link collapsed" href="driver-faq.html">
                <i className="bi bi-question-circle"></i>
                <span>Sign In</span>
            </a>
        </li>
     </div>
      );
    } else {
      return (
      <div>
        <li className="nav-item">
            <a className="nav-link collapsed" href="driver-faq.html">
                <i className="bi bi-question-circle"></i>
                <span>Sign Out</span>
            </a>
        </li>
      </div>
      );
    }
}

export default SigninSignoutButton;