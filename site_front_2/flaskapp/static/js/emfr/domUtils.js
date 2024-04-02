export function getMetaContents(name, rootEle = null) {
    rootEle = rootEle || document;
    const metaElements = rootEle.querySelectorAll(`meta[name=${name}]`)
    return Array.from(metaElements).map(e => e.getAttribute('content'));
}

export function getMetaContent(name, rootEle = null) {
    return getMetaContents(name, rootEle)[0];
}

export function updateFormValue(formSelector, field, vlaue) {
    document.querySelector(`${formSelector} input[name="${field}"]`).value = vlaue;
}
