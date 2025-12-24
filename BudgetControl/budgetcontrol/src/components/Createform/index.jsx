import React, {useState} from "react";
import {useDispatch} from 'react-redux';
import {AddIncome} from '../../store/slices/incomeSlice.js'
import {AddExpense} from '../../store/slices/expenseSlice.js'

const CreateForm = () => {

    const dispatch = useDispatch();

    const [category, setCategory] = useState("");
    const [type, setType] = useState("");
    const [amount, setAmount] = useState(0);



    const submitHandler = (e) =>
    {
        e.preventDefault();

        if (category.length < 3)
        {
            alert("Please enter correct category");
            return;
        }

        if(type === '')
        {
            alert("Please select type");
            return;
        }

        if (amount <= 0)
        {
            alert("Please correct amount");
            return;
        }

        if (type === "income")
        {
            const newIncome = {'type' : type, 'category' : category,'amount' : amount};
            dispatch(AddIncome(newIncome));

            setCategory("");
            setType("");
            setAmount(0);

            return;
        }

        if (type === "expense")
        {
            const newExpense = {'type' : type, 'category' : category,'amount' : amount};
            dispatch(AddExpense(newExpense));

            setCategory("");
            setType("");
            setAmount(0);

            return;
        }

    }

    return (
        <>
            <form onSubmit={submitHandler}>

                <label>Income
                    <input name={"choiceRadio"}
                           type={'radio'}
                           value={"income"}
                           checked={type === "income"}
                           onChange={(e) => {setType(e.target.value)}}
                    />
                </label>

                <label>Expense
                    <input name={"choiceRadio"}
                           type={'radio'}
                           value="expense"
                           checked={type === "expense"}
                           onChange={(e) => {setType(e.target.value)}}
                    />
                </label>

                <input type={"number"}
                       value={amount}
                       onChange={(e) => {setAmount(e.target.value)}}
                />

                <input type={"text"}
                       placeholder={"Category"}
                       value={category}
                       onChange={(e) => {setCategory(e.target.value)}}
                />


                <button type="submit">Submit</button>

            </form>



        </>)
};

export default CreateForm;