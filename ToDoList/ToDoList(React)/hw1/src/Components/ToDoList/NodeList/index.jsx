import React,{useState} from "react"

const NodeList = ({Nodes}) => {

    return (
        <div>

            <ul>
                {Nodes.map((node, i) => (
                    <li key={i}>{node}</li>
                ))}

            </ul>

        </div>
    )

}


export default NodeList