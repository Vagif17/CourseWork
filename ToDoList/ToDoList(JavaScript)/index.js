const mainForm = document.querySelector("#mainForm")
const listForm = document.querySelector("#listForm")

mainForm.addEventListener("submit", (e) => {
    e.preventDefault();


    if (document.querySelector("#noteText").value.length > 0)
    {
        const newNote = document.createElement("h5");
        newNote.textContent = (document.querySelector("#noteText").value);
        listForm.append(newNote);
    }

})