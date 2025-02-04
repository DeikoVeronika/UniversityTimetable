let selectedGroup = ''; 

document.addEventListener("DOMContentLoaded", function () {
    loadData();  

    document.getElementById('group-filter').addEventListener('change', function () {
        selectedGroup = this.value; 
        const filteredData = selectedGroup ? lessons.filter(lesson => lesson.groupName === selectedGroup) : lessons;
        displayEntities('Lessons', filteredData); 
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