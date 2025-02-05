using NuGet.Protocol;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UniversityTimetable.Models;

public enum WeekType
    {
    Both,
    Odd,
    Even
}

public partial class Lesson
{
    [Key]
    public Guid Id { get; set; }
    public Guid GroupId { get; set; }
    public Guid SubjectId { get; set; }
    public Guid TeacherId { get; set; }
    public Guid AuditoriumId { get; set; }
    public DayOfWeek DayOfWeek { get; set; }
    public TimeSpan StartTime { get; set; }
    public WeekType Week { get; set; }

    [ForeignKey("GroupId")]
    public virtual Group? Group { get; set; }

    [ForeignKey("SubjectId")]
    public virtual Subject? Subject { get; set; }

    [ForeignKey("TeacherId")]
    public virtual Teacher? Teacher { get; set; }

    [ForeignKey("AuditoriumId")]
    public virtual Auditorium? Auditorium { get; set; }
}

