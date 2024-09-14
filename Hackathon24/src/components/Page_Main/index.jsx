import React from "react";
import Sidebar from "../sidebar";
import PageSignin from "../Page_Signin";
import PageDriver from "../Page_Driver";
import PageRider from "../Page_Rider";

const PageMain = () => {
    return(
        <div classname="container">
            <Sidebar/>
            <PageSignin/>
            <PageDriver/>
            <PageRider/>
        </div>
    )
}

export default PageMain;