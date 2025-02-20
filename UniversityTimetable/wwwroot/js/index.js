let lessons = [];

let selectedGroup = '';
let selectedSemester = '';

document.addEventListener("DOMContentLoaded", async function () {
    try {
        await Promise.all([
            fetchSemesters(),
            fetchData('Groups', populateGroups),
            fetchData('Subjects', populateSubjects),
            fetchData('Teachers', populateTeachers),
            fetchData('Auditoriums', populateAuditoriums),
            fetchData('Semesters', populateSemesters)
        ]);

        
        populateDaysCreate();
        populateTimesCreate();
        populateLessonTypesCreate();
        document.getElementById('week-both').checked = true;

        fetchData('Lessons', data => {
            lessons = data;
            filterData();

            document.getElementById('group-filter').addEventListener('change', function () {
                selectedGroup = this.value;
                filterData();
            });

            document.getElementById('semester-filter').addEventListener('change', function () {
                selectedSemester = this.value;
                filterData();
            });
        });

    } catch (error) {
        console.error("Error loading data:", error);
    }
});

