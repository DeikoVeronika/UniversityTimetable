namespace UniversityTimetable.Constants;

public static class LessonTimes
{
    public static readonly List<TimeSpan> AvailableTimes = new()
    {
        new TimeSpan(8, 40, 0),
        new TimeSpan(10, 35, 0),
        new TimeSpan(12, 20, 0),
        new TimeSpan(14, 05, 0)
    };
}
