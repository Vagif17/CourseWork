import React,{useState} from 'react';

const CreateNode = ({onAdd}) => {

    const [node, setNode] = useState("");


    const submit = (e) =>
    {
        e.preventDefault();
        onAdd(node);
    }


    return (
        <div>

            <form onSubmit={submit}>

                <input
                    type="text"
                    onChange={(e) => setNode(e.target.value)}
                    value={node}
                    placeholder="Enter Node"
                />

                <input type="submit" value="Add Node" />


            </form>
        </div>
    )
}

export default CreateNode;