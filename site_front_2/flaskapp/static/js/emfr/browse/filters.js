const  $ = require('jquery');
import * as browseUtils from "./browseUtils";

// const $ = jquery;
function getSelectedFilters() {
    return $('.filter-cb')
        .filter((i, v) => v.checked)
        .map((i, v) => v.value)
        .get();
}

export function onFilterChange() {
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
