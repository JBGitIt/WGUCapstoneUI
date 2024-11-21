import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import '../node_modules/bootstrap/dist/css/bootstrap.css';
import Header from './Components/Header';
import Footer from './Components/Footer';
import TopNavbar from './Components/TopNavbar';
import SideNavbar from './Components/SideNavbar';
import MainContent from './Components/MainContent';
import Home from './Routes/Home';

function App() {
    return (
        <div className="d-flex flex-column min-vh-100">
            <Header />
            <TopNavbar />
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Home />} />
                </Routes>
            </BrowserRouter>
            <Footer />
        </div>
        //<div className="d-flex flex-column min-vh-100">
        //    <Header />
        //    <TopNavbar />
        //    <div className="d-flex flex-grow-1">
        //        <SideNavbar />
        //        <MainContent />
        //    </div>
        //    <Footer />
        //</div>
    );
}

export default App;