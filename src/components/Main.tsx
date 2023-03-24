import React, {FC} from 'react';
import Matrix from './Matrix';
import Canvas from './Canvas';
import MatrixContainer from './MatrixContainer';

const Main = (props: {setFrom: (name: string) => void, setTo: (name: string) => void}) => {

    return <div className="main">
        <MatrixContainer>
            <Matrix/>
        </MatrixContainer>
        <Canvas setFrom={props.setFrom} setTo={props.setTo} />
    </div>
}

export default Main;