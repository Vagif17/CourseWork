import React,{useState, useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {RemoveExpense} from "../../store/slices/expenseSlice.js";
import {RemoveIncome} from "../../store/slices/incomeSlice.js";
import ModalPortal from "../ModalPortal/ModalPortal.jsx";

const Expenses = () => {

    const expenses = useSelector((state) => state.expense.value)
    const dispatch = useDispatch();

    const [textToSearch, setTextToSearch] = useState('');
    const [filteredExpenses, setFilteredExpenses] = useState(expenses);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [expenseToRemove, setExpenseToRemove] = useState(null);

    const openDeleteModal = (id) => {
        setExpenseToRemove(id);
        setIsDeleteModalOpen(true);
    }

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setExpenseToRemove(null);
    }

    const confirmDelete = () => {
        dispatch(RemoveExpense(expenseToRemove));
        closeDeleteModal();
    }


    useEffect(() => {
        const filtered = expenses.filter((expense) => {
            return expense.category.toLowerCase().includes(textToSearch.toLowerCase());
            });
        setFilteredExpenses(filtered);

    },[textToSearch,expenses])

    return (
        <>
            <h1>Expenses list</h1>

            <form>

                <input
                    type={"text"}
                    placeholder={"Search by category"}
                    value={textToSearch}
                    onChange={(e) => setTextToSearch(e.target.value)}
                />

            </form>

            {!filteredExpenses.length ? (
                <p>No Expenses</p>
            ) : (
                <ul style={{listStyle: 'none'}}>
                    {filteredExpenses.map((item, index) => (
                        <li key={index}>
                            Category: {item.category} | Amount: {item.amount}
                            <button onClick={() => openDeleteModal(item.id)}>Delete</button>
                        </li>
                    ))}
                </ul>
            )}


            {isDeleteModalOpen && (
                <ModalPortal>
                    <h3 style={{color:"black"}}>Delete this income?</h3>
                    <p style={{color:"black"}}>Are you sure you want to delete this operation?</p>

                    <div style={{display: "flex", gap: "10px", marginTop: "15px"}}>
                        <button onClick={confirmDelete} style={{background: "red", color: "white"}}>
                            Yes, delete
                        </button>
                        <button onClick={openDeleteModal}>Cancel</button>
                    </div>
                </ModalPortal>
            )}
        </>
    )
}


export default Expenses;