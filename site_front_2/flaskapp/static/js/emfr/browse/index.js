const jquery = require('jquery');
const $ = jquery;


function updateFormValue(field, vlaue) {
    document.querySelector(`#browse_form input[name="${field}"]`).value = vlaue;
}

export function handleLetterClick(e) {
    e.preventDefault();
    updateFormValue('letter', e.target.innerText);
    document.getElementById('browse_form').submit();
}

function onFilterChange() {
    const selectedFilters = getSelectedFilters();
    console.log(selectedFilters);

    // show/hide filterable elements
    $('.filterable[filter]').each((i, v) => {
        const $v = $(v);
        const filters = $v.attr('filter').split(' ');
        isSubset(selectedFilters, filters ) ? $v.show() : $v.hide();
    });

    // update form
    updateFormValue('filters', selectedFilters.join(' '));
}

function isSubset(superset, subset) {
    return subset.every(item => superset.includes(item));
}

function getSelectedFilters() {
    return $('.filter-cb')
        .filter((i, v) => v.checked)
        .map((i, v) => v.value)
        .get();
}

export function init() {
    $('.filter-cb').on('click', () => onFilterChange());
}

