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
    const nameField = document.getElementById(`add-${entity}-name`);
    const name = nameField.value.trim();

    const body = { name };
    if (entity === 'Subjects') {
        body.lectureHours = parseInt(document.getElementById(`add-Subjects-lectureHours`).value, 10);
        body.practicalHours = parseInt(document.getElementById(`add-Subjects-practicalHours`).value, 10);
    }

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
    document.getElementById(`edit-${entity}-name`).value = item.name;

    if (entity === 'Subjects') {
        document.getElementById(`edit-Subjects-lectureHours`).value = item.lectureHours;
        document.getElementById(`edit-Subjects-practicalHours`).value = item.practicalHours;
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
        const nameCell = row.insertCell();
        nameCell.textContent = item.name;

        if (entity === 'Subjects') {
            const lectureCell = row.insertCell();
            lectureCell.textContent = item.lectureHours;
            const practicalCell = row.insertCell();
            practicalCell.textContent = item.practicalHours;
        }

        const actionsCell = row.insertCell();
        addActionButton(actionsCell, 'Редагувати', () => displayEditForm(entity, item)); 
        addActionButton(actionsCell, 'Видалити', () => deleteEntity(entity, item.id));
    });
}

function addActionButton(parent, text, action) {
    const button = document.createElement('button');
    button.textContent = text;
    button.addEventListener('click', action);
    parent.appendChild(button);
}