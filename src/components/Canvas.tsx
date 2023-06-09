import React, {FC, ReactElement, ReactNode, useRef, useState} from 'react';
import {Layer, Line, Stage, Star} from 'react-konva';
import Border from './canvas-components/Border';
import Point from '../classes/Point';
import Konva from 'konva';
import Points from './canvas-components/Points';
import {observer} from 'mobx-react-lite';
import graphStore from '../stores/GraphStore';
import Connections from './canvas-components/Connections';
import ConnectionWeights from './canvas-components/ConnectionWeights';
import ConnectionPreview from './canvas-components/ConnectionPreview';
import CanvasHandler from '../classes/CanvasHandler';
import {runInAction} from 'mobx';
import {ConnectionColours} from "../enums";
import Connection from "../classes/Connection";
import Package from "./canvas-components/Package";
import canvasStore from "../stores/CanvasStore";
import KonvaEventObject = Konva.KonvaEventObject;
import stackStore from "../stores/StackStore";

const Canvas = observer((props: {setFrom: (name: string) => void, setTo: (name: string) => void}) => {

    const stageRef = useRef<Konva.Stage>(null)

    const [connectionPreview, setConnectionPreview] = useState<ReactElement<ReactNode> | null>(null)
    const [hovered, setHovered] = useState<boolean>(false)
    const [hoveredConnection, setHoveredConnection] = useState<Connection | null>(null)

    const onClickStageHandler = (event: KonvaEventObject<PointerEvent>): void => {
        if (event.target === stageRef.current) {
            runInAction(() => canvasStore.selectedPoint = null)
        }
    }

    const onMouseMoveStageHandler = (event: KonvaEventObject<any>): void => {
        const connection = CanvasHandler.detectHoverWeightCircle(event)
        if (connection) {
            setHovered(true)
            setHoveredConnection(connection)
        } else {
            setHovered(false)
            setHoveredConnection(null)
        }
    }

    const addPoint = (event: KonvaEventObject<MouseEvent>, stage: Konva.Stage | null): void => {
        if (event.target === stage) {
            event.evt.preventDefault()
            const mousePos = CanvasHandler.getMousePos(event)
            stackStore.addPoint(mousePos.x, mousePos.y)
        }
    }

    const addConnection = (mousePos: Konva.Vector2d, from: Point): void => {
        const target = CanvasHandler.detectConnection(mousePos, from)
        if (target) stackStore.addConnection(from, target)
    }

    const anchorDragStartHandler = (event: KonvaEventObject<DragEvent>) => {
        const position = event.target.position()
        setConnectionPreview(
            <Line
                x={position.x}
                y={position.y}
                points={CanvasHandler.createConnectionPoints(position, position)}
                stroke={ConnectionColours.BASE}
                strokeWidth={3}
            />,
        )
    }

    const anchorDragMoveHandler = (event: KonvaEventObject<DragEvent>) => {
        const position = event.target.position()
        const mousePos = CanvasHandler.getMousePos(event)
        setConnectionPreview(
            <Line
                x={position.x}
                y={position.y}
                points={CanvasHandler.createConnectionPoints({x: 0, y: 0}, mousePos)}
                stroke={ConnectionColours.BASE}
                strokeWidth={3}
            />,
        )
    }

    const anchorDragEndHandler = (event: KonvaEventObject<MouseEvent>): void => {
        setConnectionPreview(null)
        const stage = event.target.getStage()!
        const mousePos = stage.getPointerPosition()!
        const {selectedPoint} = canvasStore
        if (selectedPoint) addConnection(mousePos, selectedPoint)
    }

    return <Stage
        width={CanvasHandler.STAGE_SIZE}
        height={CanvasHandler.STAGE_SIZE}
        ref={stageRef}
        onClick={onClickStageHandler}
        onMouseMove={onMouseMoveStageHandler}
        onDblClick={event => addPoint(event, stageRef.current)}
    >
        <Layer>
            <Connections/>
            <ConnectionWeights hovered={hovered} hoveredConnection={hoveredConnection}/>
            <ConnectionPreview line={connectionPreview}/>
            <Border
                onAnchorDragMove={anchorDragMoveHandler}
                onAnchorDragStart={anchorDragStartHandler}
                onAnchorDragEnd={anchorDragEndHandler}
            />
            <Points setFrom={props.setFrom} setTo={props.setTo} />
            <Package/>
        </Layer>
    </Stage>
})

export default Canvas;