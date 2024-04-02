import * as filters from "./filters";
import * as browseUtils from "./browseUtils";
import {renderLetterSelection} from "./letterSelection";

const $ = require('jquery');


export function handleLetterClick(e) {
    e.preventDefault();
    browseUtils.updateFormValue('letter', e.target.innerText);
    document.getElementById('browse_form').submit();

}


export function init(filtersSelector, selectionSelector) {
    filters.renderFilters(filtersSelector);
    renderLetterSelection(selectionSelector)
}

