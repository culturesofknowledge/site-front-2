const jquery = require('jquery');
const $ = jquery;

export function handleLetterClick(e) {
    e.preventDefault();
    document.getElementById('selected_letter').value = e.target.innerText;
    document.getElementById('browse_form').submit();
}

function onFilterChange() {
    const selectedFilters = getSelectedFilters();
    // const values = document.querySelectorAll()..map((i, v) => e.value);
    // $('.filter-cb').
    console.log(selectedFilters);
    $('.filterable[filter]').each((i, v) => {
        const $v = $(v);
        const filters = $v.attr('filter').split(' ');
        arraysIntersect(selectedFilters, filters) ? $v.show() : $v.hide();
    })
}

function arraysIntersect(array1, array2) {
    return array1.some(item => array2.includes(item));
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

