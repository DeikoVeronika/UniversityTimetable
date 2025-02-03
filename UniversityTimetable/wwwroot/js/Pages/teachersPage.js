function getTeachersData() {
    const body = {};
    body.name = document.getElementById('add-Teachers-name').value.trim();
    return body;
}

function setTeachersEditFormValues(item) {
    document.getElementById(`edit-Teachers-name`).value = item.name;
}

function getTeachersEditFormData() {
    return {
        name: document.getElementById(`edit-Teachers-name`).value.trim(),
    };
}

function populateTeachersRow(row, item) {
    row.insertCell().textContent = item.name;
}