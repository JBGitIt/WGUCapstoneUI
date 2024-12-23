import React from 'react';
import PropTypes from 'prop-types';
function SideNavbar({ Links }) {
    if (!(Links == null)) {
        return (
            <div className="bg-light p-3 shadow-lg min-vh-100" style={{
                width: '250px'
                , zIndex: 1
                , position: 'sticky'
            }}>
                <nav className="bg-light sidebar sticky-top" style={{
                    top: '60px'
                }}>
                    <h5>Section Navigation</h5>
                    <ul className="nav flex-column">
                        {Links.map((Link) => (
                            <li key={Link.link} className="nav-item">
                                <a className="nav-link" href={Link.link}>{Link.label}</a>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
        )
    }
    else {
        return null;
    }
};

SideNavbar.propTypes = {
    Links: PropTypes.arrayOf(
        PropTypes.shape({
            label: PropTypes.string
            , link: PropTypes.string
        }))
}

export default SideNavbar;