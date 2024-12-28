import React, { useState} from "react";
import Sidebar from "../sidebar";
import PageSignin from "../Page_Signin";
//import PageDriver from "../Page_Driver";
import {PageRider} from "../Page_Rider";

const PageMain = () => {
    
  const [currentAccount, setCurrentAccount] = useState(null);

  // Function to handle login and set current account
  const handleLogin = (accountData) => {
    setCurrentAccount(accountData);
    accountData = currentAccount
  };

  return (
    <div >
      <Sidebar />
      {!currentAccount ? (
        <PageSignin onLogin={handleLogin}/>
      ) : (
        currentAccount.role === "driver" ? (
          <PageDriver account={currentAccount}/>
        ) : (
          <PageRider account={currentAccount}/>
        )
      )}
    </div>
  );
}

export default PageMain;