# VSC_Insurance_App_Backend

## Lead Management API Endpoints

### Get all leads
```
GET /v1/leads
```

### Create a new lead
```
POST /v1/leads
```

### Get leads by user ID
```
GET /v1/leads/user/:userId
```

### Get a specific lead
```
GET /v1/leads/:leadId
```

### Update a lead
```
PATCH /v1/leads/:leadId
```

### Delete a lead
```
DELETE /v1/leads/:leadId
```

### Update lead fields data
```
PATCH /v1/leads/:leadId/fields
```

Example payload:
```json
{
  "fieldsData": {
    "Name": "Akshay",
    "mobile": "7878267700",
    "address": "123 Main St",
    "email": "akshay@example.com"
  }
}
```

### Add a follow-up to a lead
```
POST /v1/leads/:leadId/follow-up
```

### Add a note to a lead
```
POST /v1/leads/:leadId/notes
```

### Get lead statistics
```
GET /v1/leads/stats
```

### Assign a lead to an agent
```
POST /v1/leads/:leadId/assign
```
