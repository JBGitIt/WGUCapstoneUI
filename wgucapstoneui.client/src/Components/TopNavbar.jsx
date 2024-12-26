import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

function TopNavbar({Links, Active }) {
    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow sticky-top">
            <div className="container-fluid">
                <Link className="navbar-brand" to="/">Home</Link>
                <div className="navbar-nav" id="topNavbar">
                    <ul className="navbar-nav d-flex flex-row align-items-left gap-3">
                        <li className="nav-item">
                            <Link className="nav-link" to="/Data">Data</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/Model">Model</Link>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
}

/*TopNavBar.PropTypes = {

}*/

export default TopNavbar;