export function updateFormValue(field, vlaue) {
    document.querySelector(`#browse_form input[name="${field}"]`).value = vlaue;
}

export function isSubset(superset, subset) {
    return subset.every(item => superset.includes(item));
}

