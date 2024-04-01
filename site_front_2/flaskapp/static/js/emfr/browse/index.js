import * as filters from "./filters";
import * as browseUtils from "./browseUtils";

const $ = require('jquery');


export function handleLetterClick(e) {
    e.preventDefault();
    browseUtils.updateFormValue('letter', e.target.innerText);
    document.getElementById('browse_form').submit();

}


export function init(filtersSelector) {
    filters.renderFilters(filtersSelector);
}

