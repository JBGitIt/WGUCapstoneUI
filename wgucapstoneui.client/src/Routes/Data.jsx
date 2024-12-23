import React, { useState, useEffect } from 'react';
import SideNavbar from "../Components/SideNavbar";
import MainContent from "../Components/MainContent";
import Dropdown from "../Components/Dropdown";
import Table from '../Components/Table';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import DBDiagram from '../assets/DBDiagram.png';

function Data() {    

    return (
        <div className="d-flex flex-grow-1">
            <SideNavbar Links={[
                { link: "/Data/RawData", label: "Raw Data Extract" }
                , { link: "/Data/AdjustData", label: "Cleaning the Data" }
                , { link: "/Data/DataPrep", label: "Prepping the Data" }
                , { link: "/Data/DataVisualization", label: "Visualizing the Data" }
                , { link: "/Data/Hypothesis", label: "Hypothesis Resolution" }
            ]} />
            <MainContent>
                <h3>Data Explanation</h3>
                <p>For the storage, manipulation, and correlation of the selected datasets, I chose to use T-SQL. The database also houses different versions of the model as they are trained and validated. Below is a Database Diagram for the constructed database.</p>
                <img src={DBDiagram} alt="Database Diagram" style={{ width: '100%' }} />
                <p>The SQL statements to create the database structure are available on the GitHub GITHUBLINKREQUIRED</p>
            </MainContent>
        </div>
    );
}

export default Data;