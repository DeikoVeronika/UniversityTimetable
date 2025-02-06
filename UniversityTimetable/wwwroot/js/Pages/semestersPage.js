function getSemestersData() {
    const body = {};
    body.name = document.getElementById('add-Semesters-name').value.trim();
    body.startDate = document.getElementById('add-Semesters-startDate').value;
    body.endDate = document.getElementById('add-Semesters-endDate').value;
    return body;
}

function setSemestersEditFormValues(item) {
    document.getElementById(`edit-Semesters-name`).value = item.name;
    document.getElementById(`edit-Semesters-startDate`).value = formatDateForInput(item.startDate);
    document.getElementById(`edit-Semesters-endDate`).value = formatDateForInput(item.endDate);
}

function getSemestersEditFormData() {
    return {
        name: document.getElementById(`edit-Semesters-name`).value.trim(),
        startDate: document.getElementById(`edit-Semesters-startDate`).value,
        endDate: document.getElementById(`edit-Semesters-endDate`).value,
    };
}

function populateSemestersRow(row, item) {
    row.insertCell().textContent = item.name;
    row.insertCell().textContent = formatDate(item.startDate);
    row.insertCell().textContent = formatDate(item.endDate);
}


// Функція для форматування дати для input type="date"
function formatDateForInput(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}


// Ця функція залишається без змін, для відображення в таблиці
function formatDate(dateString) { 
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
}