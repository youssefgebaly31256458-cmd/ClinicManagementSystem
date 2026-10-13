# Product

<!-- impeccable:product-schema 1 -->

## Platform
web

## Purpose & Positioning
A centralized Clinic Management System tailored for private outpatient clinics and multi-specialty practices. The system streamlines daily healthcare operations by connecting front-desk patient intake and scheduling with clinical consultation, visit documentation, and prescription issuance.

## Target Audience & Roles
The primary users are clinic healthcare and administrative staff operating in high-volume, accuracy-critical clinic environments:

- **Receptionists**: Manage patient registrations, phone/walk-in intake, doctor scheduling, and appointment check-in.
- **Doctors**: Review assigned daily schedules, conduct patient consultations, record clinical visit notes, and issue digital prescriptions.
- **Clinic Administrators**: Manage staff records, system users, roles, doctor specializations, and maintain clinic-wide operational oversight.

## Core Capabilities & Workflows
1. **Patient Management & Intake**:
   - Register new patient profiles (demographics, phone, address, gender, date of birth).
   - Search and maintain active patient records.
2. **Appointment Scheduling**:
   - Book, reschedule, and cancel patient appointments across doctors and specialties.
   - Real-time status tracking (`Scheduled`, `Completed`, `Cancelled`).
   - Doctor-specific daily appointment queues.
3. **Clinical Visits & Documentation**:
   - Initiate clinical visits linked directly to booked appointments.
   - Record comprehensive doctor consultation notes and patient visit history.
4. **Prescription Management**:
   - Generate structured digital prescriptions linked to completed visits.
   - Maintain historical prescription records per patient and consultation.
5. **Staff & Security Administration**:
   - Role-based account management with credential protection.
   - Dynamic doctor and employee assignment mapped to medical specializations.

## Stack & Architecture
- **Backend API**: ASP.NET Core 9 Web API (.NET C#) structured with clean separation of concerns (API, Business logic, DataAccess).
- **Database & ORM**: Entity Framework Core with Microsoft SQL Server (`ClinicManagmentDB`).
- **Frontend**: React Single Page Application (Vite-powered dev server with static distribution bundle served via ASP.NET Core fallback).
- **Authentication & Security**:
  - JWT (JSON Web Token) bearer authentication with refresh token lifecycle.
  - Strict Role-Based Access Control (`Admin`, `Doctor`, `Receptionist`).
  - Resource-owner authorization handlers ensuring doctors access only their assigned patients and visits.
  - Rate limiting on authentication endpoints to mitigate credential abuse.

## Durable Constraints
- **Data Privacy & Ownership**: Doctors are restricted to accessing their own appointments, visits, and patient prescriptions. Administrative overrides are strictly governed.
- **Operational Reliability**: Front-desk operations (intake and scheduling) must maintain zero-lag workflows to prevent reception bottlenecks.
- **Auditability**: All clinical encounters (appointments, visits, prescriptions) maintain clear temporal links and doctor attribution.
