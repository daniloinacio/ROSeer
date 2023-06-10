import { BrowserRouter, Switch, Route } from "react-router-dom";
import Home from './pages/home';


function Routes() {
  return (
    <BrowserRouter>
      <Switch>
      <Route path='/' component={Home} />
        <Home />
      </Switch>
    </BrowserRouter>
  )
}

export default Routes;