import React from 'react';
import PropTypes from 'prop-types';

function MainContent(props){
    return(
        <div className="p-3 flex-grow-1 min-vh-100" style={{ backgroundColor: 'white' }}>
            <div>
                {props.children}
            </div>
        </div>
    )
}

MainContent.propTypes = {
    children: PropTypes.node,
}

export default MainContent;