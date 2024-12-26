import React, { useState, useEffect } from 'react';
import SideNavbar from "../Components/SideNavbar";
import MainContent from "../Components/MainContent";
import Dropdown from "../Components/Dropdown";
import Table from '../Components/Table';
import DataGraph from '../Components/DataGraph'
function DataVisualization() {

    const [s_Series, s_setSeries] = useState("GDP");
    const [s_Data, s_setData] = useState(undefined);

    const isProduction = process.env.NODE_ENV === 'production';
    const APIprefix = isProduction ? '/CapstoneUIAPI/' : '/';

    useEffect(() => {
        s_setData(["Loading"]);
        async function GetData() {
            try {
                const response = await fetch(`${APIprefix}ML/raw?l_STRseries=${s_Series}`);
                if (!response.ok) {
                    throw new Error('Not ok bro. Sad face');
                }
                const data = await response.json();
                s_setData(data);
            } catch (error) {
                console.error('Could not fetch data', error);
            }
        }

        GetData();
    }, [s_Series]);

    return (
        <div className="d-flex flex-grow-1">
            <SideNavbar Links={[
                  { link: "/Data", label: "Data Explanation" }
                , { link: "/Data/RawData", label: "Raw Data Extract" }
                , { link: "/Data/AdjustData", label: "Cleaning the Data" }
                , { link: "/Data/DataPrep", label: "Prepping the Data" }
                , { link: "/Data/Hypothesis", label: "Hypothesis Resolution" }
            ]} />
            <MainContent>
                <Dropdown
                    updateValue={s_setSeries}
                    defaultStateValue={{ label: "Select Series", value: "" }}
                    listItems={[
                        { label: "Commercial/Industrial Loans", value: "BUSLOANS" }
                        , { label: "USA GDP", value: "GDP" }
                        , { label: "Imports Goods/Services", value: "IMPGS" }
                        , { label: "Exports Goods/Services", value: "EXPGS" }
                        , { label: "Unemployment Rate", value: "UNRATE" }
                        , { label: "Prime Loan Rate", value: "DPRIME" }
                        , { label: "Commercial Bank Deposits", value: "DPSACBW027SBOG" }
                        , { label: "Residential Construction $$", value: "TLRESCONS" }
                        , { label: "Residential Real Estate Loans", value: "RHEACBW027SBOG" }
                        , { label: "Consumer Price Index", value: "CPIAUCSL" }]} />
                <DataGraph
                    lineKey="value"
                    XLabelsKey="date"
                    data={s_Data} />
                <div>
                    <p>Here we can visualize the individual datasets.</p>
                </div>
            </MainContent>
        </div>
    );
}

export default DataVisualization;