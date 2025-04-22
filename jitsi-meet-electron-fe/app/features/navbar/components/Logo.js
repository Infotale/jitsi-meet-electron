// @flow
import React, { Component } from 'react';
import LogoSVG from '../../../images/infotale.png';

/**
 * Logo component.
 */
export default class Logo extends Component<*> {

    /**
     * Render function of component.
     *
     * @returns {ReactElement}
     */
    render() {
        return <img src={LogoSVG} alt="Infotale Logo" style={{ width: "40px" }} />;
    }
}
