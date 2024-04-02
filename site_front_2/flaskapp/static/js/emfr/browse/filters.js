import {getMetaContent} from "../domUtils";
import * as browseUtils from "./browseUtils";
import * as reactUtils from '../reactUtils';
import React from 'react';

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

function Filters(checkedFilters) {
    const filters1 = [
        ['Male', 'gender:male',],
        ['Female', 'gender:female',],
        ['Unknown', 'gender:unknown',],
    ]
    const filters2 = [
        ['Letters Written', 'written',],
        ['Letters Received', 'received',],
        ['Letters Mentioning', 'mentioned',],
    ]

    function handleFilterChange() {
        const selectedFilters = getSelectedFilters();
        console.log(selectedFilters);

        // show/hide filterable elements
        $('.filterable[filter]').each((i, v) => {
            const $v = $(v);
            const filters = $v.attr('filter').split(' ');
            browseUtils.isSubset(selectedFilters, filters) ? $v.show() : $v.hide();
        });

        // update form
        browseUtils.updateFormValue('filters', selectedFilters.join(' '));
    }


    function toFilters(labelValuePairs) {
        return labelValuePairs.map(([label, value], i) => (
            <Filter
                key={i}
                label={label}
                value={value}
                onChange={handleFilterChange}
                checked={checkedFilters.includes(value)}
                className="h-5"
            />
        ))
    }

    return (
        <div className="filter flex flex-row space-x-4 justify-center mb-12 items-center">
            {toFilters(filters1)}
            <span>|</span>
            {toFilters(filters2)}
        </div>
    );
}


export function renderFilters(containerSelector = '#react-container') {
    const filterValues = getMetaContent('filters').split(' ');
    reactUtils.renderInContainer(Filters(filterValues), containerSelector);
}

function getSelectedFilters() {
    return $('.filter-cb')
        .filter((i, v) => v.checked)
        .map((i, v) => v.value)
        .get();
}

