import React from 'react';
import PropTypes from 'prop-types';

function Table({ data, title }) {
    if (!(data == null)) {
        if (data == 'Loading') {
            return <p>Loading...</p>
        }
        if (data.length === 0) {
            return <p>No data available</p>;
        }
    }
    else {
        return <p>No data available</p>;
    }
    // Extract column headers from the keys of the first object
    const columns = Object.keys(data[0]);

    return (
        <div className="table-responsive overflow-auto" style={{
            height: "60vh",
            width: "70vw",
        } }>
            <table className="table table-bordered table-striped">
                <caption className="text-center fw-bold" style={{ captionSide: "top" }}>{title}</caption>
                <thead className="sticky-top" style={{ captionSide: "top", zIndex: 1 }}>
                    <tr>
                        {columns.map((col, index) => (
                            <th key={index}>{col}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, index) => (
                        <tr key={index}>
                            {columns.map((col, colIndex) => {
                                const cellValue = row[col];
                                // Format true/false values
                                const formattedValue = typeof cellValue === 'boolean'
                                    ? cellValue ? 'Yes' : 'No'
                                    : cellValue;
                                return <td key={colIndex}>{formattedValue}</td>;
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

Table.propTypes = {
    data: PropTypes.object,
    title: PropTypes.string
}

export default Table;