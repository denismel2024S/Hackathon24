import React from "react";
import Page_Signin from "../Page_Signin";


const PageMain = () => {
    return(
        <div classname="container">
            <Sidebar></Sidebar>
            <Page_Signin></Page_Signin>
            <PageDriver></PageDriver>
            <PageRider></PageRider>
        </div>
    )
}

export default PageMain;