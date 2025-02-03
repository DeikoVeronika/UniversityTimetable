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

        // Оновлюємо список після додавання
        await updateEntityData(entity);

        resetForm(entity);  // Очищаємо форму після додавання
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

        // Оновлюємо дані після оновлення
        await updateEntityData(entity);

        closeInput(entity);  // Закриваємо форму після оновлення
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

// Entity Delete
async function deleteEntity(entity, id) {
    try {
        const response = await fetch(`api/${entity}/${id}`, { method: 'DELETE' });
        if (!response.ok) {
            await handleResponseError(response);
        }

        // Оновлюємо дані після видалення
        await updateEntityData(entity);
    } catch (error) {
        console.error(`Unable to delete ${entity}.`, error);
    }
}

async function updateEntityData(entity) {
    // Завантажуємо нові дані та застосовуємо фільтрацію для уроків
    fetchData(entity, data => {
        if (entity === 'Lessons') {
            lessons = data;
            // Застосовуємо фільтрацію, якщо є активний фільтр
            const filteredData = selectedGroup ? lessons.filter(lesson => lesson.groupName === selectedGroup) : lessons;
            displayEntities(entity, filteredData);
        } else {
            displayEntities(entity, data);
        }
    });
}

// Entity Display
function displayEntities(entity, data) {
    const tBody = entity === 'Lessons' ?
        { even: document.getElementById('lessons-even'), odd: document.getElementById('lessons-odd') } :
        document.getElementById(entity.toLowerCase());

    if (entity === 'Lessons') {
        tBody.even.innerHTML = '';
        tBody.odd.innerHTML = '';

        data.forEach(item => {
            const row = createRow(entity, item);
            item.isEvenWeek ? tBody.even.appendChild(row) : tBody.odd.appendChild(row);
        });
    } else {
        tBody.innerHTML = '';
        data.forEach(item => {
            const row = createRow(entity, item);
            tBody.appendChild(row);
        });
    }
}

function createRow(entity, item) {
    const row = document.createElement('tr');
    populateEntityRow(entity, row, item);
    const actionsCell = row.insertCell();
    addActionButton(actionsCell, 'Редагувати', () => displayEditForm(entity, item));
    addActionButton(actionsCell, 'Видалити', () => deleteEntity(entity, item.id));
    return row;
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

function populateSelect(id, items, includeAll = false) {
    const select = document.getElementById(id);
    select.innerHTML = ''; // Очищення перед додаванням нових значень

    if (includeAll) {
        const allOption = document.createElement('option');
        allOption.value = '';
        allOption.textContent = 'Всі групи';
        select.appendChild(allOption);
    }

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