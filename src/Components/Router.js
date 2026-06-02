import React from "react";
import { Route, BrowserRouter } from "react-router-dom";
import Home from "./Home";
import Filter from "./Filter";
import Details from "./Details";
import Nav1 from "./Nav1";
import AdminPanel from "./AdminPanel";
import OrderHistory from "./OrderHistory";




function Router(){
    return(
        <BrowserRouter>
        <Route path="/admin" component={AdminPanel} />
        <Route path="*" component={Nav1} />
            <Route exact path="/" component={Home} />
            <Route path="/filter" component={Filter} />
            <Route path="/details" component={Details} />
            <Route path="/orders" component={OrderHistory} />

        </BrowserRouter>
    )
}
    
export default Router;