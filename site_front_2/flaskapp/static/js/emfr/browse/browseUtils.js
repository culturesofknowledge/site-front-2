import {updateFormValue} from "../domUtils";
export function updateFormValue(field, vlaue) {
    updateFormValue('#browse_form', field, vlaue);
}

export function isSubset(superset, subset) {
    return subset.every(item => superset.includes(item));
}

