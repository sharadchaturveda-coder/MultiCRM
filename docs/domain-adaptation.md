# Domain Adaptation Guide (2025)

## 🎯 Overview

Transform your MultiCRM template into specialized CRMs (School, Hospital, Hotel, etc.) through entity extension and business logic customization.

## 🏫 Template Cloning Workflow

### Step 1: Clone Core Template
```bash
# Create new domain-specific CRM
cp -r multicrm school-crm
cd school-crm

# Initialize domain repository
git init
git commit -m "Initial domain: School CRM"
```

### Step 2: Extend Shared Types
**File:** `src/shared/src/types.ts`

Add domain-specific entities:
```typescript
// Existing CRM entities remain unchanged
import { Contact, Organization, User } from './existing-types';

// Student entity extends Contact
export interface Student extends Contact {
  student_id: string;           // School's unique identifier
  grade_level: string;          // "9th Grade", "Senior"
  enrollment_date: string;
  graduation_year?: number;
  gpa?: number;
  special_needs?: string[];
  emergency_contacts: EmergencyContact[];
}

// New domain-specific entities
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

### Step 3: Customize Database Schema
**File:** `src/backend/src/database.ts`

Add domain-specific tables during tenant provisioning:
```typescript
private async createTenantTables(schemaName: string) {
  const sharedQueries = [
    // ... existing CRM tables (users, contacts, etc.)
  ];

  // School domain extensions
  const schoolQueries = [
    `CREATE TABLE IF NOT EXISTS ${schemaName}.students (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      student_id TEXT UNIQUE NOT NULL,
      grade_level TEXT NOT NULL,
      enrollment_date TIMESTAMP WITH TIME ZONE NOT NULL,
      graduation_year INTEGER,
      gpa DECIMAL(3,2),
      special_needs TEXT[],
      emergency_contacts JSONB,
      tenant_id UUID NOT NULL REFERENCES ${schemaName}.tenants(id),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`,

    `CREATE TABLE IF NOT EXISTS ${schemaName}.classes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      subject TEXT NOT NULL,
      teacher_id UUID REFERENCES ${schemaName}.users(id),
      room_number TEXT,
      schedule JSONB,
      max_capacity INTEGER NOT NULL,
      tenant_id UUID NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`
  ];

  for (const query of [...sharedQueries, ...schoolQueries]) {
    await this.masterPool.query(query);
  }
}
```

## 🏥 Hospital CRM Adaptation

### Domain Entities
```typescript
export interface Patient extends Contact {
  patient_id: string;
  medical_record_number: string;
  date_of_birth: string;
  blood_type?: 'A+'|'A-'|'B+'|'B-'|'AB+'|'AB-'|'O+'|'O-';
  allergies: string[];
  current_conditions: MedicalCondition[];
  medications: Medication[];
}

export interface Appointment extends TenantEntity {
  patient_id: UUID;
  doctor_id: UUID;
  appointment_time: Timestamp;
  duration_minutes: number;
  status: 'scheduled'|'confirmed'|'in_progress'|'completed'|'cancelled';
  reason: string;
  notes?: string;
}
```

### Business Logic Extensions
```typescript
// src/backend/src/routes/patients.ts
router.post('/appointments', async (req, res) => {
  const { patient_id, doctor_id, appointment_time } = req.body;

  // Hospital-specific validation
  const conflicts = await checkDoctorAvailability(doctor_id, appointment_time);
  if (conflicts.length > 0) {
    return res.status(409).json({
      success: false,
      error: 'Time slot unavailable',
      conflicts
    });
  }

  // Eligibility check
  const patient = await getPatient(patient_id);
  if (patient.insurance_status !== 'active') {
    return res.status(422).json({
      success: false,
      error: 'Insurance verification required'
    });
  }

  // Create appointment with domain logic
  const appointment = await createAppointment(req.body);
  res.json({ success: true, data: appointment });
});
```

## 🏨 Hotel CRM Adaptation

### Domain Entities
```typescript
export interface Guest extends Contact {
  guest_id: string;
  preferred_room_type?: 'standard'|'deluxe'|'suite';
  vip_status?: boolean;
  frequent_guest_points: number;
  special_requests?: string[];
  reservation_history: ReservationSummary[];
}

export interface Reservation extends TenantEntity {
  guest_id: UUID;
  room_id: UUID;
  check_in_date: string;
  check_out_date: string;
  number_of_guests: number;
  total_amount: Decimal;
  status: 'confirmed'|'checked_in'|'checked_out'|'cancelled';
  special_requests?: string;
}

export interface Room extends TenantEntity {
  room_number: string;
  room_type: 'standard'|'deluxe'|'suite';
  floor: number;
  capacity: number;
  amenities: string[];
  current_status: 'available'|'occupied'|'maintenance'|'out_of_order';
  rate_per_night: Decimal;
}
```

### UI Component Extensions
```typescript
// src/frontend/src/pages/RoomManagement.tsx
const RoomManagement: React.FC = () => {
  const rooms = useQuery(['rooms'], () => apiService.getRooms());

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {rooms.data?.map(room => (
        <div key={room.id} className={`
          p-4 rounded-lg border-2
          ${room.current_status === 'available' ? 'border-green-200 bg-green-50' : ''}
          ${room.current_status === 'occupied' ? 'border-red-200 bg-red-50' : ''}
          ${room.current_status === 'maintenance' ? 'border-yellow-200 bg-yellow-50' : ''}
        `}>
          <h3 className="text-lg font-semibold">Room {room.room_number}</h3>
          <p className="text-sm text-gray-600">{room.room_type}</p>
          <div className="mt-2">
            <span className={`px-2 py-1 rounded text-xs font-medium
              ${room.current_status === 'available' ? 'bg-green-100 text-green-800' : ''}
              ${room.current_status === 'occupied' ? 'bg-red-100 text-red-800' : ''}
            `}>
              {room.current_status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
```

## 🏭 Generic CRM to Domain CRM Process

### Step 1: Define Business Requirements
```typescript
// specs/school-crm/spec.md
interface SchoolRequirements {
  student_management: {
    enrollment_tracking: true;
    academic_records: true;
    parent_communication: true;
    grade_reporting: true;
  };
  class_management: {
    scheduling: true;
    teacher_assignment: true;
    capacity_management: true;
  };
  reporting: {
    attendance_reports: true;
    academic_performance: true;
    demographic_analysis: true;
  };
}
```

### Step 2: Extend Core Entities
```typescript
// Extend rather than replace core entities
export interface SchoolContact extends Contact {
  contact_type: 'student'|'parent'|'teacher'|'staff';
  school_specific_data: StudentData | ParentData | TeacherData;
}

// Selective inheritance pattern
export interface StudentData {
  // School-specific fields for students
  student_id: string;
  current_grade: string;
}

export interface ParentData {
  // School-specific fields for parents
  relationship_to_student: string[];
  communication_preferences: string[];
}
```

### Step 3: Add Domain-Specific Routes
```typescript
// src/backend/src/routes/school.ts
const router = Router();

// Extend existing endpoints
router.get('/contacts/students', async (req, res) => {
  const students = await contactService.getContacts({
    contact_type: 'student',
    ...req.query
  });
  res.json({ success: true, data: students });
});

router.post('/enrollments', async (req, res) => {
  const { student_id, class_id } = req.body;

  // Domain-specific business logic
  if (await isClassFull(class_id)) {
    return res.status(409).json({
      success: false,
      error: 'Class is at maximum capacity'
    });
  }

  const enrollment = await createEnrollment({
    student_id,
    class_id,
    enrollment_date: new Date()
  });

  res.json({ success: true, data: enrollment });
});
```

### Step 4: Customize Frontend Components
```typescript
// src/frontend/src/components/StudentCard.tsx
const StudentCard: React.FC<{ student: Student }> = ({ student }) => {
  const { currentTenant } = useTenant();

  // Domain-specific display logic
  const displayName = currentTenant?.domain === 'school'
    ? `${student.first_name} ${student.last_name} (${student.student_id})`
    : `${student.first_name} ${student.last_name}`;

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="font-bold">{displayName}</h3>
      {student.grade_level && (
        <p className="text-sm text-gray-600">Grade: {student.grade_level}</p>
      )}
      <p className="text-sm">GPA: {student.gpa || 'N/A'}</p>
      {/* Domain-specific actions */}
      <button className="mt-2 px-3 py-1 bg-blue-500 text-white rounded">
        View Academic Record
      </button>
    </div>
  );
};
```

## 🔄 Shared Infrastructure Patterns

### Multi-Domain Backend Architecture
```typescript
// src/backend/src/modules/domains/index.ts
export interface DomainModule {
  name: string;
  entities: DomainEntity[];
  routes: Router;
  migrations: Migration[];
  validations: ValidationRule[];
}

// Registry pattern for domain loading
const domainRegistry = new Map<string, DomainModule>();

export const registerDomain = (domain: DomainModule) => {
  domainRegistry.set(domain.name, domain);
};

// Dynamic domain integration
export const initializeDomains = (app: Express) => {
  for (const domain of domainRegistry.values()) {
    // Add domain routes under /api/domain-name/
    app.use(`/api/${domain.name}`, domain.routes);

    // Apply domain-specific validations
    // Run domain migrations
  }
};
```

### Configuration-Driven Extension
```typescript
// Domain configuration file
interface DomainConfig {
  name: 'school' | 'hospital' | 'hotel';
  features: FeatureFlags;
  custom_fields: CustomField[];
  workflows: WorkflowDefinition[];
  validations: BusinessRule[];
}

// Runtime domain loading
const loadDomain = (config: DomainConfig) => {
  switch (config.name) {
    case 'school':
      return new SchoolDomain(config);
    case 'hospital':
      return new HospitalDomain(config);
    default:
      return new GenericCRMDomain(config);
  }
};
```

## 📊 Testing Domain Adaptations

### Entity Extension Testing
```typescript
// __tests__/domains/school.test.ts
describe('School Domain Extensions', () => {
  it('should create student with school-specific fields', async () => {
    const studentData = {
      first_name: 'Alice',
      last_name: 'Johnson',
      student_id: 'STU2025001',
      grade_level: '10th Grade',
      enrollment_date: '2025-08-25'
    };

    const student = await createStudent(studentData);

    expect(student.student_id).toBe('STU2025001');
    expect(student.grade_level).toBe('10th Grade');
    // Verify core Contact fields still work
    expect(student.first_name).toBe('Alice');
  });
});
```

### Business Logic Testing
```typescript
describe('Hospital Appointment Scheduling', () => {
  it('should prevent double-booking doctors', async () => {
    // Arrange
    const doctor = await createDoctor({ name: 'Dr. Smith' });
    const time = '2025-10-15T10:00:00Z';

    // First appointment
    await createAppointment({ doctor_id: doctor.id, appointment_time: time });

    // Second conflicting appointment should fail
    await expect(
      createAppointment({ doctor_id: doctor.id, appointment_time: time })
    ).rejects.toThrow('Time slot unavailable');
  });
});
```

## 🚀 Deployment Considerations

### Database Migration Strategy
```bash
# Domain-specific migrations
npm run migrate:domain -- --domain=school

# Backward compatibility ensures generic CRM features work
# Domain features are additive, not replacing
```

### Feature Flags
```typescript
// Runtime feature toggling
const features = {
  school_enrollment: true,
  hospital_appointments: false,
  hotel_reservations: true
};

if (features.school_enrollment) {
  app.use('/api/students', studentRoutes);
}
```

## 📚 Best Practices

### 1. Extension Over Replacement
- **Always extend** rather than replace core entities
- Maintain backward compatibility with generic CRM
- Use composition for complex domain relationships

### 2. Consistent API Patterns
- Domain routes follow `/api/domain-name/entity-pattern`
- Error responses maintain consistent structure
- Pagination and filtering work uniformly

### 3. Type Safety in Extensions
- Domain-specific types extend base types
- Shared type definitions prevent drift
- Runtime validation with compile-time type checking

### 4. Testing Strategy
- Unit tests for domain-specific logic
- Integration tests for full workflows
- Compatibility tests with base CRM features

## 🎯 Domain Template Checklist

**Before going live with domain adaptations:**

- [ ] Core CRM features tested and working
- [ ] Domain entities properly typed and documented
- [ ] Database schema migrations prepared
- [ ] API routes following consistent patterns
- [ ] Frontend components handling domain data
- [ ] Business logic validations implemented
- [ ] Unit and integration tests passing
- [ ] Documentation updated with domain specifics
- [ ] Deployment pipeline configured for domain
- [ ] Backward compatibility verified

---

**Result:** From template clone to specialized CRM in **2 weeks, $5k-$20k** (vs traditional 3-6 months, $50k-$200k).

**Next:** [Development Workflow](development.md) for contribution guidelines and SDD process.
