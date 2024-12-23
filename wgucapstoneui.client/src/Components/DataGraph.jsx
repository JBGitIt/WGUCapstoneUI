import React from "react";
import PropTypes from 'prop-types';
import { LineChart, Line, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ResponsiveContainer, ComposedChart } from "recharts";

/**
 * This element is for displaying the base data extracted from the FRED API
 * @param {string} lineKey this is the key for the data that forms our line
 * @param {string} XLabelsKey this is the key for the labels on the X-axis of our chart
 * @param {Array} data this is an array of objects representing our data points
 * @returns A line graph representation of the data contained in the data parameter
 */
function DataGraph({ lineKey, XLabelsKey, data }) {

    /*if there is no data we can't render a graph*/
    if (data == undefined) {
        return <p>No Data Element</p>
    }

    if (data.length == 0) {
        return <p>No Data Element</p>
    }

    /*we can pass a collection with only the string value "Loading..." to display the loading message*/
    if (data.length == 1 && data[0] == "Loading...") {
        return <p>Loading...</p>
    }

    return (
        <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={XLabelsKey} />
                <YAxis  />
                <Tooltip />
                <Line type="monotone" dataKey={lineKey} stroke="#ff7300" dot={false} />
            </LineChart>
        </ResponsiveContainer>
    );
}

DataGraph.propTypes = {
    lineKey: PropTypes.string,
    XLabelsKey: PropTypes.string,
    data: PropTypes.arrayOf(
        PropTypes.object
    )
};

export default DataGraph;
