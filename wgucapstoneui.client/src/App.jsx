import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import Header from './Components/Header';
import Footer from './Components/Footer';
import TopNavbar from './Components/TopNavbar';
import SideNavbar from './Components/SideNavbar';
import MainContent from './Components/MainContent';
import Home from './Routes/Home';
import Data from './Routes/Data';
import RawData from './Routes/RawData';
import Model from './Routes/Model';
import AdjustData from './Routes/AdjustData';
import DataPrep from './Routes/DataPrep';
import ModelTraining from './Routes/ModelTraining';
import ModelValidation from './Routes/ModelValidation';
import ModelVisualization from './Routes/ModelVisualization';
import DataVisualization from './Routes/DataVisualization';
import Hypothesis from './Routes/Hypothesis';


function App() {
    return (
        <div className="d-flex flex-column min-vh-100">
            <Header />
            <TopNavbar />
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/Data" element={<Data />} />
                    <Route path="/Data/RawData" element={<RawData />} />
                    <Route path="/Data/AdjustData" element={<AdjustData />} />
                    <Route path="/Data/DataPrep" element={<DataPrep />} />
                    <Route path="/Data/DataVisualization" element={<DataVisualization />} />
                    <Route path="/Data/Hypothesis" element={<Hypothesis /> } />
                    <Route path="/Model" element={<Model />} />
                    <Route path="/Model/Training" element={<ModelTraining />} />
                    <Route path="/Model/Validation" element={<ModelValidation />} />
                    <Route path="/Model/Visualization" element={<ModelVisualization />} />
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