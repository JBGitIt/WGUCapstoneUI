import { useEffect, useState } from 'react';
import './App.css';
import '../node_modules/bootstrap/dist/css/bootstrap.css';
import Header from './Components/Header';
import Footer from './Components/Footer';
import TopNavbar from './Components/TopNavbar';
import SideNavbar from './Components/SideNavbar';
import MainContent from './Components/MainContent';

function App() {
    return (
        <div className="d-flex flex-column min-vh-100">
            <Header />
            <TopNavbar />
            <div className="d-flex flex-grow-1">
                <SideNavbar />
                <MainContent />
            </div>
            <Footer />
        </div>
    );
}

export default App;