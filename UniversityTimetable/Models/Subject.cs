using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UniversityTimetable.Models;

public partial class Subject
{
    [Key]
    public Guid Id { get; set; }

    [Column(TypeName = "nvarchar(50)")]
    public string Name { get; set; }
    public uint LectureHours { get; set; }
    public uint PracticalHours { get; set; }
    public uint SeminarHours { get; set; }
    public uint ConsultationHours { get; set; }
    public uint IndependentStudyHours { get; set; }
    public uint LabHours { get; set; }

    //public virtual ICollection<TeacherSubject> TeacherSubjects { get; set; } = new List<TeacherSubject>();
    public virtual ICollection<Lesson> Lessons { get; set; } = new List<Lesson>();
}
