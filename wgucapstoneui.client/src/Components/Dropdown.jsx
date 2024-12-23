import React, { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import '../../node_modules/bootstrap/dist/css/bootstrap.min.css';

/**
 * Component for displaying a drop down selection
 * @param {} defaultStateValue
 * @returns
 */
function Dropdown({ defaultStateValue, listItems, updateValue, selectedValue }) {
    const [s_isOpen, s_setIsOpen] = useState(false);
    const [s_value, s_setValue] = useState(defaultStateValue);

    // Update the dropdown's displayed value when `selectedValue` changes
    useEffect(() => {
        if (selectedValue !== undefined && selectedValue !== s_value.value) {
            const newLabel = listItems.find(item => item.value === selectedValue)?.label || defaultStateValue.label;
            s_setValue({ label: newLabel, value: selectedValue });
        }
    }, [selectedValue, listItems, defaultStateValue]);

    function toggleDropdown() {
        s_setIsOpen(!s_isOpen);
    }

    function handleItemClick(label, value) {
        s_setValue({ label, value }); // Update the selected value
        s_setIsOpen(false); // Close the dropdown
        updateValue(value); // Notify parent of the selected value
    }

    return (
        <div className="dropdown" style={{ margin: "20px" }}>
            <button
                className="btn btn-primary dropdown-toggle"
                type="button"
                onClick={toggleDropdown}
            >
                {s_value.label}
            </button>
            {s_isOpen && (
                <ul
                    className="dropdown-menu show rounded"
                    style={{ zIndex: 2 }}
                >
                    {listItems.map((item) => (
                        <li key={item.value} className="hover:bg-primary hover:text-white cursor-pointer">
                            <p
                                className="mb-0 pb-1"
                                onClick={() => handleItemClick(item.label, item.value)}
                            >
                                {item.label}
                            </p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

// PropTypes for validation
Dropdown.propTypes = {
    defaultStateValue: PropTypes.shape({
        label: PropTypes.string.isRequired,
        value: PropTypes.any.isRequired,
    }).isRequired,
    listItems: PropTypes.arrayOf(
        PropTypes.shape({
            label: PropTypes.string.isRequired,
            value: PropTypes.any.isRequired,
        })
    ).isRequired,
    updateValue: PropTypes.func.isRequired,
    selectedValue: PropTypes.any,
};

export default Dropdown;
