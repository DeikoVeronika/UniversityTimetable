let groups = [];

document.addEventListener("DOMContentLoaded", async function () {
    try {
        populateYearsCreate();
        populateProgramsCreate();

        // Додавання обробника для кнопки "+"
        const addButton = document.getElementById('add-group-name-button');
        const container = document.getElementById('group-names-container');

        addButton.addEventListener('click', function () {
            const newInput = document.createElement('input');
            newInput.type = 'text';
            newInput.className = 'group-name-input';
            newInput.placeholder = 'Назва групи';
            newInput.required = true;
            container.appendChild(newInput);
        });

    } catch (error) {
        console.error("Error loading data:", error);
    }
});

fetchData('Groups', data => displayEntities('Groups', data));