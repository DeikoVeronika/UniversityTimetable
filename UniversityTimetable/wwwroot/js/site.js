document.addEventListener("DOMContentLoaded", () => {
    loadData();
});

async function loadData() {
    await fetchData('Groups', populateGroups);
    await fetchData('Subjects', populateSubjects);
    await fetchData('Teachers', populateTeachers);
    populateDaysCreate();
    populateTimesCreate();
}

async function handleResponseError(response) {
    const errorText = await response.text();
    throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
}

async function fetchData(entity, callback) {
    try {
        const response = await fetch(`api/${entity}`);
        if (!response.ok) {
            await handleResponseError(response);
        }
        const data = await response.json();
        callback(data);
    } catch (error) {
        console.error(`Unable to get ${entity}.`, error);
    }
}


// Entity Add
async function addEntity(entity) {
    const body = createEntityBody(entity);

    try {
        const response = await fetch(`api/${entity}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            await handleResponseError(response);
        }

        fetchData(entity, data => displayEntities(entity, data));
        resetForm(entity);
    } catch (error) {
        console.error(`Unable to add ${entity}.`, error);
    }
}

function createEntityBody(entity) {
    if (entity === 'Lessons') {
        return getLessonsData();
    } else if (entity === 'Subjects') {
        return getSubjectsData();
    } else if (entity === 'Groups') {
        return getGroupsData();
    } else if (entity === 'Teachers') {
        return getTeachersData();
    } else {
        return {};
    }
}

function getLessonsData() {
    const body = {}; 
    body.groupId = document.getElementById('add-Lessons-group').value;
    body.subjectId = document.getElementById('add-Lessons-subject').value;
    body.teacherId = document.getElementById('add-Lessons-teacher').value;
    body.dayOfWeek = getDayOfWeekIndex(document.getElementById('add-Lessons-day').value);
    body.startTime = document.getElementById('add-Lessons-time').value;
    body.isEvenWeek = document.getElementById('add-Lessons-even-week').checked;
    return body;
}

function getSubjectsData() {
    const body = {}; 
    body.name = document.getElementById('add-Subjects-name').value.trim();
    body.lectureHours = parseInt(document.getElementById('add-Subjects-lectureHours').value, 10);
    body.practicalHours = parseInt(document.getElementById('add-Subjects-practicalHours').value, 10);
    return body;
}

function getGroupsData() {
    const body = {}; 
    body.name = document.getElementById('add-Groups-name').value.trim();
    return body;
}

function getTeachersData() {
    const body = {}; 
    body.name = document.getElementById('add-Teachers-name').value.trim();
    return body;
}


// Entity Edit
async function loadDropdownData(url, dropdownId) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        const dropdown = document.getElementById(dropdownId);

        dropdown.innerHTML = ''; 
        data.forEach(item => {
            const option = document.createElement('option');
            option.value = item.id;
            option.textContent = item.name;
            dropdown.appendChild(option);
        });
    } catch (error) {
        console.error(`Помилка завантаження даних з ${url}:`, error);
    }
}

async function loadAllDropdowns() {
    await loadDropdownData('/api/groups', 'edit-Lessons-group');
    await loadDropdownData('/api/subjects', 'edit-Lessons-subject');
    await loadDropdownData('/api/teachers', 'edit-Lessons-teacher');
    populateDaysEdit();
    populateTimesEdit();
}

async function displayEditForm(entity, item) {
    document.getElementById(`edit-${entity}-id`).value = item.id;

    if (entity === 'Lessons') {
        await loadAllDropdowns();
        setLessonsEditFormValues(item);
    } else if (entity === 'Subjects') {
        setSubjectsEditFormValues(item);
    } else if (entity === 'Groups') {
        setGroupsEditFormValues(item);
    } else if (entity === 'Teachers') {
        setTeachersEditFormValues(item);
    }

    document.getElementById(`edit${entity}`).style.display = 'block';
}

function setLessonsEditFormValues(item) {
    document.getElementById('edit-Lessons-group').value = item.groupId;
    document.getElementById('edit-Lessons-subject').value = item.subjectId;
    document.getElementById('edit-Lessons-teacher').value = item.teacherId;
    document.getElementById('edit-Lessons-day').value = item.dayOfWeek;
    document.getElementById('edit-Lessons-time').value = item.startTime;
    document.getElementById('edit-Lessons-even-week').checked = item.isEvenWeek;
}

function setSubjectsEditFormValues(item) {
    document.getElementById(`edit-Subjects-name`).value = item.name;
    document.getElementById(`edit-Subjects-lectureHours`).value = item.lectureHours;
    document.getElementById(`edit-Subjects-practicalHours`).value = item.practicalHours;
}

function setGroupsEditFormValues(item) {
    document.getElementById(`edit-Groups-name`).value = item.name;
}

function setTeachersEditFormValues(item) {
    document.getElementById(`edit-Teachers-name`).value = item.name;
}


// Entity Update
async function updateEntity(entity) {
    const entityId = document.getElementById(`edit-${entity}-id`).value;
    let body = { id: entityId };

    if (entity === 'Lessons') {
        Object.assign(body, getLessonsEditFormData());
    } else if (entity === 'Subjects') {
        Object.assign(body, getSubjectsEditFormData());
    } else if (entity === 'Groups') {
        Object.assign(body, getGroupsEditFormData());
    } else if (entity === 'Teachers') {
        Object.assign(body, getTeachersEditFormData());
    }

    try {
        const response = await fetch(`/api/${entity}/${entityId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            await handleResponseError(response);
        }

        fetchData(entity, data => displayEntities(entity, data));
        closeInput(entity);
    } catch (error) {
        console.error(`Unable to update ${entity}.`, error);
        alert(`Помилка оновлення ${entity}. Перевірте консоль.`);
    }
}

function getLessonsEditFormData() {
    return {
        groupId: document.getElementById('edit-Lessons-group').value, 
        subjectId: document.getElementById('edit-Lessons-subject').value,
        teacherId: document.getElementById('edit-Lessons-teacher').value,
        dayOfWeek: parseInt(document.getElementById('edit-Lessons-day').value, 10),
        startTime: document.getElementById('edit-Lessons-time').value,
        isEvenWeek: document.getElementById('edit-Lessons-even-week').checked
    };
}

function getSubjectsEditFormData() {
    return {
        name: document.getElementById(`edit-Subjects-name`).value.trim(),
        lectureHours: parseInt(document.getElementById(`edit-Subjects-lectureHours`).value, 10),
        practicalHours: parseInt(document.getElementById(`edit-Subjects-practicalHours`).value, 10)
    };
}

function getGroupsEditFormData() {
    return {
        name: document.getElementById(`edit-Groups-name`).value.trim(),
    };
}

function getTeachersEditFormData() {
    return {
        name: document.getElementById(`edit-Teachers-name`).value.trim(),
    };
}


function closeInput(entity) {
    document.getElementById(`edit${entity}`).style.display = 'none';
}

function resetForm(entity) {
    document.getElementById(`add-${entity}-name`).value = '';
    if (entity === 'Subjects') {
        document.getElementById(`add-${entity}-lectureHours`).value = '';
        document.getElementById(`add-${entity}-practicalHours`).value = '';
    }
}


// Entity Delete
async function deleteEntity(entity, id) {
    try {
        const response = await fetch(`api/${entity}/${id}`, { method: 'DELETE' });
        if (!response.ok) {
            await handleResponseError(response);
        }
        fetchData(entity, data => displayEntities(entity, data));
    } catch (error) {
        console.error(`Unable to delete ${entity}.`, error);
    }
}


// Entity Display
function displayEntities(entity, data) {
    const tBody = document.getElementById(entity.toLowerCase());
    tBody.innerHTML = '';

    data.forEach(item => {
        const row = tBody.insertRow();
        populateEntityRow(entity, row, item);
        const actionsCell = row.insertCell();
        addActionButton(actionsCell, 'Редагувати', () => displayEditForm(entity, item));
        addActionButton(actionsCell, 'Видалити', () => deleteEntity(entity, item.id));
    });
}


// Row Population
function populateEntityRow(entity, row, item) {
    if (entity === 'Subjects') {
        populateSubjectsRow(row, item);
    } else if (entity === 'Groups') {
        populateGroupsRow(row, item);
    } else if (entity === 'Teachers') {
        populateTeachersRow(row, item);
    } else if (entity === 'Lessons') {
        populateLessonsRow(row, item);
    }
}

function populateSubjectsRow(row, item) {
    row.insertCell().textContent = item.name;
    row.insertCell().textContent = item.lectureHours;
    row.insertCell().textContent = item.practicalHours;
}

function populateGroupsRow(row, item) {
    row.insertCell().textContent = item.name;
}

function populateTeachersRow(row, item) {
    row.insertCell().textContent = item.name;
}

function populateLessonsRow(row, item) {
    row.insertCell().textContent = item.groupName;
    row.insertCell().textContent = item.subjectName;
    row.insertCell().textContent = item.teacherName;
    row.insertCell().textContent = getDayOfWeekString(item.dayOfWeek); 
    row.insertCell().textContent = item.startTime;
    row.insertCell().textContent = item.isEvenWeek ? 'Парний' : 'Непарний';
}

function getDayOfWeekString(dayOfWeek) {
    return ['Неділя', 'Понеділок', 'Вівторок', 'Середа', 'Четвер', 'П\'ятниця', 'Субота'][dayOfWeek];
}

function populateGroups(data) {
    populateSelect('add-Lessons-group', data.map(group => ({ id: group.id, name: group.name })));
}

function populateSubjects(data) {
    populateSelect('add-Lessons-subject', data.map(subject => ({ id: subject.id, name: subject.name })));
}

function populateTeachers(data) {
    populateSelect('add-Lessons-teacher', data.map(teacher => ({ id: teacher.id, name: teacher.name })));
}

function populateTimesCreate() {
    const times = [
        { value: '08:40', label: '08:40' },
        { value: '10:35', label: '10:35' },
        { value: '12:20', label: '12:20' },
        { value: '14:05', label: '14:05' }
    ];
    populateSelect('add-Lessons-time', times);
}

function populateTimesEdit() {
    const times = [
        { value: '08:40', label: '08:40' },
        { value: '10:35', label: '10:35' },
        { value: '12:20', label: '12:20' },
        { value: '14:05', label: '14:05' }
    ];
    populateSelect('edit-Lessons-time', times);
}

function populateDaysCreate() {
    const days = [
        { value: 0, name: 'Неділя' },
        { value: 1, name: 'Понеділок' },
        { value: 2, name: 'Вівторок' },
        { value: 3, name: 'Середа' },
        { value: 4, name: 'Четвер' },
        { value: 5, name: `П'ятниця` },
        { value: 6, name: 'Субота' }
    ];
    populateSelect('add-Lessons-day', days);
}
function populateDaysEdit() {
    const days = [
        { value: 0, name: 'Неділя' },
        { value: 1, name: 'Понеділок' },
        { value: 2, name: 'Вівторок' },
        { value: 3, name: 'Середа' },
        { value: 4, name: 'Четвер' },
        { value: 5, name: `П'ятниця` },
        { value: 6, name: 'Субота' }
    ];
    populateSelect('edit-Lessons-day', days);
}

function getDayOfWeekIndex(day) {
    return parseInt(day, 10); 
}
function getDayOfWeekString(dayIndex) {
    const days = [
        'Неділя',
        'Понеділок',
        'Вівторок',
        'Середа',
        'Четвер',
        'П\'ятниця',
        'Субота'
    ];
    return days[dayIndex] || 'Невідомий день';
}

function populateSelect(id, items) {
    const select = document.getElementById(id);
    items.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id || item.value;
        option.textContent = item.name || item.label;
        select.appendChild(option);
    });
}


//Buttons
function addActionButton(parent, text, action) {
    const button = document.createElement('button');
    button.textContent = text;
    button.addEventListener('click', action);
    parent.appendChild(button);
}
