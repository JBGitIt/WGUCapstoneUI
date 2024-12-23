import React from "react";
import PropTypes from 'prop-types';
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";


function DataGraph({ data, dataKey }) {

    if (data == undefined) {
        return <p>No Data Element</p>
    }

    if (data.length == 0) {
        return <p>No Data Element</p>
    }

    if (data.length == 1 && data[0] == "Loading...") {
        return <p>Loading...</p>
    }

    const countByProperty = (data, property) => {
        return data.reduce((acc, item) => {
            acc[item[property]] = (acc[item[property]] || 0) + 1;
            return acc;
        }, {});
    };

    const labelMapping = {
        true: "Correct",
        false: "Incorrect",
    };

    const processedData = Object.entries(countByProperty(data, dataKey)).map(([name, value]) => ({
        name: labelMapping[name] || name, // Map to custom labels or keep original
        value,
    }));

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    return (
        <PieChart width={400} height={400}>
            <Pie
                data={processedData}
                cx={200} // Center X
                cy={200} // Center Y
                innerRadius={60} // For a donut chart effect
                outerRadius={120} // Pie radius
                fill="#8884d8"
                dataKey="value"
                label
            >
                {processedData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
            </Pie>
            <Tooltip />
            <Legend />
        </PieChart>
    );
}

DataGraph.propTypes = {
    dataKey: PropTypes.string.isRequired,
    data: PropTypes.arrayOf(
        PropTypes.object
    )
};

export default DataGraph;
