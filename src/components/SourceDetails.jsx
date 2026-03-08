import React from 'react';
import PropTypes from 'prop-types';

const SourceDetails = ({ source, onClose }) => {
    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-[rgba(10,8,6,0.6)] backdrop-blur-sm" onClick={onClose}>
            <div
              className="w-[90%] max-w-[420px] overflow-hidden rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] shadow-[var(--shadow-glass-strong)]"
              onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] px-5 py-4 text-[var(--color-text-primary)]">
                    <h4 className="m-0 font-display text-lg italic">Source Details</h4>
                    <button className="text-2xl text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-primary)]" onClick={onClose}>×</button>
                </div>
                <div className="p-5">
                    <div className="space-y-2 text-sm text-[var(--color-text-muted)]">
                        <p><strong>Document Index:</strong> {source.documentIndex}</p>
                        <p><strong>Chunk Index:</strong> {source.chunkIndex}</p>
                        <p><strong>Reference:</strong> {source.label}</p>
                    </div>
                    <div className="mt-4 border-t border-[var(--color-border-muted)] pt-4">
                        <p className="m-0 text-sm leading-relaxed text-[var(--color-text-subtle)]">This information was retrieved from document {source.documentIndex}, 
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