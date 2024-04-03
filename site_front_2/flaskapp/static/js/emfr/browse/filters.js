import {getStoreItemJson, setStoreItemJson} from "../domUtils";
import * as browseUtils from "./browseUtils";
import * as reactUtils from '../reactUtils';
import React, {useEffect} from 'react';

const $ = require('jquery');


function Filter({label, value, onChange, checked, className}) {
    return (
        <label className={className}>
            <input
                type="checkbox"
                className="filter-cb"
                value={value}
                onChange={onChange}
                defaultChecked={checked}
            /> {label}
        </label>
    );
}

const FILTERS = {
    'gender:male': 'Male',
    'gender:female': 'Female',
    'gender:unknown': 'Unknown',
    'written': 'Letters Written',
    'received': 'Letters Received',
    'mentioned': 'Letters Mentioning',
}

function Filters({checkedFilters}) {
    const [selectedFilters, setSelectedFilters] = React.useState(checkedFilters);
    const filters1 = [
        'gender:male',
        'gender:female',
        'gender:unknown',
    ]
    const filters2 = [
        'written',
        'received',
        'mentioned',
    ]

    useEffect(() => {
        console.log(selectedFilters);

        // show/hide filterable elements
        $('.filterable[filter]').each((i, v) => {
            const $v = $(v);
            const filters = $v.attr('filter').split(' ');
            browseUtils.isSubset(selectedFilters, filters) ? $v.show() : $v.hide();
        });

        // update filters
        setStoreItemJson('peopleFilters', selectedFilters);
    }, [selectedFilters]);

    function handleFilterChange() {
        setSelectedFilters(getSelectedFilters());
    }


    function toFilters(labelValuePairs) {
        return labelValuePairs.map(([label, value], i) => (
            <Filter
                key={i}
                label={label}
                value={value}
                onChange={handleFilterChange}
                checked={selectedFilters.includes(value)}
                className="h-5"
            />
        ))
    }

    function toLabelValuePairs(keys) {
        return keys.map(k => [FILTERS[k], k]);
    }

    return (
        <div className="filter flex flex-row space-x-4 justify-center mb-12 items-center">
            {toFilters(toLabelValuePairs(filters1))}
            <span>|</span>
            {toFilters(toLabelValuePairs(filters2))}
        </div>
    );
}


export function renderFilters(containerSelector = '#react-container') {
    const filterValues = getStoreItemJson('peopleFilters') || Object.keys(FILTERS);
    reactUtils.renderInContainer(<Filters checkedFilters={filterValues} />, containerSelector);
}

function getSelectedFilters() {
    return $('.filter-cb')
        .filter((i, v) => v.checked)
        .map((i, v) => v.value)
        .get();
}

