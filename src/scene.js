import C from './constants';

const numbers = require('numbers');

const RADIAN = Math.PI / 180;

// еденичная матрица
const UNIT_MATRIX = [
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1]
];

// функция копирования массива
const copy = array => {
    return JSON.parse(JSON.stringify(array));
};

// функция нормализации
const normalize = point => {
    return copy([point[0] / point[3], point[1] / point[3], point[2] / point[3], point[3] / point[3]]);
};

export default class Scene {

    // конструктор класса
    constructor() {

        // "подкласс" (объект с методами по факту) для вычисления базиса Бола
        this.g = {
            0: (t) => {
                return (1 - t) * (1 - t);
            },
            1: (t) => {
                return 2 * t * (1 - t) * (1 - t);
            },
            2: (t) => {
                return 2 * (1 - t) * t *t;
            },
            3: (t) => {
                return t * t;
            }
        };

        // массив преобразований
        this.transformSteck = [copy(UNIT_MATRIX)];

        // конечная матрица преобразования
        this.transformMatrix = copy(UNIT_MATRIX);

        // базовые объеты сцены сцены
        this.basePoints = [];
        this.lines = [];
        this.splines = [];
        this.surfaces = [];

        // backup сцены
        this.backupPoints = [];

        // настройки для вписания в экран
        this.sweep = {
            apply: false,
            scale: 1,
            centerRegion: {
                x: 0,
                y: 0
            }
        };

    }

    // public метод: добавление матрицы сдвига в стек преоразований
    addTransferMatrix(value, axis) {

        const tansferMatrix = copy(UNIT_MATRIX);

        switch (axis) {
            case C.TX:
                tansferMatrix[3][0] = value;
                break;
            case C.TY:
                tansferMatrix[3][1] = value;
                break;
            case C.TZ:
                tansferMatrix[3][2] = value;
                break;
            default:
                throw Error(`Unexpected token ${axis}`);
        }
        
        this.transformSteck.push(tansferMatrix);
    }

    // public метод: добавление матрицы масштаирования в стек преоразований
    addScaleMatrix(value, axis) {

        const scaleMatrix = copy(UNIT_MATRIX);

        switch (axis) {
            case C.TX:
                scaleMatrix[0][0] = value;
                break;
            case C.TY:
                scaleMatrix[1][1] = value;
                break;
            case C.TZ:
                scaleMatrix[2][2] = value;
                break;
            default:
                throw Error(`Unexpected token ${axis}`);
        }

        this.transformSteck.push(scaleMatrix); 
    }

    // public метод: добавление матрицы поворота в стек преобразований 
    addRotateMatrix(value, axis) {
        const a = value * RADIAN;
        switch (axis) {
            case C.TX:
                this.transformSteck.push([
                    [1, 0, 0, 0],
                    [0, Math.cos(a), Math.sin(a), 0],
                    [0, -Math.sin(a), Math.cos(a), 0],
                    [0, 0, 0, 1]
                ]);
                break;
            case C.TY:
                this.transformSteck.push([
                    [Math.cos(a), 0, -Math.sin(a), 0],
                    [0, 1, 0, 0],
                    [Math.sin(a), 0, Math.cos(a), 0],
                    [0, 0, 0, 1]
                ]);
                break;
            case C.TZ:
                this.transformSteck.push([
                    [Math.cos(a), Math.sin(a), 0, 0],
                    [-Math.sin(a), Math.cos(a), 0, 0],
                    [0, 0, 1, 0],
                    [0, 0, 0, 1]
                ]);
                break;
            default:
                throw Error(`Unexpected token ${axis}`);
        }
    }

    // public метод: добавление матрицы косого сдвига (Х по У) в стек преобразований
    addShiftMatix(value) {

        const shiftMatrix = copy(UNIT_MATRIX);

        shiftMatrix[1][0] = value;
        
        this.transformSteck.push(shiftMatrix);
    }

    // public метод: добавление матрицы ОПП (по Z) в стек преобразований
    addFocusMatrix(value) {

        const focusMatix = copy(UNIT_MATRIX);

        focusMatix[2][3] = value === 0 ? 0 : 1 / value;

        this.transformSteck.push(focusMatix);
    }

    // public метод: возврат в исходное состояние сцены
    setDefault() {
        this.transformSteck = [copy(UNIT_MATRIX)];

        this.transformMatrix = copy(UNIT_MATRIX);

        this.sweep = {
            apply: false,
            scale: 1,
            centerRegion: {
                x: 0,
                y: 0
            }
        };
    }

    // public метод: вычисление настроек для вписывания в экран
    setSweep() {
        const canvas = document.getElementById('canvas');

        var points = copy(this.backupPoints);
        var xMin = points[0][0];
        var xMax = points[0][0];
        var yMin = points[0][1];
        var yMax = points[0][1];

        for(let i = 0; i < points.length; i++) {
            if(points[i][0] > xMax) {
                xMax = points[i][0];
            }

            if(points[i][0] < xMin) {
                xMin = points[i][0];
            }

            if(points[i][1] > yMax) {
                yMax = points[i][1];
            }

            if(points[i][1] < yMin) {
                yMin = points[i][1];
            }
        }

        var regionWidth = Math.abs(xMax - xMin);
        var regionHeight = Math.abs(yMax - yMin);

        var screenWidth = canvas.width;
        var screenHeight = canvas.height;

        var screen = 0;

        if(screenWidth > screenHeight) {
            screen = screenHeight - 100;
        } else {
            screen = screenWidth - 100;
        }
    
        var scale = 1;
    
        if(regionWidth > regionHeight) {
            scale = screen / regionWidth;
        } else {
            scale = screen / regionHeight;
        }

        this.sweep.apply = true;
        this.sweep.scale = scale;
        this.sweep.centerRegion = {
            x: xMin + regionWidth / 2,
            y: yMin + regionHeight / 2
        };

        this.transformSteck.push([
            [scale, 0, 0, 0],
            [0, scale, 0, 0],
            [0, 0, scale, 0],
            [0, 0, 0, 1]
        ]);
    }

    // public метод: загрузить сцену
    uploadScene(text) {
        const scene = JSON.parse(text);

        if(!scene.points) throw Error('scene invalide');

        this.basePoints = copy(scene.points);
        this.lines = scene.lines ? copy(scene.lines) : [];
        this.splines = scene.splines ? copy(scene.splines) : [];
        this.surfaces = scene.surfaces ? copy(scene.surfaces) : [];

    }

    // public метод: отрисовать сцену
    draw() {
        const canvas = document.getElementById('canvas');

        console.log(this.transformSteck);

        if(canvas.getContext) {

            const context = canvas.getContext('2d');
            var backupPoints = [];

            if(this.sweep.apply) {
                debugger;
                context.setTransform(1, 0, 0, 1, 0, 0);
                context.clearRect(0, 0, canvas.width, canvas.height);

                const scale = this.sweep.scale;
                const centerRegion = this.sweep.centerRegion;

                context.translate(canvas.width / 2, canvas.height / 2);
                context.scale(1, -1);
                context.translate(-centerRegion.x*scale, -centerRegion.y*scale);

            } else {
                context.setTransform(1, 0, 0, 1, 0, 0);
                context.clearRect(0, 0, canvas.width, canvas.height);

                context.translate(canvas.width / 2, canvas.height / 2);
                context.scale(1, -1);
            }

            context.strokeStyle = 'white';

            for(let i = 0; i < this.lines.length; i++) {

                const line = this.lines[i];

                const point1 = normalize(numbers.matrix.multiply([this.basePoints[line[0]]], this.multiplyMatrix())[0]);
                const point2 = normalize(numbers.matrix.multiply([this.basePoints[line[1]]], this.multiplyMatrix())[0]);

                context.beginPath();
                context.moveTo(point1[0], point1[1]);
                context.lineTo(point2[0], point2[1]);
                context.closePath();
                context.stroke();

                backupPoints.push(point1);
                backupPoints.push(point2);

            }

            for(let i = 0; i < this.splines.length; i++) {

                var splinePoints = [];

                const spline = this.splines[i];

                for(let t = 0; t < 1.025; t += 0.05) {

                    let p = [0, 0, 0, 0];

                    for(let i = 0; i < spline.length; i++) {
                        const contolPoint = this.basePoints[spline[i]];
                        const subTerm = numbers.matrix.scalar([contolPoint], this.g[i](t))[0];

                        p = numbers.matrix.addition(p, subTerm);
                    }

                    const point = normalize(numbers.matrix.multiply([p], this.multiplyMatrix())[0]);

                    splinePoints.push(point);
                    backupPoints.push(point);
                }

                context.beginPath();
                for(let i = 1; i < splinePoints.length; i++) {
                    context.moveTo(splinePoints[i-1][0], splinePoints[i-1][1]);
                    context.lineTo(splinePoints[i][0], splinePoints[i][1]);
                }
                context.closePath();
                context.stroke();

            }

            for(let s = 0; s < this.surfaces.length; s++) {

                var surface = this.surfaces[s];

                let surfacePoints = [];

                for(let u = 0; u < 1.025; u += 0.05) {
                    let line = [];

                    for(let v = 0; v < 1.025; v += 0.05) {
                        let p = [0, 0, 0, 0];

                        for(let i = 0; i < surface.length; i++) {
                            for(let j = 0; j < surface[i].length; j++) {
                                const controlPoint = this.basePoints[surface[i][j]];
                                const subTerm = numbers.matrix.scalar([controlPoint], this.g[i](u)*this.g[j](v))[0];

                                p = numbers.matrix.addition(p, subTerm); 
                            }
                        }

                        const point = normalize(numbers.matrix.multiply([p], this.multiplyMatrix())[0]);
                        line.push(point);
                        backupPoints.push(point);
                    }

                    surfacePoints.push(line);
                }

                for(let i = 0; i < surfacePoints.length; i++) {
                    context.beginPath();
                    for(let j = 1; j < surfacePoints[i].length; j++) {
                        context.moveTo(surfacePoints[i][j-1][0], surfacePoints[i][j-1][1]);
                        context.lineTo(surfacePoints[i][j][0], surfacePoints[i][j][1]);
                    }
                    context.closePath();
                    context.stroke();
                }

                for(let i = 0; i < surfacePoints.length; i++) {
                    context.beginPath();
                    for(let j = 1; j < surfacePoints[i].length; j++) {
                        context.moveTo(surfacePoints[j-1][i][0], surfacePoints[j-1][i][1]);
                        context.lineTo(surfacePoints[j][i][0], surfacePoints[j][i][1]);
                    }
                    context.closePath();
                    context.stroke();
                }

            }

            this.backupPoints = copy(backupPoints);
        }
    }

    // pivate метод: перемножить матрицы стека преобразований
    multiplyMatrix() {
        
        let multiply = this.transformSteck[0];

        for(let i = 1; i < this.transformSteck.length; i++) {
            multiply = numbers.matrix.multiply(multiply, this.transformSteck[i]);
        }

        return multiply;

    }

}