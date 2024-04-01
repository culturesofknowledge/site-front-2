export function metaContent(name) {
    const meta = document.querySelector(`meta[name="${name}"]`);
    return meta ? meta.content : null;
}

export function updateFormValue(formSelector, field, vlaue) {
    document.querySelector(`${formSelector} input[name="${field}"]`).value = vlaue;
}
