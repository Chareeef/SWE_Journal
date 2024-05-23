import React from 'react'
import './App.css';
import Home from './Components/Home';
import "./Assets/Navstyle.css";
import Footer from './Components/Footer';
import SignIn from './Components/SignIn';
import Signup from './Components/Signup';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom'
import Navigation from './Components/Navigation';


function App() {
  return (
   
   <Router>
     <div className='App'>
       <Navigation />
      <div className='content'>
        <Routes>
          <Route path="/" element={<Home />}/>
          <Route path="/login" element={<SignIn />}/>
          <Route path="/register" element={<Signup />}/>
        </Routes>
        
      </div>
      {/* <Footer /> */}
      </div>
   </Router>
   
  );
}

export default App;
