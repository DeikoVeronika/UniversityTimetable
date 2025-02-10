using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UniversityTimetable.Models;

public partial class Semester
{
    [Key]
    public Guid Id { get; set; }

    [Column(TypeName = "nvarchar(50)")]
    public string Name { get; set; }

    [Column(TypeName = "date")]
    public DateTime StartDate { get; set; }

    [Column(TypeName = "date")]
    public DateTime EndDate { get; set; }
    public virtual ICollection<Lesson> Lessons { get; set; } = new List<Lesson>();

    public bool IsActive()
    {
        DateTime today = DateTime.Now;
        return today >= StartDate && today <= EndDate;
    }
}
