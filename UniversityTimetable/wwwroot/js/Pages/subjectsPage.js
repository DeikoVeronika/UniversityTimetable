function getSubjectsData() {
    const body = {};
    body.name = document.getElementById('add-Subjects-name').value.trim();
    body.lectureHours = parseInt(document.getElementById('add-Subjects-lectureHours').value, 10);
    body.practicalHours = parseInt(document.getElementById('add-Subjects-practicalHours').value, 10);
    return body;
}

function setSubjectsEditFormValues(item) {
    document.getElementById(`edit-Subjects-name`).value = item.name;
    document.getElementById(`edit-Subjects-lectureHours`).value = item.lectureHours;
    document.getElementById(`edit-Subjects-practicalHours`).value = item.practicalHours;
}

function getSubjectsEditFormData() {
    return {
        name: document.getElementById(`edit-Subjects-name`).value.trim(),
        lectureHours: parseInt(document.getElementById(`edit-Subjects-lectureHours`).value, 10),
        practicalHours: parseInt(document.getElementById(`edit-Subjects-practicalHours`).value, 10)
    };
}

function populateSubjectsRow(row, item) {
    row.insertCell().textContent = item.name;
    row.insertCell().textContent = item.lectureHours;
    row.insertCell().textContent = item.practicalHours;
}