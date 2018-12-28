import React from 'react';
import {
    mdiFormatSuperscript,
    mdiFormatSubscript
} from '@mdi/js';

import SvgIcon from '@material-ui/core/SvgIcon';

export const FormatSubscriptIcon = (props) => {
    return (
        <SvgIcon {...props}>
            <path d={mdiFormatSubscript} />
        </SvgIcon>
    );
};

export const FormatSuperscriptIcon = (props) => {
    return (
        <SvgIcon {...props}>
            <path d={mdiFormatSuperscript} />
        </SvgIcon>
    );
};

