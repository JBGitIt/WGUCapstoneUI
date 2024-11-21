import React from 'react';

function TopNavbar() {
    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow">
            <div className="container-fluid">
                <a className="navbar-brand" href="/">Home</a>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#topNavbar">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div>
                    <ul className="collapse navbar-collapse" id="topNavbar">
                        <li className="nav-item">
                            <a className="nav-link" href="/about">About</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="/services">Services</a>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
}

export default TopNavbar;