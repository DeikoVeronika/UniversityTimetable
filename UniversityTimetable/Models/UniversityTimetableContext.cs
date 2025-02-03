using Microsoft.EntityFrameworkCore;
using UniversityTimetable.Models;

namespace UniversityTimetable.Models;

public class UniversityTimetableContext : DbContext
{
    public virtual DbSet<Group> Groups { get; set; }
    public virtual DbSet<Subject> Subjects { get; set; }
    public virtual DbSet<Teacher> Teachers { get; set; }
    public virtual DbSet<Lesson> Lessons { get; set; }
    public virtual DbSet<Auditorium> Auditoriums { get; set; }


    //public virtual DbSet<TeacherSubject> TeacherSubjects { get; set; }

    public UniversityTimetableContext(DbContextOptions<UniversityTimetableContext> options)
    : base(options)
    {
        Database.EnsureCreated();
    }

}
