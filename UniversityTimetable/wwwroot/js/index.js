let selectedGroup = ''; // Глобальна змінна для збереження фільтра

document.addEventListener("DOMContentLoaded", function () {
    loadData();  // Завантажуємо дані при завантаженні сторінки

    // Додаємо обробник подій для фільтрації
    document.getElementById('group-filter').addEventListener('change', function () {
        selectedGroup = this.value;  // Оновлюємо глобальну змінну
        const filteredData = selectedGroup ? lessons.filter(lesson => lesson.groupName === selectedGroup) : lessons;
        displayEntities('Lessons', filteredData);  // Оновлюємо відображення з фільтром
    });
});


async function loadData() {
    await Promise.all([
        fetchData('Groups', populateGroups),
        fetchData('Subjects', populateSubjects),
        fetchData('Teachers', populateTeachers),
        fetchData('Auditoriums', populateAuditoriums)
    ]);
    populateDaysCreate();
    populateTimesCreate();
}