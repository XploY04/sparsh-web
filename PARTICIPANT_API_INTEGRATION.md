# Clinical Trial Participant API Integration Guide

This document provides comprehensive API documentation for integrating participant-side applications with the clinical trial management system.

## Base URL

```
https://your-domain.com/api
```

## Authentication

The system uses NextAuth.js for authentication. Most participant operations don't require authentication, but some administrative functions do.

### Authentication Endpoint

- **POST** `/auth/signin`

## Core Participant APIs

### 1. Participant Registration/Enrollment

#### Register New User Account

- **Endpoint:** `POST /register`
- **Description:** Creates a new user account (typically for study coordinators)
- **Authentication:** Not required for registration
- **Request Body:**

```json
{
  "email": "participant@example.com",
  "password": "securePassword123",
  "role": "participant"
}
```

- **Response:**

```json
{
  "id": "user_id",
  "email": "participant@example.com",
  "role": "participant"
}
```

- **Error Codes:**
  - `400`: User already exists
  - `500`: Internal server error

### 2. Data Submission

#### Submit Data Points

- **Endpoint:** `POST /data`
- **Description:** Submit various types of participant data (symptoms, vitals, medication intake, etc.)
- **Authentication:** Not required
- **Request Body:**

```json
{
  "participantCode": "PART001",
  "type": "SymptomReport",
  "payload": {
    "symptoms": ["headache", "nausea"],
    "severity": 6,
    "duration": "2 hours",
    "notes": "Started after breakfast"
  }
}
```

#### Supported Data Types and Payload Structures:

##### 1. Symptom Report

```json
{
  "participantCode": "PART001",
  "type": "SymptomReport",
  "payload": {
    "symptoms": ["headache", "nausea", "fatigue"],
    "severity": 7,
    "duration": "3 hours",
    "notes": "Additional notes",
    "location": "head",
    "triggers": ["stress", "food"]
  }
}
```

##### 2. Vital Signs

```json
{
  "participantCode": "PART001",
  "type": "VitalSigns",
  "payload": {
    "heartRate": 72,
    "bloodPressure": {
      "systolic": 120,
      "diastolic": 80
    },
    "temperature": 98.6,
    "weight": 150,
    "height": 170,
    "oxygenSaturation": 98
  }
}
```

##### 3. Medication Intake

```json
{
  "participantCode": "PART001",
  "type": "MedicationIntake",
  "payload": {
    "medicationName": "Study Drug A",
    "dosage": "10mg",
    "timesTaken": 1,
    "adherence": true,
    "sideEffects": ["mild nausea"],
    "notes": "Taken with food"
  }
}
```

##### 4. Side Effects

```json
{
  "participantCode": "PART001",
  "type": "SideEffect",
  "payload": {
    "effect": "nausea",
    "severity": "moderate",
    "startTime": "2024-01-15T10:30:00Z",
    "duration": "2 hours",
    "relatedMedication": "Study Drug A",
    "actionTaken": "reduced activity"
  }
}
```

##### 5. Quality of Life

```json
{
  "participantCode": "PART001",
  "type": "QualityOfLife",
  "payload": {
    "overallRating": 7,
    "physicalFunction": 8,
    "emotionalWellbeing": 6,
    "socialFunction": 7,
    "painLevel": 3,
    "energyLevel": 6,
    "sleepQuality": 5
  }
}
```

##### 6. Emergency Call

```json
{
  "participantCode": "PART001",
  "type": "EmergencyCall",
  "payload": {
    "reason": "severe adverse reaction",
    "severity": "critical",
    "description": "Difficulty breathing and chest pain",
    "location": "home",
    "emergencyContact": "called 911"
  }
}
```

##### 7. App Usage

```json
{
  "participantCode": "PART001",
  "type": "AppUsage",
  "payload": {
    "sessionDuration": 900,
    "featuresUsed": ["symptom_tracker", "medication_reminder"],
    "interactionCount": 15,
    "completedTasks": ["daily_survey", "medication_log"]
  }
}
```

**Response:**

```json
{
  "success": true,
  "dataPoint": {
    "id": "datapoint_id",
    "type": "SymptomReport",
    "isAlert": false,
    "severity": "low",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

**Alert Generation Rules:**

- **Critical Alerts:** Emergency calls
- **High Alerts:** Severe side effects, very high blood pressure (>180/110)
- **Medium Alerts:** High symptom severity (≥8), abnormal heart rate (<50 or >120 bpm)
- **Low Alerts:** Default for other data types

### 3. Data Retrieval

#### Get Data Points

- **Endpoint:** `GET /data`
- **Description:** Retrieve participant data points with filtering options
- **Authentication:** Not required
- **Query Parameters:**
  - `participantCode` (string): Filter by participant code
  - `type` (string): Filter by data type
  - `limit` (number): Maximum number of results (default: 50)

**Example Request:**

```
GET /data?participantCode=PART001&type=SymptomReport&limit=20
```

**Response:**

```json
{
  "dataPoints": [
    {
      "_id": "datapoint_id",
      "participantId": "participant_object_id",
      "trialId": "trial_object_id",
      "type": "SymptomReport",
      "payload": {
        "symptoms": ["headache"],
        "severity": 5
      },
      "timestamp": "2024-01-15T10:30:00Z",
      "isAlert": false,
      "severity": "low"
    }
  ]
}
```

### 4. Participant Information

#### Get Participant Details

- **Endpoint:** `GET /participants/{participantId}`
- **Description:** Retrieve detailed participant information
- **Authentication:** Required
- **Path Parameters:**
  - `participantId` (string): The participant's unique ID

**Response:**

```json
{
  "_id": "participant_id",
  "participantCode": "PART001",
  "trialId": {
    "_id": "trial_id",
    "title": "Phase II Clinical Trial",
    "description": "Study description"
  },
  "status": "active",
  "assignedGroup": 1,
  "enrollmentDate": "2024-01-01T00:00:00Z",
  "isUnblinded": false,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

#### Get Participant Timeline

- **Endpoint:** `GET /participants/{participantId}/timeline`
- **Description:** Retrieve participant's data timeline grouped by date
- **Authentication:** Required
- **Query Parameters:**
  - `limit` (number): Maximum number of data points (default: 100)
  - `type` (string): Filter by specific data type

**Response:**

```json
{
  "participantId": "participant_id",
  "participantCode": "PART001",
  "timeline": [
    {
      "date": "2024-01-15",
      "dataPoints": [
        {
          "_id": "datapoint_id",
          "type": "SymptomReport",
          "payload": { "symptoms": ["headache"], "severity": 5 },
          "timestamp": "2024-01-15T10:30:00Z",
          "isAlert": false
        }
      ],
      "totalCount": 3,
      "alertCount": 1
    }
  ],
  "summary": {
    "totalDataPoints": 25,
    "totalAlerts": 3,
    "dataTypes": ["SymptomReport", "VitalSigns", "MedicationIntake"],
    "dateRange": {
      "earliest": "2024-01-01T00:00:00Z",
      "latest": "2024-01-15T10:30:00Z"
    }
  }
}
```

## Error Handling

All API endpoints return consistent error responses:

```json
{
  "error": "Error message description",
  "details": "Additional error details (optional)"
}
```

### Common HTTP Status Codes:

- `200`: Success
- `400`: Bad Request (missing required fields, invalid data)
- `401`: Unauthorized (authentication required)
- `404`: Not Found (participant or resource not found)
- `500`: Internal Server Error

## Data Models

### Participant Status Enum

- `enrolled`: Initially enrolled
- `active`: Actively participating
- `completed`: Completed the trial
- `withdrawn`: Withdrawn from trial

### Data Type Enum

- `SymptomReport`: Participant-reported symptoms
- `VitalSigns`: Physiological measurements
- `MedicationIntake`: Medication adherence data
- `EmergencyCall`: Emergency situations
- `SideEffect`: Adverse events
- `QualityOfLife`: Quality of life assessments
- `AppUsage`: Mobile app interaction data
- `Other`: Other custom data types

### Alert Severity Levels

- `low`: Routine data
- `medium`: Requires attention
- `high`: Urgent attention needed
- `critical`: Immediate action required

## Integration Best Practices

### 1. Data Submission

- Submit data as soon as possible after collection
- Include comprehensive payload information
- Use consistent participant codes
- Handle network failures gracefully with retry logic

### 2. Error Handling

- Implement exponential backoff for retries
- Store data locally if network is unavailable
- Validate data before submission
- Log all API interactions for debugging

### 3. Security

- Never store sensitive data in plain text
- Implement proper SSL/TLS encryption
- Validate all inputs on client side
- Follow data privacy regulations (HIPAA, GDPR)

### 4. Performance

- Batch data submissions when possible
- Use appropriate pagination for data retrieval
- Cache frequently accessed data
- Monitor API response times

## Example Implementation (JavaScript)

```javascript
class ClinicalTrialAPI {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  async submitData(participantCode, type, payload) {
    try {
      const response = await fetch(`${this.baseURL}/data`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          participantCode,
          type,
          payload,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Failed to submit data:", error);
      throw error;
    }
  }

  async getParticipantData(participantCode, type = null, limit = 50) {
    try {
      const params = new URLSearchParams({
        participantCode,
        limit: limit.toString(),
      });

      if (type) params.append("type", type);

      const response = await fetch(`${this.baseURL}/data?${params}`);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Failed to get participant data:", error);
      throw error;
    }
  }
}

// Usage example
const api = new ClinicalTrialAPI("https://your-domain.com/api");

// Submit symptom report
await api.submitData("PART001", "SymptomReport", {
  symptoms: ["headache", "nausea"],
  severity: 6,
  duration: "2 hours",
});

// Get participant's vital signs
const vitals = await api.getParticipantData("PART001", "VitalSigns");
```

## Testing

Use the following test participant codes for development:

- `TEST001` - Test participant with sample data
- `TEST002` - Test participant for alert scenarios
- `TEST003` - Test participant for timeline functionality

## Support

For technical support or questions about API integration:

- Review the error messages and status codes
- Check the audit logs for debugging information
- Ensure participant codes are valid and active
- Verify data payload structure matches the specifications

This API documentation provides all necessary endpoints and data structures for building a comprehensive participant-side application for clinical trial data collection and monitoring.
