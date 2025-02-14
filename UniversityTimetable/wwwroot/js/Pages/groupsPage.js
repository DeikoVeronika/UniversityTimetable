const YEARS = {
    FIRST: "1 курс",
    SECOND: "2 курс",
    THIRD: "3 курс",
    FOURTH: "4 курс"
}

const PROGRAMS = {
    INFORMATICS: "Інформатика",
    APPLIED_MATH: "Прикладна математика",
    SYSTEM_ANALYSIS: "Системний аналіз",
    SOFTWARE_ENGINEERING: "Програмна інженерія"
}
function getGroupsData() {
    const body = {};
    body.name = document.getElementById('add-Groups-name').value.trim();
    body.year =  parseInt(document.getElementById('add-Groups-year').value, 10),
    body.program = parseInt(document.getElementById('add-Groups-program').value, 10)

    return body;
}

async function loadGroupDropdowns() {
    populateYearsEdit();
    populateProgramsEdit();
}

function setGroupsEditFormValues(item) {
    document.getElementById(`edit-Groups-name`).value = item.name;
    document.getElementById(`edit-Groups-year`).value = item.year;
    document.getElementById(`edit-Groups-program`).value = item.program;
}

function getGroupsEditFormData() {
    return {
        name: document.getElementById(`edit-Groups-name`).value.trim(),
        year: parseInt(document.getElementById(`edit-Groups-year`).value, 10),
        program: parseInt(document.getElementById(`edit-Groups-program`).value, 10)
    };
}

function populateGroupsRow(row, item) {
    let yearText = Object.values(YEARS)[item.year] || "Невідомий курс";
    let program = Object.values(PROGRAMS)[item.program] || "Невідома програма";

    row.insertCell().textContent = item.name;
    row.insertCell().textContent = yearText;
    row.insertCell().textContent = program;
}

function populateYears(id) {
    const years = [
        { value: 0, name: YEARS.FIRST },
        { value: 1, name: YEARS.SECOND },
        { value: 2, name: YEARS.THIRD },
        { value: 3, name: YEARS.FOURTH }
    ];

    populateSelect(id, years);
}

function populatePrograms(id) {
    const programs = [
        { value: 0, name: PROGRAMS.APPLIED_MATH },
        { value: 1, name: PROGRAMS.SYSTEM_ANALYSIS },
        { value: 2, name: PROGRAMS.INFORMATICS },
        { value: 3, name: PROGRAMS.SOFTWARE_ENGINEERING }
    ];

    populateSelect(id, programs);
}

function populateYearsCreate() {
    populateYears('add-Groups-year');
}

function populateYearsEdit() {
    populateYears('edit-Groups-year');
}

function populateProgramsCreate() {
    populatePrograms('add-Groups-program');
}

function populateProgramsEdit() {
    populatePrograms('edit-Groups-program');
}
function getGroupsData() {
    const body = [];
    const year = parseInt(document.getElementById('add-Groups-year').value, 10);
    const program = parseInt(document.getElementById('add-Groups-program').value, 10);
    const groupNameInputs = document.querySelectorAll('.group-name-input');

    groupNameInputs.forEach(input => {
        const name = input.value.trim();
        if (name) {
            body.push({
                name: name,
                year: year,
                program: program
            });
        }
    });

    return body;
}