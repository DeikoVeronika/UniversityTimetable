function getGroupsData() {
    const body = {};
    body.name = document.getElementById('add-Groups-name').value.trim();
    return body;
}

function setGroupsEditFormValues(item) {
    document.getElementById(`edit-Groups-name`).value = item.name;
}

function getGroupsEditFormData() {
    return {
        name: document.getElementById(`edit-Groups-name`).value.trim(),
    };
}

function populateGroupsRow(row, item) {
    row.insertCell().textContent = item.name;
}