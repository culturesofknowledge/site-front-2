import React, {useEffect} from 'react';
import * as reactUtils from "../reactUtils";

function TopBtn() {
    useEffect(() => {
        window.addEventListener('scroll', function () {
            const topBtn = document.querySelector('.top-btn');
            if (topBtn) {
                if (window.scrollY > 300) {
                    topBtn.style.display = 'grid';
                } else {
                    topBtn.style.display = 'none';
                }
            }
        });
    }, []);

    function handleClick() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    return (

        <div onClick={handleClick} className={
            `top-btn fixed w-16 h-16 rounded-full 
        left-auto top-auto bottom-5 right-5 
        cursor-pointer bg-gray-900 
        text-center grid place-content-center`}>
            <span className={`text-gray-200`}>TOP</span>
        </div>
    )
}

export function renderTopBtn(containerSelector = '#react-container') {
    reactUtils.renderInContainer(<TopBtn/>, containerSelector);
}