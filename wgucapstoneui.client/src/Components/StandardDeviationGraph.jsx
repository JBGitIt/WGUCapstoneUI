import React from "react";
import PropTypes from 'prop-types';
import { LineChart, Line, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ResponsiveContainer, ComposedChart } from "recharts";

//const data = [
//    { name: "Jan", line1: 400, line2: 300, line3: 200, area:[400,200] },
//    { name: "Feb", line1: 450, line2: 350, line3: 250, area: [450,250] },
//    { name: "Mar", line1: 500, line2: 400, line3: 300, area: [500,300] },
//    { name: "Apr", line1: 550, line2: 450, line3: 350, area: [550,350] },
//];

function StandardDeviationGraph({ areaKeys, topLineKey, bottomLineKey, midLineKey, testLineKey, XLabelsKey, YMin, YMax, data }) {
    data.forEach(function (row) {
        row.areaKey = [row[areaKeys[0]], row[areaKeys[1]]]
    })
    return (
        <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={XLabelsKey} />
                <YAxis domain={[YMin, YMax]} />
                <Tooltip />
                <Area
                    type="monotone"
                    dataKey="areaKey"
                    stroke="none"
                    fill="#ff7300"
                    fillOpacity={0.3}
                    baseValue={(dataMin) => data.find((d) => d.name === dataMin.name).bottomLineKey}
                />
                <Line type="monotone" dataKey={topLineKey} stroke="#ff7300" dot={false} />
                <Line type="monotone" dataKey={midLineKey} stroke="#ff7300" strokeDasharray="5 5" dot={false} />
                <Line type="monotone" dataKey={testLineKey} stroke="#8884d8" dot={false} />
                <Line type="monotone" dataKey={bottomLineKey} stroke="#ff7300" dot={false} />
            </ComposedChart>
        </ResponsiveContainer>
    );
}

StandardDeviationGraph.propTypes = {
    areaKeys: PropTypes.arrayOf(
        PropTypes.string
    ).isRequired,
    topLineKey: PropTypes.string,
    bottomLineKey: PropTypes.string,
    midLineKey: PropTypes.string,
    testLineKey: PropTypes.string,
    XLabelsKey: PropTypes.string,
    YMin: PropTypes.number,
    YMax: PropTypes.number,
    data: PropTypes.arrayOf(
        PropTypes.object
    )
};

export default StandardDeviationGraph;
