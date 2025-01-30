﻿using Microsoft.EntityFrameworkCore;
using UniversityTimetable.Models;

namespace UniversityTimetable.Models;

public class UniversityTimetableContext : DbContext
{
    public virtual DbSet<Subject> Subjects { get; set; }
    public virtual DbSet<Teacher> Teachers { get; set; }
    public virtual DbSet<TeacherSubject> TeacherSubjects { get; set; }

    public UniversityTimetableContext(DbContextOptions<UniversityTimetableContext> options)
    : base(options)
    {
        Database.EnsureCreated();
    }

public DbSet<UniversityTimetable.Models.Group> Group { get; set; } = default!;
}
