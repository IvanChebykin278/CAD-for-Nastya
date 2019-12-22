import React, { Component } from 'react';

import './input.css';

import "@ui5/webcomponents/dist/Label";
import "@ui5/webcomponents/dist/Input.js";
import "@ui5/webcomponents/dist/features/InputSuggestions.js";
import "@ui5/webcomponents/dist/features/InputElementsFormSupport.js"
import "@ui5/webcomponents-icons/dist/json-imports/Icons.js"
import "@ui5/webcomponents/dist/Button";

export default class Input extends Component {

    constructor() {
        super();

        // сслыки на элементы
        this.plusBtn = React.createRef();
        this.minusBtn = React.createRef();
        this.textField = React.createRef();
    }

    render() {
        return (
            <div className='input-root'>
                <ui5-label>{this.props.label}</ui5-label>
                <ui5-input name={this.props.name} ref={this.textField} />
                <ui5-button icon="add" name={this.props.name} ref={this.plusBtn}></ui5-button>
                <ui5-button icon="less" name={this.props.name} ref={this.minusBtn}></ui5-button>
            </div>
        );
    }

    componentDidMount() {

        this.plusBtn.current.addEventListener('click', event => {
            const option = event.target.attributes['icon'].value;
            this.props.onClick(this.props.name, option);
        });

        this.minusBtn.current.addEventListener('click', event => {
            const option = event.target.attributes['icon'].value;
            this.props.onClick(this.props.name, option);
        });

        this.textField.current.addEventListener('change', event => {
            this.props.onChange(this.props.name, event.target.value);
        });

    }
}
