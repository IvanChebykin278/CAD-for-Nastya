import React, { Component } from 'react';
import C from './constants';
import './App.css';
import Scene from './scene';

import Input from './components/Input';

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';

import "@ui5/webcomponents/dist/Button";
import "@ui5/webcomponents/dist/Card";

export default class App extends Component {

  constructor() {
    super();

    this.state = {
      scene: new Scene(),
      transfer: { 
        [C.TX]: 0, 
        [C.TY]: 0, 
        [C.TZ]: 0 
      },
      scale: {
        [C.TX]: 1, 
        [C.TY]: 1, 
        [C.TZ]: 1 
      },
      rotate: {
        [C.TX]: 0, 
        [C.TY]: 0, 
        [C.TZ]: 0 
      },
      shift: 0,
      focus: 0
    };

    // ссылки на элементы
    this.uploadBtn = React.createRef();
    this.drawBtn = React.createRef();
    this.sweepBtn = React.createRef();
    this.defaultBtn = React.createRef();

    // биндинг хандлеров
    this.pressDraw = this.pressDraw.bind(this);
    this.pressSweep = this.pressSweep.bind(this);
    this.pressDefault = this.pressDefault.bind(this);
    this.pressOpenFile = this.pressOpenFile.bind(this);
    this.pressScale = this.pressScale.bind(this);
    this.pressShift = this.pressShift.bind(this);
    this.pressFocus = this.pressFocus.bind(this);
    this.pressTransfer = this.pressTransfer.bind(this);
    this.pressRotate = this.pressRotate.bind(this);
    this.changeFocus = this.changeFocus.bind(this);
    this.changeRotate = this.changeRotate.bind(this);
    this.changeScale = this.changeScale.bind(this);
    this.changeShift = this.changeShift.bind(this);
    this.changeTrasfer = this.changeTrasfer.bind(this);

  }

  // press draw
  pressDraw() {
    this.state.scene.draw();
  }

  // press sweep
  pressSweep() {
    this.state.scene.setSweep();
  }

  // press default
  pressDefault() {
    this.state.scene.setDefault();
  }

  // press open file
  pressOpenFile() {
    document
      .forms['uploadForm']
      .elements['uploadInput']
      .files[0]
      .text()
      .then(text => {
        this.state.scene.uploadScene(text);
      });
  }

  /*Хандлеры матриц преобразования*/

  // press transfer
  pressTransfer(name, option) {

    const value = option === 'add' ? this.state.transfer[name] : -this.state.transfer[name];

    this.state.scene.addTransferMatrix(
      value,
      name
    );
    this.state.scene.draw();
  }

  // press scale
  pressScale(name, option) {

    const value = option === 'add' ? this.state.scale[name] : 1 / this.state.scale[name];

    this.state.scene.addScaleMatrix(
      value,
      name
    );
    this.state.scene.draw();
  }

  // press rotate
  pressRotate(name, option) {

    const value = option === 'add' ? this.state.rotate[name] : -this.state.rotate[name];

    this.state.scene.addRotateMatrix(
      value,
      name
    );
    this.state.scene.draw();
  }

  // press shift
  pressShift(name, option) {

    const value = option === 'add' ? this.state.shift : -this.state.shift;

    this.state.scene.addShiftMatix(value);
    this.state.scene.draw();
  }

  // press focus
  pressFocus(name, option) {

    const value = option === 'add' ? this.state.focus : -this.state.focus;

    this.state.scene.addFocusMatrix(value);
    this.state.scene.draw();
  }

  // change transfer
  changeTrasfer(name, value) {
    this.setState({
      ...this.state,
      transfer: {
        ...this.state.transfer,
        [name]: Number(value)
      }
    });
  }


  // change scale
  changeScale(name, value) {
    this.setState({
      ...this.state,
      scale: {
        ...this.state.scale,
        [name]: Number(value)
      }
    });
  }

  // change rotate
  changeRotate(name, value) {
    this.setState({
      ...this.state,
      rotate: {
        ...this.state.rotate,
        [name]: Number(value)
      }
    });
  }

  // change shift
  changeShift(name, value) {
    this.setState({
      ...this.state,
      shift: Number(value)
    });
  }

  // change focus
  changeFocus(name, value) {
    this.setState({
      ...this.state,
      focus: Number(value)
    });
  }

  componentDidMount() {

    const canvas = document.getElementById('canvas');
    const drawer = document.getElementById('drawer');

    canvas.width = drawer.clientWidth;
    canvas.height = drawer.clientHeight;

    this.uploadBtn.current.addEventListener('click', event => {
      this.pressOpenFile(event);
    });
    this.drawBtn.current.addEventListener('click', event => {
      this.pressDraw(event);
    });
    this.sweepBtn.current.addEventListener('click', event => {
      this.pressSweep(event);
    });
    this.defaultBtn.current.addEventListener('click', event => {
      this.pressDefault(event);
    });

  }

  render() {
    return (
      <main id='app'>
        <div id='header'>
          <Card className='head-group' raised>
            <CardContent className='content' style={{padding: '5px'}}>
              <div>
                <ui5-button ref={this.drawBtn}>Отрисовать</ui5-button>
                <ui5-button ref={this.sweepBtn}>Вписать в экран</ui5-button>
                <ui5-button ref={this.defaultBtn}>Исходное состояние</ui5-button>
                <ui5-button ref={this.uploadBtn}>Загрузить сцену</ui5-button>
              </div>
              <form id='uploadForm'>
                <input id='uploadInput' type='file' required />
              </form>
            </CardContent>
          </Card>
        </div>
        <div id='drawer'>
          <canvas id='canvas' width='0' height='0' />
        </div>
        <div id='functions'>
          <Card className='func-group' raised>
            <CardContent style={{padding: '5px'}}>
              <Typography variant='overline'>Перенос</Typography>
              <Input name={C.TX} label="ось Х" onClick={this.pressTransfer} onChange={this.changeTrasfer} />
              <Input name={C.TY} label="ось Y" onClick={this.pressTransfer} onChange={this.changeTrasfer} />
              <Input name={C.TZ} label="ось Z" onClick={this.pressTransfer} onChange={this.changeTrasfer} />
            </CardContent>
          </Card>
          <Card className='func-group' raised>
            <CardContent style={{padding: '5px'}}>
              <Typography variant='overline'>Поворот</Typography>
              <Input name={C.TX} label="ось Х" onClick={this.pressRotate} onChange={this.changeRotate} />
              <Input name={C.TY} label="ось Y" onClick={this.pressRotate} onChange={this.changeRotate} />
              <Input name={C.TZ} label="ось Z" onClick={this.pressRotate} onChange={this.changeRotate} />
            </CardContent>
          </Card>
          <Card className='func-group' raised>
            <CardContent style={{padding: '5px'}}>
              <Typography variant='overline'>Масштаб</Typography>
              <Input name={C.TX} label="ось Х" onClick={this.pressScale} onChange={this.changeScale} />
              <Input name={C.TY} label="ось Y" onClick={this.pressScale} onChange={this.changeScale} />
              <Input name={C.TZ} label="ось Z" onClick={this.pressScale} onChange={this.changeScale} />
            </CardContent>
          </Card>
          <Card className='func-group' raised>
            <CardContent style={{padding: '5px'}}>
              <Typography variant='overline'>Сдвиг</Typography>
              <Input name={C.TX} label="ось Х" onClick={this.pressShift} onChange={this.changeShift} />
            </CardContent>
          </Card>
          <Card className='func-group' raised>
            <CardContent style={{padding: '5px'}}>
              <Typography variant='overline'>ОПП</Typography>
              <Input name={C.TX} label="ось Х" onClick={this.pressFocus} onChange={this.changeFocus} />
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }
}
