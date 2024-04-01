import {updateFormValue as _updateFormValue} from "../domUtils";
export function updateFormValue(field, value) {
    _updateFormValue('#browse_form', field, value);
}

export function isSubset(superset, subset) {
    return subset.every(item => superset.includes(item));
}

