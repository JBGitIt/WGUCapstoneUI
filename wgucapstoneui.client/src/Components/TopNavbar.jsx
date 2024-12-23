import React from 'react';
import PropTypes from 'prop-types';

function TopNavbar({Links, Active }) {
    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow sticky-top">
            <div className="container-fluid">
                <a className="navbar-brand" href="/">Home</a>
                <div className="navbar-nav" id="topNavbar">
                    <ul className="navbar-nav d-flex flex-row align-items-left gap-3">
                        <li className="nav-item">
                            <a className="nav-link" href="/Data">Data</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="/Model">Model</a>
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