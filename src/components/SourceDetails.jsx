import React from 'react';
import PropTypes from 'prop-types';

const SourceDetails = ({ source, onClose }) => {
    return (
        <div className="source-details-overlay" onClick={onClose}>
            <div className="source-details-modal" onClick={(e) => e.stopPropagation()}>
                <div className="source-details-header">
                    <h4>Source Details</h4>
                    <button className="close-button" onClick={onClose}>×</button>
                </div>
                <div className="source-details-content">
                    <div className="source-info">
                        <p><strong>Document Index:</strong> {source.documentIndex}</p>
                        <p><strong>Chunk Index:</strong> {source.chunkIndex}</p>
                        <p><strong>Reference:</strong> {source.label}</p>
                    </div>
                    <div className="source-description">
                        <p>This information was retrieved from document {source.documentIndex}, 
                        chunk {source.chunkIndex} of Om's knowledge base.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

SourceDetails.propTypes = {
    source: PropTypes.shape({
        id: PropTypes.number.isRequired,
        documentIndex: PropTypes.number.isRequired,
        chunkIndex: PropTypes.number.isRequired,
        label: PropTypes.string.isRequired
    }).isRequired,
    onClose: PropTypes.func.isRequired
};

export default SourceDetails; 