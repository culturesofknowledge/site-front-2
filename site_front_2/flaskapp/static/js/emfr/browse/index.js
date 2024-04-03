export {renderFilters} from "./filters";
export {renderLetterSelection} from "./letterSelection";
export {renderTopBtn} from "./topBtn";
import * as browseUtils from "./browseUtils";

export function handleLetterClick(e) {
    e.preventDefault();
    browseUtils.updateFormValue('letter', e.target.innerText);
    document.getElementById('browse_form').submit();

}