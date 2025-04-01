import React, { useState } from 'react';

const PriceRangeFilter = ({ onFilterChange }) => {
    const [selectedRange, setSelectedRange] = useState(null);

    const priceRanges = [
        { id: 1, label: 'Under $100', min: 0, max: 100 },
        { id: 2, label: '$100 - $500', min: 100, max: 500 },
        { id: 3, label: '$500 - $1000', min: 500, max: 1000 },
        { id: 4, label: 'Over $1000', min: 1000, max: Infinity }
    ];

    const handleRangeChange = (range) => {
        setSelectedRange(range);
        if (onFilterChange) {
            onFilterChange(range);
        }
    };

    const clearFilter = () => {
        setSelectedRange(null);
        if (onFilterChange) {
            onFilterChange(null);
        }
    };

    return (
        <div className="price-range-filter card">
            <div className="price-range-header">
                <h3>Price Range</h3>
                {selectedRange && (
                    <button 
                        className="clear-filter-btn"
                        onClick={clearFilter}
                        title="Clear filter"
                    >
                        Clear
                    </button>
                )}
            </div>
            {priceRanges.map(range => (
                <div key={range.id} className="price-range-option">
                    <label>
                        <input
                            type="radio"
                            name="price-range"
                            checked={selectedRange?.id === range.id}
                            onChange={() => handleRangeChange(range)}
                        />
                        <span>{range.label}</span>
                    </label>
                </div>
            ))}
        </div>
    );
};

export default PriceRangeFilter;
