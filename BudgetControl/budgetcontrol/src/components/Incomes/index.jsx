import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {RemoveIncome} from "../../store/slices/incomeSlice.js";
import ModalPortal from "../ModalPortal/ModalPortal.jsx";

const Incomes = () => {

    const incomes = useSelector((state) => state.income.value)
    const dispatch = useDispatch();

    const [textToSearch, setTextToSearch] = useState('');
    const [filteredIncomes, setFilteredIncomes] = useState(incomes);


    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [incomeToRemove, setIncomeToRemove] = useState(null);

    const openDeleteModal = (id) => {
        setIncomeToRemove(id);
        setIsDeleteModalOpen(true);
    }

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setIncomeToRemove(null);
    }

    const confirmDelete = () => {
        dispatch(RemoveIncome(incomeToRemove));
        closeDeleteModal();
    }

    useEffect(() => {
        const filtered = incomes.filter((income) => {
            return income.category.toLowerCase().includes(textToSearch.toLowerCase());
        });
        setFilteredIncomes(filtered);

    },[textToSearch,incomes])

    return (
        <>
            <h1>Incomes list</h1>

            <form>

                <input
                    type={"text"}
                    placeholder={"Search by category"}
                    value={textToSearch}
                    onChange={(e) => setTextToSearch(e.target.value)}
                />

            </form>

            {!filteredIncomes.length ? (
                <p>No Incomes</p>
            ) : (
                <ul style={{listStyle: 'none'}}>
                    {filteredIncomes.map((item, index) => (
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


export default Incomes;