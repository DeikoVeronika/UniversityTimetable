let selectedGroup = ''; 

document.addEventListener("DOMContentLoaded", async function () {
    try {
        await Promise.all([
            fetchData('Groups', populateGroups),
            fetchData('Subjects', populateSubjects),
            fetchData('Teachers', populateTeachers),
            fetchData('Auditoriums', populateAuditoriums),
            fetchData('Semesters', populateSemesters)
        ]);

        populateDaysCreate();
        populateTimesCreate();
        document.getElementById('week-both').checked = true;

        fetchData('Lessons', data => {
            lessons = data;
            displayEntities('Lessons', lessons);
            console.log("Завантажені уроки:", lessons);

            document.getElementById('group-filter').addEventListener('change', function () {
                selectedGroup = this.value;
                const filteredData = selectedGroup ? lessons.filter(lesson => lesson.groupName === selectedGroup) : lessons;
                displayEntities('Lessons', filteredData);
            });
        });


    } catch (error) {
        console.error("Error loading data:", error);
    }
});