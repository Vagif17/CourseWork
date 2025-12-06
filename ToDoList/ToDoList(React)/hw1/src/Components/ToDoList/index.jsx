import React,{useState} from "react"
import CreateNode from './CreateNode'
import NodeList from './NodeList'

const ToDoList = () =>
{
    const [nodes, setNodes] = useState([])

    const addNote = (newNode) =>
    {
        setNodes([...nodes,newNode])
    }



    return (

        <div>

            <CreateNode onAdd={addNote} />
            <NodeList Nodes={nodes} />

        </div>
    )
}


export default ToDoList