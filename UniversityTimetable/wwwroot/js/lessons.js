let lessons = []; // Оголошення масиву перед використанням

fetchData('Lessons', data => {
    lessons = data; // Присвоюємо отримані дані
    displayEntities('Lessons', lessons); // Викликаємо функцію відображення
    console.log("Завантажені уроки:", lessons);
});
