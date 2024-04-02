import {createRoot} from 'react-dom/client';
import React from 'react';

export function App({children}) {
    return (
        // React.StrictMode will trigger render twice in development mode
        <React.StrictMode>
            {children}
        </React.StrictMode>
    );
}

export function renderInContainer(child, containerSelector = '#react-container') {
    const mainElement = document.querySelector(containerSelector);
    if (mainElement) {
        const reactRoot = createRoot(mainElement);
        reactRoot.render(
            <App>
                {child}
            </App>
        );
    }
}


export function bindElementsEvent(selector, eventName, handler) {
    React.useEffect(() => {
        const elements = [...document.querySelectorAll(selector)];
        elements.forEach(ele => {
            ele.addEventListener(eventName, handler);
        });

        return () => {
            elements.forEach(ele => {
                ele.removeEventListener(eventName, handler);
            });
        };
    },);
}