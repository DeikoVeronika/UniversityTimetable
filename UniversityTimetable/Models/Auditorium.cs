using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace UniversityTimetable.Models;

public partial class Auditorium
{
    [Key]
    public Guid Id { get; set; }

    [Column(TypeName = "nvarchar(50)")]
    public string Name { get; set; }

    public virtual ICollection<Lesson> Lessons { get; set; } = new List<Lesson>();
}