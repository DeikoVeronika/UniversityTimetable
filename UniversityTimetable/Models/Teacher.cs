using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace UniversityTimetable.Models;

public partial class Teacher
{
    [Key]
    public Guid Id { get; set; }

    [Column(TypeName = "nvarchar(50)")]
    public string Name { get; set; }
    //public virtual ICollection<TeacherSubject> TeacherSubjects { get; set; } = new List<TeacherSubject>();
    public virtual ICollection<Lesson> Lessons { get; set; } = new List<Lesson>();

}
