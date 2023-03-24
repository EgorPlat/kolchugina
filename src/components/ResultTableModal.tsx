import React, {Dispatch, FC, SetStateAction} from 'react';
import {Modal, Table} from 'antd';
import './style.css';

interface ResultTableModalProps {
    visible: boolean
    setVisible: Dispatch<SetStateAction<boolean>>
    pathList: { key:string }[]
    compareResult: any
}

const ResultTableModal: FC<ResultTableModalProps> = ({visible, setVisible, pathList, compareResult}) => {
    
    const columns = [
        {
            title: 'Старт',
            dataIndex: 'from',
        }, {
            title: 'Финиш',
            dataIndex: 'to',
        }, {
            title: 'Путь',
            dataIndex: 'path',
        }, {
            title: 'Длина пути',
            dataIndex: 'distance',
        },
    ]

    const click = (e: any) => {
        e.stopPropagation();
        setVisible(false)
    }
    if (visible) {
        return (
            <div className='wrapper' onClick={click}>
                <div className='flex'>
            {/*<Modal
            width='50%'
            title="Таблица результатов"
            visible={visible}
            onCancel={() => setVisible(false)}
            footer={null}
            style={{display: "flex", flexDirection: "column"}}
        >*/}
            <div>
            <h2>{compareResult}</h2>
                <h1>Дейкстра</h1>
            <Table
                columns={columns}
                dataSource={pathList}
                rowKey={path => path.key}
            />
            </div>
            <div>
            <h1>Флойд</h1>
            <Table
                columns={columns}
                dataSource={pathList}
                rowKey={path => path.key}
            />
            </div>
        {/*</Modal>*/}
            </div>
            </div>
        )
    } else {
        return null;
    }
}

export default ResultTableModal;