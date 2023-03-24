import React, {FC, Fragment, useEffect, useState} from 'react';
import {Circle, Text} from 'react-konva';
import Point from '../../classes/Point';
import {observer} from 'mobx-react-lite';
import graphStore from '../../stores/GraphStore';
import Konva from 'konva';
import KonvaEventObject = Konva.KonvaEventObject;
import canvasStore from "../../stores/CanvasStore";

const Points = observer((props: {setFrom: (name: string) => void, setTo: (name: string) => void}) => {

    const pointDragHandler = (event: KonvaEventObject<DragEvent>, key: string): void => {
        const position = event.target.position()
        if (event.target instanceof Konva.Circle) {
            graphStore.updatePointCoords(key, position.x, position.y)
        }
        if (event.target instanceof Konva.Text) {
            graphStore.updatePointCoords(key, position.x + 9, position.y + 6)
        }
    }

    const [isFrom, setIsFrom] = useState<boolean>(true);
    const [from, setFrom] = useState<string>();
    const [to, setTo] = useState<string>();
    const onClick = (key: any) => {
        canvasStore.selectPoint(key)
        if (isFrom) {
            setFrom(key);
            props.setFrom(key);
        } else {
            setTo(key);
            props.setTo(key);
        }
        setIsFrom(isFrom => !isFrom);
    }
    return <Fragment>
        {graphStore.points.map((point: Point) => {
            const {x, y, key, colour, radius} = point
            return <Fragment key={key}>
                {console.log(key)}
                <Circle
                    x={x}
                    y={y}
                    radius={radius}
                    fill={key === from || key === to ? '#3bff727a' : 'rgba(0, 98, 255, 0.186)'}
                    onClick={() => onClick(key)}
                    onDblClick={() => graphStore.deletePoint(point)}
                    onDragMove={(event) => pointDragHandler(event, key)}
                    draggable
                />
                <Text
                    x={x - 7}
                    y={y - 30}
                    fontSize={16}
                    text={point.getName()}
                    fill="black"
                    onClick={() => canvasStore.selectPoint(key)}
                    onDblClick={() => graphStore.deletePoint(point)}
                    onDragMove={(event) => pointDragHandler(event, key)}
                    draggable
                    perfectDrawEnabled={false}
                />
            </Fragment>
        })}
    </Fragment>
})

export default Points;