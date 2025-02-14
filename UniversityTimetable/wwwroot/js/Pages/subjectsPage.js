function getSubjectsData() {
    const body = {};
    body.name = document.getElementById('add-Subjects-name').value.trim();
    body.lectureHours = parseInt(document.getElementById('add-Subjects-lectureHours').value, 10);
    body.practicalHours = parseInt(document.getElementById('add-Subjects-practicalHours').value, 10);
    body.seminarHours = parseInt(document.getElementById('add-Subjects-seminarHours').value, 10);
    body.labHours = parseInt(document.getElementById('add-Subjects-labHours').value, 10);
    body.consultationHours = parseInt(document.getElementById('add-Subjects-consultationHours').value, 10);
    body.independentStudyHours = parseInt(document.getElementById('add-Subjects-independentStudyHours').value, 10);
    return body;
}

function setSubjectsEditFormValues(item) {
    document.getElementById(`edit-Subjects-name`).value = item.name;
    document.getElementById(`edit-Subjects-lectureHours`).value = item.lectureHours;
    document.getElementById(`edit-Subjects-practicalHours`).value = item.practicalHours;
    document.getElementById(`edit-Subjects-seminarHours`).value = item.seminarHours;
    document.getElementById(`edit-Subjects-labHours`).value = item.labHours;
    document.getElementById(`edit-Subjects-consultationHours`).value = item.consultationHours;
    document.getElementById(`edit-Subjects-independentStudyHours`).value = item.independentStudyHours;
}

function getSubjectsEditFormData() {
    return {
        name: document.getElementById(`edit-Subjects-name`).value.trim(),
        lectureHours: parseInt(document.getElementById(`edit-Subjects-lectureHours`).value, 10),
        practicalHours: parseInt(document.getElementById(`edit-Subjects-practicalHours`).value, 10),
        seminarHours: parseInt(document.getElementById(`edit-Subjects-seminarHours`).value, 10),
        labHours: parseInt(document.getElementById(`edit-Subjects-labHours`).value, 10),
        consultationHours: parseInt(document.getElementById(`edit-Subjects-consultationHours`).value, 10),
        independentStudyHours: parseInt(document.getElementById(`edit-Subjects-independentStudyHours`).value, 10)
    };
}

function populateSubjectsRow(row, item) {
    row.insertCell().textContent = item.name;
    row.insertCell().textContent = item.lectureHours;
    row.insertCell().textContent = item.practicalHours;
    row.insertCell().textContent = item.seminarHours;
    row.insertCell().textContent = item.labHours;
    row.insertCell().textContent = item.consultationHours;
    row.insertCell().textContent = item.independentStudyHours;
}

//function updateSubjectsEntity(body) {
//    const formData = getSubjectsEditFormData();
//    Object.assign(body, formData);
//}