import React from 'react';
import * as reactUtils from "../reactUtils";
import {bindElementsEvent} from "../reactUtils";
import {getMetaContent} from "../domUtils";

const $ = require('jquery');

function Item({uuid, name, onClick}) {
    return (
        <div>
            <h1>{name}</h1>
        </div>
    )
}


function LetterSelection({idValues = []}) {
    const [curIdValues, setCurIdValues] = React.useState(idValues);

    function addCurIdValues(idValue) {
        // debugger
        let newVar = [...curIdValues, idValue];
        setCurIdValues(newVar);
    }

    function removeCurIdValues(uuid) {
        setCurIdValues(curIdValues.filter(v => v[0] !== uuid));
    }

    const handleChange = function (e) {
        const letterDataEle = $(e.target).closest('.letterData')[0]

        // TOBEREMOVE
        console.log(getMetaContent('name', letterDataEle))
        console.log(getMetaContent('uuid', letterDataEle))

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


    bindElementsEvent('.letterData input[type="checkbox"]', 'change', handleChange);


    return <div>
        <span>Current selection:</span>
        <div>
            {curIdValues?.map(([id, value], i) => <Item key={i} uuid={id} name={value}/>)}
        </div>
    </div>

}

export function renderLetterSelection(containerSelector = '#react-container') {
    reactUtils.renderInContainer(<LetterSelection/>, containerSelector);
}
