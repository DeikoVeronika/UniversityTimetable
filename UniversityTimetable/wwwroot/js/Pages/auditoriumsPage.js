function getAuditoriumsData() {
    const body = {};
    body.name = document.getElementById('add-Auditoriums-name').value.trim();
    return body;
}

function setAuditoriumsEditFormValues(item) {
    document.getElementById(`edit-Auditoriums-name`).value = item.name;
}

function getAuditoriumsEditFormData() {
    return {
        name: document.getElementById(`edit-Auditoriums-name`).value.trim(),
    };
}

function populateAuditoriumsRow(row, item) {
    row.insertCell().textContent = item.name;
}