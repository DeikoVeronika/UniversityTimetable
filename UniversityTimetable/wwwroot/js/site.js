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
    const bodies = createEntityBody(entity);

    try {
        for (const body of bodies) {
            if (entity === 'Lessons') {
                await checkLessonAvailability(body);
            }

            await sendCreateRequest(entity, body);
        }

        await updateEntityData(entity);
        resetForm(entity);
    } catch (error) {
        console.error(`Unable to add ${entity}.`, error);
    }
}

async function sendCreateRequest(entity, body) {
    const response = await fetch(`api/${entity}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        await handleResponseError(response);
    }
}

function createEntityBody(entity) {
    if (entity === 'Lessons') {
        return [getLessonsData()];
    } else if (entity === 'Subjects') {
        return [getSubjectsData()];
    } else if (entity === 'Groups') {
        return getGroupsData();
    } else if (entity === 'Teachers') {
        return [getTeachersData()];
    } else if (entity === 'Auditoriums') {
        return [getAuditoriumsData()];
    } else if (entity === 'Semesters') {
        return [getSemestersData()];
    } else {
        return [];
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
        await loadLessonDropdowns();
        setLessonsEditFormValues(item);
    } else if (entity === 'Subjects') {
        setSubjectsEditFormValues(item);
    } else if (entity === 'Groups') {
        await loadGroupDropdowns();
        setGroupsEditFormValues(item);
    } else if (entity === 'Teachers') {
        setTeachersEditFormValues(item);
    } else if (entity === 'Auditoriums') {
        setAuditoriumsEditFormValues(item);
    } else if (entity === 'Semesters') {
        setSemestersEditFormValues(item);
    }

    document.getElementById(`edit${entity}`).style.display = 'block';
}

// Entity Update
async function updateEntity(entity) {
    const entityId = document.getElementById(`edit-${entity}-id`).value;
    let body = { id: entityId };

    try {
        if (entity === 'Lessons') {
            await updateLessonEntity(body);
        } else if (entity === 'Subjects') {
            Object.assign(body, getSubjectsEditFormData());
        } else if (entity === 'Groups') {
            Object.assign(body, getGroupsEditFormData());
        } else if (entity === 'Teachers') {
            Object.assign(body, getTeachersEditFormData());
        } else if (entity === 'Auditoriums') {
            Object.assign(body, getAuditoriumsEditFormData());
        } else if (entity === 'Semesters') {
            Object.assign(body, getSemestersEditFormData());
        }

        await sendUpdateRequest(entity, entityId, body);
        await updateEntityData(entity);
        closeInput(entity);

    } catch (error) {
        console.error(`Unable to update ${entity}.`, error);
    }
}

async function sendUpdateRequest(entity, entityId, body) {
    const response = await fetch(`/api/${entity}/${entityId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        await handleResponseError(response);
    }
}

function closeInput(entity) {
    document.getElementById(`edit${entity}`).style.display = 'none';
}

function resetForm(entity) {
    if (entity === 'Groups') {
        const inputs = Array.from(document.getElementsByClassName('group-name-input'));
        for (let i = 1; i < inputs.length; i++) {
            inputs[i].remove();
        }

        if (inputs.length > 0) {
            inputs[0].value = '';
        }
    } else {
        document.getElementById(`add-${entity}-name`).value = '';

        if (entity === 'Subjects') {
            document.getElementById(`add-${entity}-lectureHours`).value = '';
            document.getElementById(`add-${entity}-practicalHours`).value = '';
            document.getElementById(`add-${entity}-seminarHours`).value = '';
            document.getElementById(`add-${entity}-labHours`).value = '';
            document.getElementById(`add-${entity}-consultationHours`).value = '';
            document.getElementById(`add-${entity}-independentStudyHours`).value = '';
        }

        if (entity === 'Semesters') {
            document.getElementById(`add-${entity}-startDate`).value = '';
            document.getElementById(`add-${entity}-endDate`).value = '';
        }
    }
}

// Entity Delete
async function deleteEntity(entity, id) {
    try {
        const response = await fetch(`api/${entity}/${id}`, { method: 'DELETE' });
        if (!response.ok) {
            await handleResponseError(response);
        }

        await updateEntityData(entity);
    } catch (error) {
        console.error(`Unable to delete ${entity}.`, error);
    }
}

async function updateEntityData(entity) {
    fetchData(entity, data => {
        if (entity === 'Lessons') {
            lessons = data;

            let filteredData = lessons;

            if (selectedGroup) {
                filteredData = filteredData.filter(lesson => lesson.groupName === selectedGroup);
            }

            if (selectedSemester) {
                filteredData = filteredData.filter(lesson => lesson.semesterName === selectedSemester);
            }

            displayEntities(entity, filteredData);
        } else {
            displayEntities(entity, data);
        }
    });
}


// Entity Display
function displayEntities(entity, data) {
    if (entity === "Lessons") {
        populateSchedule(data);
        return;
    }

    const tBody = document.getElementById(entity.toLowerCase());
    if (!tBody) return;

    tBody.innerHTML = "";
    data.forEach(item => {
        const row = createRow(entity, item);
        tBody.appendChild(row);
    });
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
    } else if (entity === 'Auditoriums') {
        populateAuditoriumsRow(row, item);
    } else if (entity === 'Semesters') {
        populateSemestersRow(row, item);
    }
}

function populateSelect(id, items, includeAll = false) {
    const select = document.getElementById(id);
    select.innerHTML = '';

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