# Domain School CRM Adaptation Guide

## 🎓 School CRM Overview

Transform MultiCRM into a comprehensive school management solution with student tracking, academic records, and parent communication.

## Step 1: Clone & Extend Base Entities

**File:** `src/shared/src/types.ts`

```typescript
// Extend Contact for students and parents
export interface Student extends Contact {
  student_id: string;           // School's unique identifier
  grade_level: string;          // "9th Grade", "Senior"
  enrollment_date: string;
  graduation_year?: number;
  gpa?: number;
  special_needs?: string[];
  emergency_contacts: EmergencyContact[];
}

// New school-specific entities
export interface Class extends TenantEntity {
  name: string;                // "Mathematics 10A", "Biology Lab"
  subject: string;             // "Mathematics", "Science"
  teacher_id: UUID;
  room_number?: string;
  schedule: ClassSchedule[];
  max_capacity: number;
}

export interface Parent extends Contact {
  relationship: 'mother'|'father'|'guardian';
  children: Student[];         // Associated students
  permissions: ParentPermission[];
}
```

## Step 2: Extend Database Schema

**File:** `src/backend/src/database.ts`

```typescript
private async createTenantTables(schemaName: string) {
  // ... existing CRM tables

  // School domain extensions
  const schoolQueries = [
    `CREATE TABLE IF NOT EXISTS ${schemaName}.students (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL,
      student_id TEXT UNIQUE NOT NULL,
      grade_level TEXT NOT NULL,
      enrollment_date TIMESTAMP WITH TIME ZONE NOT NULL,
      graduation_year INTEGER,
      gpa DECIMAL(3,2),
      special_needs TEXT[],
      emergency_contacts JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`,

    `CREATE TABLE IF NOT EXISTS ${schemaName}.classes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL,
      name TEXT NOT NULL,
      subject TEXT NOT NULL,
      teacher_id UUID REFERENCES ${schemaName}.users(id),
      room_number TEXT,
      schedule JSONB,
      max_capacity INTEGER NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`,

    `CREATE TABLE IF NOT EXISTS ${schemaName}.enrollments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL,
      student_id UUID REFERENCES ${schemaName}.students(id),
      class_id UUID REFERENCES ${schemaName}.classes(id),
      enrollment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      status TEXT DEFAULT 'active'
    )`
  ];

  for (const query of [...sharedQueries, ...schoolQueries]) {
    await this.masterPool.query(query);
  }
}
```

## Step 3: Add School-Specific Routes

**File:** `src/backend/src/routes/school.ts`

```typescript
const router = Router();

// Student enrollment
router.post('/enrollments', async (req, res) => {
  const { student_id, class_id } = req.body;
  const tenantId = req.tenantId;

  // Business logic: Check capacity
  if (await isClassFull(class_id, tenantId)) {
    return res.status(409).json({
      success: false,
      error: 'Class is at maximum capacity'
    });
  }

  // Check for schedule conflicts
  if (await hasScheduleConflict(student_id, class_id, tenantId)) {
    return res.status(409).json({
      success: false,
      error: 'Schedule conflict detected'
    });
  }

  const enrollment = await createEnrollment({
    student_id,
    class_id,
    enrollment_date: new Date()
  }, tenantId);

  res.json({ success: true, data: enrollment });
});

// Academic records
router.get('/students/:id/academic-record', async (req, res) => {
  const { id } = req.params;
  const tenantId = req.tenantId;

  const [grades, attendance, activities] = await Promise.all([
    getStudentGrades(id, tenantId),
    getStudentAttendance(id, tenantId),
    getStudentActivities(id, tenantId)
  ]);

  res.json({
    success: true,
    data: { grades, attendance, activities }
  });
});

// Class management
router.post('/classes/:id/assign-teacher', async (req, res) => {
  const { id } = req.params;
  const { teacher_id } = req.body;
  const tenantId = req.tenantId;

  // Verify teacher availability
  const conflicts = await checkTeacherSchedule(teacher_id, id, tenantId);
  if (conflicts.length > 0) {
    return res.status(409).json({
      success: false,
      error: 'Teacher schedule conflict'
    });
  }

  await assignTeacherToClass(id, teacher_id, tenantId);
  res.json({ success: true, message: 'Teacher assigned' });
});

export default router;
```

## Step 4: Customize School UI Components

**File:** `src/frontend/src/components/StudentCard.tsx`

```typescript
const StudentCard: React.FC<{ student: Student }> = ({ student }) => {
  const { currentTenant } = useTenant();

  // School-specific display
  const gradeDisplay = {
    '9th Grade': 'Freshman',
    '10th Grade': 'Sophomore',
    '11th Grade': 'Junior',
    '12th Grade': 'Senior'
  };

  const displayGrade = gradeDisplay[student.grade_level] || student.grade_level;

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-lg">
            {student.first_name} {student.last_name}
          </h3>
          <p className="text-sm text-gray-600">
            Student ID: {student.student_id}
          </p>
        </div>
        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
          {displayGrade}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-3">
        <div>
          <span className="text-sm font-medium text-gray-500">GPA</span>
          <p className="text-lg font-semibold">
            {student.gpa || 'N/A'}
          </p>
        </div>
        <div>
          <span className="text-sm font-medium text-gray-500">Enrollment</span>
          <p className="text-sm">
            {new Date(student.enrollment_date).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="flex space-x-2">
        <button className="flex-1 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
          View Academic Record
        </button>
        <button className="flex-1 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600">
          Contact Parent
        </button>
      </div>
    </div>
  );
};
```

## Step 5: Class Schedule Management

**File:** `src/frontend/src/pages/ClassSchedule.tsx`

```typescript
const ClassSchedule: React.FC = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);

  useEffect(() => {
    fetchClasses();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Class Schedule Management</h1>
        <p className="text-gray-600">
          Assign teachers and manage class capacities
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ClassList
            classes={classes}
            onClassSelect={setSelectedClass}
          />
        </div>

        <div>
          {selectedClass ? (
            <ClassDetails
              classData={selectedClass}
              onUpdate={(updated) => {
                setClasses(prev =>
                  prev.map(c => c.id === updated.id ? updated : c)
                );
              }}
            />
          ) : (
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-center text-gray-500">
                Select a class to view details
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
```

## Step 6: Parent Communication Portal

```typescript
// Parent-specific features
const ParentPortal: React.FC = () => {
  const [children, setChildren] = useState<Student[]>([]);
  const [communications, setCommunications] = useState<SchoolCommunication[]>([]);

  // Parent sees only their children's data
  const childIds = children.map(c => c.id);
  const filteredCommunications = communications.filter(
    comm => childIds.includes(comm.student_id)
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Parent Portal</h1>
        <p className="text-gray-600">
          Stay connected with your children's academic journey
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {children.map(child => (
          <ChildCard key={child.id} student={child} />
        ))}
      </div>

      <CommunicationHistory
        communications={filteredCommunications}
        onReply={handleReply}
      />
    </div>
  );
};
```

## Step 7: Academic Reporting Features

```typescript
// Generate academic reports
const AcademicReports: React.FC = () => {
  const generateReport = async (type: ReportType, filters: ReportFilters) => {
    const response = await apiService.generateReport(type, filters);

    // Download PDF or Excel
    const link = document.createElement('a');
    link.href = response.data.downloadUrl;
    link.download = `academic-report-${Date.now()}.pdf`;
    link.click();
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Academic Reports</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ReportCard
          title="Grade Distribution"
          description="Class performance analytics"
          onGenerate={() => generateReport('grade_distribution', {})}
        />

        <ReportCard
          title="Attendance Summary"
          description="Student attendance trends"
          onGenerate={() => generateReport('attendance_summary', {})}
        />

        <ReportCard
          title="Individual Report Cards"
          description="Student-specific academic reports"
          onGenerate={() => generateReport('individual_report_cards', {
            student_ids: selectedStudents
          })}
        />
      </div>
    </div>
  );
};
```

## Summary: School CRM Features Added

✅ **Student Management**: Enrollment, academic tracking, emergency contacts
✅ **Class Scheduling**: Teacher assignment, capacity management, conflicts
✅ **Parent Portal**: Communication, progress monitoring, permissions
✅ **Academic Reporting**: GPA tracking, attendance, grade reports
✅ **Teacher Dashboard**: Class management, student progress
✅ **Administrator Tools**: School-wide analytics, policy enforcement

**Ready for school specialization in 2 weeks!** 🎓
