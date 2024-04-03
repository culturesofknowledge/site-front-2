import React, {useEffect} from 'react';
import * as reactUtils from "../reactUtils";
import {bindElementsEvent} from "../reactUtils";
import {getMetaContent, getStoreItemJson, setStoreItemJson} from "../domUtils";

const $ = require('jquery');

function Item({uuid, name, onClick}) {
    return (
        <div className={
            "group rounded bg-sky-200 hover:bg-sky-400 " +
            "p-2 my-3 cursor-pointer opacity-80"}
             onClick={(e) => onClick(uuid, name)}
        >
            <span className="text-sm text-gray-700 ">{name}</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                 stroke="currentColor" className="hidden w-6 h-6 group-hover:inline">
                <path strokeLinecap="round" strokeLinejoin="round"
                      d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"/>
            </svg>
        </div>
    )
}


class TableCheckboxes {
    constructor() {
        this.checkboxSelector = '.letterData input[type="checkbox"]';
    }

    syncChecked(selectedUuids) {
        $('.letterData input[type="checkbox"]:checked')
            .filter((i, v) => !selectedUuids.includes(v.value))
            .prop('checked', false);
        $('.letterData input[type="checkbox"]:not(:checked)')
            .filter((i, v) => selectedUuids.includes(v.value))
            .prop('checked', true);
    }
}



function LetterSelection() {

    const [curIdValues, setCurIdValues] = React.useState(
        getStoreItemJson('curIdValues') || []
    );
    const tableCheckboxes = new TableCheckboxes();


    useEffect(() => {
        tableCheckboxes.syncChecked(curIdValues.map(v => v[0]));
        setStoreItemJson('curIdValues', curIdValues);
    }, [curIdValues]);


    function addCurIdValues(idValue) {
        setCurIdValues([...curIdValues, idValue]);
    }

    function removeCurIdValues(uuid) {
        setCurIdValues(curIdValues.filter(v => v[0] !== uuid));
    }

    const handleTableCheckboxChange = function (e) {
        const letterDataEle = $(e.target).closest('.letterData')[0]
        const uuid = getMetaContent('uuid', letterDataEle);
        if (e.target.checked) {
            const idValue = [
                uuid, getMetaContent('name', letterDataEle)
            ];
            addCurIdValues(idValue);
        } else {
            removeCurIdValues(uuid);
        }
    };

    function handleItemClick(uuid, name) {
        removeCurIdValues(uuid);
    }

    bindElementsEvent(tableCheckboxes.checkboxSelector, 'change', handleTableCheckboxChange);


    return (
        curIdValues.length ? <div className={
            "w-56 mr-6 px-4 " +
            "border-y border-y-amber-300 " +
            "border-solid border-x-0 "}>


            <h3>Current selection:</h3>
            <div>
                {curIdValues?.map(([id, value], i) => (
                    <Item key={i} uuid={id} name={value} onClick={handleItemClick}/>
                ))}
            </div>

            <button>Show Letters</button>
            {/*  KTODO go to Profile page on click  */}
        </div> : <></>
    )

}

export function renderLetterSelection(containerSelector = '#react-container') {
    reactUtils.renderInContainer(<LetterSelection/>, containerSelector);
}
