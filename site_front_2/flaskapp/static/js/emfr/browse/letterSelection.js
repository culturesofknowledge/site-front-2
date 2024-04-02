import React, {useEffect} from 'react';
import * as reactUtils from "../reactUtils";
import {bindElementsEvent} from "../reactUtils";
import {getMetaContent} from "../domUtils";

const $ = require('jquery');

function Item({uuid, name, onClick}) {
    return (
        <div>
            <button onClick={(e) => onClick(uuid, name)}>{name}</button>
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
    const [curIdValues, setCurIdValues] = React.useState(JSON.parse(localStorage.getItem('curIdValues') || '[]'));
    const tableCheckboxes = new TableCheckboxes();


    useEffect(() => {
        tableCheckboxes.syncChecked(curIdValues.map(v => v[0]));
        localStorage.setItem('curIdValues', JSON.stringify(curIdValues));
    }, [curIdValues]);


    function addCurIdValues(idValue) {
        setCurIdValues([...curIdValues, idValue]);
    }

    function removeCurIdValues(uuid) {
        setCurIdValues(curIdValues.filter(v => v[0] !== uuid));
    }

    const handleChange = function (e) {
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


    bindElementsEvent(tableCheckboxes.checkboxSelector, 'change', handleChange);


    function handleItemClick(uuid, name) {
        removeCurIdValues(uuid);
    }

    return <div>
        <span>Current selection:</span>
        <div>
            {curIdValues?.map(([id, value], i) => (
                <Item key={i} uuid={id} name={value} onClick={handleItemClick}/>
            ))}
        </div>
    </div>

}

export function renderLetterSelection(containerSelector = '#react-container') {
    reactUtils.renderInContainer(<LetterSelection/>, containerSelector);
}
