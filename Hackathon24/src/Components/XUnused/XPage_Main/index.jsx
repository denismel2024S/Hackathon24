import React, { useState} from "react";
import Sidebar from "../Xsidebar";
import PageSignin from "../XPage_Signin";
//import PageDriver from "../Page_Driver";
import {PageRider} from "../../PageRider";

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