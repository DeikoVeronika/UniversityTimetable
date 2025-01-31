document.addEventListener("DOMContentLoaded", () => {
    loadData();
});

async function loadData() {
    await fetchData('Groups', populateGroups);
    await fetchData('Subjects', populateSubjects);
    await fetchData('Teachers', populateTeachers);
    populateDays();
    populateTimes();
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
    const body = {};

    if (entity === 'Lessons') {
        body.groupId = document.getElementById('add-Lessons-group').value;
        body.subjectId = document.getElementById('add-Lessons-subject').value;
        body.teacherId = document.getElementById('add-Lessons-teacher').value;
        body.dayOfWeek = getDayOfWeekIndex(document.getElementById('add-Lessons-day').value);
        body.startTime = document.getElementById('add-Lessons-time').value;
        body.isEvenWeek = document.getElementById('add-Lessons-even-week').checked;
    } else if (entity === 'Subjects') {
        body.name = document.getElementById('add-Subjects-name').value.trim();
        body.lectureHours = parseInt(document.getElementById('add-Subjects-lectureHours').value, 10);
        body.practicalHours = parseInt(document.getElementById('add-Subjects-practicalHours').value, 10);
    } else if (entity === 'Groups') {
        body.name = document.getElementById('add-Groups-name').value.trim();
    } else if (entity === 'Teachers') {
        body.name = document.getElementById('add-Teachers-name').value.trim();
    }

    return body;
}


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

function displayEditForm(entity, item) {
    document.getElementById(`edit-${entity}-id`).value = item.id;

    if (entity === 'Lessons') {
        document.getElementById('edit-Lessons-group').value = item.groupId;
        document.getElementById('edit-Lessons-subject').value = item.subjectId;
        document.getElementById('edit-Lessons-teacher').value = item.teacherId;
        document.getElementById('edit-Lessons-day').value = getDayOfWeekString(item.dayOfWeek);
        document.getElementById('edit-Lessons-time').value = item.startTime;
        document.getElementById('edit-Lessons-even-week').checked = item.isEvenWeek;
    } else if (entity === 'Subjects') {
        document.getElementById(`edit-Subjects-name`).value = item.name;
        document.getElementById(`edit-Subjects-lectureHours`).value = item.lectureHours;
        document.getElementById(`edit-Subjects-practicalHours`).value = item.practicalHours;
    } else if (entity === 'Groups') {
        document.getElementById(`edit-Groups-name`).value = item.name;
    } else if (entity === 'Teachers') {
        document.getElementById(`edit-Teachers-name`).value = item.name;
    }

    document.getElementById(`edit${entity}`).style.display = 'block';
}

async function updateEntity(entity) {
    const entityId = document.getElementById(`edit-${entity}-id`).value;
    const name = document.getElementById(`edit-${entity}-name`).value.trim();

    const body = { id: entityId, name };
    if (entity === 'Subjects') {
        body.lectureHours = parseInt(document.getElementById(`edit-${entity}-lectureHours`).value, 10);
        body.practicalHours = parseInt(document.getElementById(`edit-${entity}-practicalHours`).value, 10);
    }

    try {
        const response = await fetch(`api/${entity}/${entityId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
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

function populateEntityRow(entity, row, item) {
    switch (entity) {
        case 'Subjects':
            row.insertCell().textContent = item.name;
            row.insertCell().textContent = item.lectureHours;
            row.insertCell().textContent = item.practicalHours;
            break;
        case 'Groups':
            row.insertCell().textContent = item.name;
            break;
        case 'Teachers':
            row.insertCell().textContent = item.name;
            break;
        case 'Lessons':
            row.insertCell().textContent = item.groupName;
            row.insertCell().textContent = item.subjectName;
            row.insertCell().textContent = item.teacherName;
            row.insertCell().textContent = ['Неділя', 'Понеділок', 'Вівторок', 'Середа', 'Четвер', 'П\'ятниця', 'Субота'][item.dayOfWeek];
            row.insertCell().textContent = item.startTime;
            row.insertCell().textContent = item.isEvenWeek ? 'Парний' : 'Непарний';
            break;
    }
}

function addActionButton(parent, text, action) {
    const button = document.createElement('button');
    button.textContent = text;
    button.addEventListener('click', action);
    parent.appendChild(button);
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

function populateTimes() {
    const times = [
        { value: '08:40', label: '08:40' },
        { value: '10:35', label: '10:35' },
        { value: '12:20', label: '12:20' },
        { value: '14:05', label: '14:05' }
    ];
    populateSelect('add-Lessons-time', times);
}

function populateDays() {
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
