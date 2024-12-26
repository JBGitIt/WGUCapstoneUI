import React, { useState, useEffect, useRef } from 'react';
import SideNavbar from "../Components/SideNavbar";
import MainContent from "../Components/MainContent";
import Dropdown from "../Components/Dropdown";
import Table from '../Components/Table';
import HypothesisGraph from '../Components/HypothesisGraph'
function DataVisualization() {

    const [s_pieData, s_setPieData] = useState(undefined);
    var combinedData = useRef();

    const isProduction = process.env.NODE_ENV === 'production';
    const APIprefix = isProduction ? '/CapstoneUIAPI/' : '/';

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch(`${APIprefix}ML/validate?v_INTforestID=2034&v_INTforestVersion=2`);

                if (!response.ok) {
                    throw new Error('Failed to fetch data');
                }

                const pieData = await response.json();

                s_setPieData(pieData.results);
            } catch (error) {
                console.error('Could not fetch data', error);
            }
        }

        fetchData();
    }, []); // Dependencies should remain empty unless `fetchData` needs to re-run.



    return (
        <div className="d-flex flex-grow-1">
            <SideNavbar Links={[
                { link: "/Data", label: "Data Explanation" }
                , { link: "/Data/RawData", label: "Raw Data Extract" }
                , { link: "/Data/AdjustData", label: "Cleaning the Data" }
                , { link: "/Data/DataPrep", label: "Prepping the Data" }
                , { link: "/Data/DataVisualization", label: "Visualizing the Data" }
            ]} />
            <MainContent>
                <HypothesisGraph
                    dataKey="correct"
                    data={s_pieData} />
                <div>
                    <p>
                        The hypothesis I put forward was that we could produce a model based on the selected data series that would predict GDP within a range from low prediction to high with %80 accuracy.
                        The above pie chart shows the ratio of accuracte predictions to inaccurate predictions with Model# 2034 Version# 2. As you can see we managed rougly %86 accuracy so our hypothesis was correct.
                    </p>
                </div>
            </MainContent>
        </div>
    );
}

export default DataVisualization;