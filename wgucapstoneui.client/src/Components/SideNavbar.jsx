import React from 'react';

const SideNavbar = () => (
    <div className="bg-light p-3 shadow-lg vh-100" style={{
         width: '250px'
        ,zIndex: 1
        , position: 'relative'
}}>
        <h5>Section Navigation</h5>
        <ul className="nav flex-column">
            <li className="nav-item">
                <a className="nav-link" href="#subsection1">Subsection 1</a>
            </li>
            <li className="nav-item">
                <a className="nav-link" href="#subsection2">Subsection 2</a>
            </li>
        </ul>
    </div>
);

export default SideNavbar;